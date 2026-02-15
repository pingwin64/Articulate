import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── Rate Limits (per hour) ─────────────────────────────────────
const RATE_LIMITS: Record<string, { free: number; premium: number }> = {
  "generate-quiz": { free: 5, premium: 50 },
  "parse-pdf": { free: 3, premium: 30 },
  "scan-image": { free: 5, premium: 50 },
  "generate-text": { free: 3, premium: 30 },
  "generate-personalized-text": { free: 3, premium: 30 },
  "generate-wind-down-text": { free: 3, premium: 30 },
  "transcribe-audio": { free: 10, premium: 100 },
  "fetch-etymology": { free: 5, premium: 50 },
};

// Actions that require premium (server-side gate as safety net)
const PREMIUM_ONLY_ACTIONS = new Set([
  "generate-personalized-text",
  "generate-wind-down-text",
]);

// ─── Prompts ────────────────────────────────────────────────────
const QUIZ_SYSTEM_PROMPT = `You are a reading comprehension quiz generator. Given a text passage, generate exactly 3 multiple-choice comprehension questions. Each question should test understanding of specific details from the passage.

Respond ONLY with a JSON array in this exact format:
[
  {
    "question": "The question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Rules:
- Each question must have exactly 4 options
- correctIndex is 0-based (0, 1, 2, or 3)
- Questions should be about specific details from the text
- Do not include questions that can be answered without reading the text
- Keep questions and options concise`;

const PDF_PROMPT =
  "Extract all readable text from this PDF. Return ONLY plain text paragraphs. No markdown, no commentary.";

const SCAN_IMAGE_PROMPT =
  "Extract all readable text from this image. Return ONLY the text as plain paragraphs. No markdown, no headers, no commentary. If no text is visible, respond with exactly: NO_TEXT_FOUND";

// ─── Helpers ────────────────────────────────────────────────────

async function checkPremiumStatus(userId: string): Promise<boolean> {
  if (userId === "anonymous") return false;
  try {
    const { data } = await supabase
      .from("user_subscriptions")
      .select("is_premium, expires_at")
      .eq("rc_user_id", userId)
      .maybeSingle();

    if (!data) return false;
    if (!data.is_premium) return false;
    // If has expiration, check it hasn't passed
    if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
    return true;
  } catch {
    return false;
  }
}

function getWindowStart(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now.toISOString();
}

async function checkRateLimit(
  userId: string,
  action: string,
  isPremium: boolean
): Promise<{ blocked: boolean; remaining: number }> {
  const limits = RATE_LIMITS[action];
  if (!limits) return { blocked: false, remaining: 999 };

  const limit = isPremium ? limits.premium : limits.free;
  const windowStart = getWindowStart();

  try {
    const { data, error } = await supabase.rpc("increment_rate_limit", {
      p_user_id: userId,
      p_action: action,
      p_window_start: windowStart,
      p_limit: limit,
    });

    if (error) {
      console.error("Rate limit RPC error:", error);
      // Fail open — don't block on DB errors
      return { blocked: false, remaining: limit };
    }

    return {
      blocked: data?.blocked ?? false,
      remaining: data?.remaining ?? limit,
    };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    return { blocked: false, remaining: limit };
  }
}

function logUsage(
  userId: string,
  action: string,
  isPremium: boolean,
  statusCode: number,
  startTime: number,
  extra?: { errorMessage?: string; openaiModel?: string; metadata?: Record<string, unknown> }
) {
  // Fire-and-forget — don't await
  const durationMs = Date.now() - startTime;
  supabase
    .from("usage_logs")
    .insert({
      user_id: userId,
      action,
      is_premium: isPremium,
      status_code: statusCode,
      error_message: extra?.errorMessage ?? null,
      openai_model: extra?.openaiModel ?? null,
      duration_ms: durationMs,
      metadata: extra?.metadata ?? {},
    })
    .then(({ error }) => {
      if (error) console.error("Usage log insert error:", error);
    });
}

// ─── Main Handler ───────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, apikey, x-client-info, x-user-id",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!OPENAI_API_KEY) {
    return json({ error: "OpenAI API key not configured" }, 500);
  }

  const startTime = Date.now();
  const userId = req.headers.get("x-user-id") || "anonymous";

  try {
    const body = await req.json();
    const { action } = body;

    if (!action || typeof action !== "string") {
      return json({ error: "Missing action" }, 400);
    }

    // ─── Premium check ──────────────────────────────────────
    const isPremium = await checkPremiumStatus(userId);

    if (PREMIUM_ONLY_ACTIONS.has(action) && !isPremium) {
      logUsage(userId, action, false, 403, startTime, {
        errorMessage: "Premium required",
      });
      return json(
        { error: "This feature requires a premium subscription" },
        403
      );
    }

    // ─── Rate limiting ──────────────────────────────────────
    const { blocked, remaining } = await checkRateLimit(
      userId,
      action,
      isPremium
    );

    if (blocked) {
      logUsage(userId, action, isPremium, 429, startTime, {
        errorMessage: "Rate limited",
      });
      return json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: 3600,
          remaining: 0,
        },
        429
      );
    }

    // ─── Payload size limits (10MB base64 ≈ 7.5MB file) ────
    const MAX_PAYLOAD = 10 * 1024 * 1024;
    if (body.fileData && typeof body.fileData === "string" && body.fileData.length > MAX_PAYLOAD) {
      return json({ error: "File too large. Maximum 10MB." }, 413);
    }
    if (body.imageData && typeof body.imageData === "string" && body.imageData.length > MAX_PAYLOAD) {
      return json({ error: "Image too large. Maximum 10MB." }, 413);
    }
    if (body.audioData && typeof body.audioData === "string" && body.audioData.length > MAX_PAYLOAD) {
      return json({ error: "Audio too large. Maximum 10MB." }, 413);
    }

    // ─── Route to handler ───────────────────────────────────
    let result: Response;

    if (action === "generate-quiz") {
      result = await handleGenerateQuiz(body.text);
    } else if (action === "parse-pdf") {
      result = await handleParsePDF(body.fileData, body.model);
    } else if (action === "scan-image") {
      result = await handleScanImage(body.imageData);
    } else if (action === "generate-text") {
      result = await handleGenerateText(body.level, body.category, body.wordCount);
    } else if (action === "generate-personalized-text") {
      result = await handleGeneratePersonalizedText(body.payload);
    } else if (action === "generate-wind-down-text") {
      result = await handleGeneratePersonalizedText(body.payload);
    } else if (action === "transcribe-audio") {
      result = await handleTranscribeAudio(body.audioData);
    } else if (action === "fetch-etymology") {
      result = await handleFetchEtymology(body.word);
    } else {
      return json({ error: "Unknown action" }, 400);
    }

    // ─── Log usage ──────────────────────────────────────────
    logUsage(userId, action, isPremium, result.status, startTime, {
      openaiModel: getModelForAction(action, body),
      metadata: { remaining },
    });

    return result;
  } catch (err) {
    logUsage(userId, "unknown", false, 500, startTime, {
      errorMessage: err instanceof Error ? err.message : "Internal error",
    });
    return json(
      { error: err instanceof Error ? err.message : "Internal error" },
      500
    );
  }
});

function getModelForAction(action: string, body: any): string {
  if (action === "parse-pdf") {
    const allowedModels = ["gpt-4o-mini", "gpt-4o"];
    return allowedModels.includes(body.model) ? body.model : "gpt-4o-mini";
  }
  if (action === "transcribe-audio") return "whisper-1";
  return "gpt-4o-mini";
}

// ─── Action Handlers ────────────────────────────────────────────

async function handleGenerateQuiz(text: string) {
  if (!text || text.length < 20) {
    return json({ error: "Text too short for quiz generation" }, 400);
  }

  const trimmed = text.slice(0, 8000);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: QUIZ_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate comprehension questions for this text:\n\n${trimmed}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    return json(
      { error: err?.error?.message ?? `OpenAI error: ${response.status}` },
      response.status === 429 ? 429 : 502
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return json({ error: "Failed to parse quiz response" }, 502);
  }

  try {
    const questions = JSON.parse(jsonMatch[0]);
    return json({ questions });
  } catch {
    return json({ error: "Failed to parse quiz response" }, 502);
  }
}

async function handleParsePDF(fileData: string, model: string) {
  if (!fileData) {
    return json({ error: "No file data provided" }, 400);
  }

  const allowedModels = ["gpt-4o-mini", "gpt-4o"];
  const safeModel = allowedModels.includes(model) ? model : "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: safeModel,
      temperature: 0,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: "document.pdf",
                file_data: fileData,
              },
            },
            { type: "text", text: PDF_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    return json(
      { error: err?.error?.message ?? `OpenAI error: ${response.status}` },
      response.status === 429 ? 429 : 502
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return json({ text });
}

async function handleScanImage(imageData: string) {
  if (!imageData) {
    return json({ error: "No image data provided" }, 400);
  }

  const imageUrl = imageData.startsWith("data:")
    ? imageData
    : `data:image/jpeg;base64,${imageData}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
            { type: "text", text: SCAN_IMAGE_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    return json(
      { error: err?.error?.message ?? `OpenAI error: ${response.status}` },
      response.status === 429 ? 429 : 502
    );
  }

  const data = await response.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();

  if (!text || text === "NO_TEXT_FOUND") {
    return json({ error: "No readable text found in this image" }, 422);
  }

  return json({ text });
}

async function handleGenerateText(
  level: number,
  category: string,
  wordCount: number
) {
  if (typeof level !== 'number' || !category || typeof category !== 'string') {
    return json({ error: "Missing level or category" }, 400);
  }

  // Sanitize category to prevent prompt injection (alphanumeric, spaces, hyphens, max 100 chars)
  const safeCategory = category.replace(/[^a-zA-Z0-9 \-&,]/g, '').slice(0, 100);
  if (!safeCategory) {
    return json({ error: "Invalid category" }, 400);
  }

  const safeWordCount = Math.max(100, Math.min(wordCount || 300, 1000));

  const tierDescriptions: Record<string, string> = {
    beginner:
      "Use common everyday vocabulary (top 3000 words). Short, simple sentences (8-12 words). Concrete, familiar topics.",
    intermediate:
      "Use standard vocabulary with occasional uncommon words. Compound sentences (12-18 words). Cultural and varied topics.",
    advanced:
      "Use rich, SAT-level vocabulary. Complex sentence structures (18-25 words). Abstract and philosophical topics requiring inference.",
    expert:
      "Use academic and literary vocabulary. Dense, multi-clause sentences (25+ words). Specialized topics with nuanced arguments.",
    master:
      "Use scholarly vocabulary across disciplines. Sophisticated prose with layered meaning. Paradoxes, ambiguity, and complex reasoning.",
  };

  const tier =
    level <= 3
      ? "beginner"
      : level <= 6
        ? "intermediate"
        : level <= 9
          ? "advanced"
          : level <= 12
            ? "expert"
            : "master";

  const prompt = `Generate a ${safeWordCount}-word reading passage about ${safeCategory}.
Difficulty: Level ${level} (${tier}).
${tierDescriptions[tier] ?? tierDescriptions.master}
The text should be engaging, coherent, and educational. Return a JSON object with exactly two fields: "title" (a short title for the passage) and "text" (the passage text). No markdown, no extra commentary.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a reading passage generator. Generate engaging, coherent reading passages at the specified difficulty level. Always respond with valid JSON containing 'title' and 'text' fields.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    return json(
      { error: err?.error?.message ?? `OpenAI error: ${response.status}` },
      response.status === 429 ? 429 : 502
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return json({ title: parsed.title, text: parsed.text });
    }
    return json({ title: category, text: content });
  } catch {
    return json({ title: category, text: content });
  }
}

async function handleGeneratePersonalizedText(payload: {
  level: number;
  levelName: string;
  category: string;
  wordCount: number;
  favoriteGenres: string[];
  savedWordSamples: string[];
  savedWordCategories: string[];
  difficultyPreference: string;
  recentTitles: string[];
  recentAITopics: string[];
  isNewUser: boolean;
  currentStreak: number;
  avgWPM: number;
}) {
  if (!payload?.category) {
    return json({ error: "Missing category in payload" }, 400);
  }

  const safeWordCount = Math.max(100, Math.min(payload.wordCount || 200, 500));

  const tierDescriptions: Record<string, string> = {
    Beginner:
      "Use common everyday vocabulary (top 3000 words). Short, simple sentences (8-12 words). Concrete, familiar topics.",
    Intermediate:
      "Use standard vocabulary with occasional uncommon words. Compound sentences (12-18 words). Cultural and varied topics.",
    Advanced:
      "Use rich, SAT-level vocabulary. Complex sentence structures (18-25 words). Abstract and philosophical topics requiring inference.",
    Expert:
      "Use academic and literary vocabulary. Dense, multi-clause sentences (25+ words). Specialized topics with nuanced arguments.",
    Master:
      "Use scholarly vocabulary across disciplines. Sophisticated prose with layered meaning. Paradoxes, ambiguity, and complex reasoning.",
  };

  const tierDesc = tierDescriptions[payload.levelName] ?? tierDescriptions.Intermediate;

  const avoidTitles = [...(payload.recentTitles || []), ...(payload.recentAITopics || [])]
    .filter(Boolean)
    .slice(0, 10);
  const avoidanceClause = avoidTitles.length > 0
    ? `\nDo NOT reuse or closely paraphrase any of these recent titles: ${avoidTitles.map(t => `"${t}"`).join(", ")}.`
    : "";

  const wordBreadcrumbs = (payload.savedWordSamples || []).length > 0
    ? `\nThe reader has shown interest in words like: ${payload.savedWordSamples.join(", ")}. Let these hint at the reader's intellectual interests — weave similar vocabulary naturally.`
    : "";

  const genreHint = (payload.favoriteGenres || []).length > 0
    ? `Their favorite genres are: ${payload.favoriteGenres.join(", ")}.`
    : "";

  const diffHint = payload.difficultyPreference === "challenging"
    ? "The reader prefers challenging material — lean into complexity."
    : payload.difficultyPreference === "accessible"
      ? "The reader prefers accessible material — keep it clear and inviting."
      : "";

  const newUserHint = payload.isNewUser
    ? "\nThis is a new reader — make the text welcoming, clear, and immediately engaging. Hook them in the first sentence."
    : "";

  const streakHint = payload.currentStreak >= 7
    ? "\nThe reader has a strong reading streak. You may subtly weave themes of persistence, growth, or daily practice if it fits the genre naturally — but don't force it."
    : "";

  const systemPrompt = `You are a literary curator crafting a personalized daily reading for a specific reader. Your goal is to write something that feels hand-picked — not generic.

Reader profile:
- Reading level: ${payload.levelName} (Level ${payload.level}/5)
- ${tierDesc}
- ${genreHint}
- ${diffHint}
- Reading pace: ~${payload.avgWPM} WPM${wordBreadcrumbs}${newUserHint}${streakHint}

Guidelines:
- Write an evocative, specific title — not generic (e.g., "The Beekeeper's Last Summer" not "A Story About Nature")
- The text should feel curated for THIS reader
- Maintain literary quality appropriate to the difficulty level
- Be engaging from the very first sentence${avoidanceClause}

Always respond with valid JSON containing exactly two fields: "title" and "text". No markdown, no extra commentary.`;

  const userPrompt = `Write a ${safeWordCount}-word ${payload.category} passage. Return JSON with "title" and "text" fields.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    return json(
      { error: err?.error?.message ?? `OpenAI error: ${response.status}` },
      response.status === 429 ? 429 : 502
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return json({ title: parsed.title, text: parsed.text });
    }
    return json({ title: payload.category, text: content });
  } catch {
    return json({ title: payload.category, text: content });
  }
}

async function handleTranscribeAudio(audioData: string) {
  if (!audioData) {
    return json({ error: "No audio data provided" }, 400);
  }

  const binaryString = atob(audioData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([bytes], { type: "audio/m4a" }),
    "recording.m4a"
  );
  formData.append("model", "whisper-1");
  formData.append("language", "en");
  formData.append("prompt", "Single word pronunciation.");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    return json(
      { error: err?.error?.message ?? `OpenAI error: ${response.status}` },
      response.status === 429 ? 429 : 502
    );
  }

  const data = await response.json();
  return json({ text: data.text ?? "" });
}

async function handleFetchEtymology(word: string) {
  if (!word || typeof word !== "string" || word.length < 1) {
    return json({ error: "Missing word" }, 400);
  }

  const safeWord = word.replace(/[^a-zA-Z'-]/g, "").slice(0, 50);
  if (!safeWord) {
    return json({ error: "Invalid word" }, 400);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a concise etymologist. Give the etymology of the requested word in one sentence. Include the language of origin (Latin, Greek, Old English, Old French, etc.) and original meaning. No preamble, no quotes around the word.",
        },
        { role: "user", content: safeWord },
      ],
      temperature: 0.3,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    return json(
      { error: err?.error?.message ?? `OpenAI error: ${response.status}` },
      response.status === 429 ? 429 : 502
    );
  }

  const data = await response.json();
  const etymology = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!etymology) {
    return json({ error: "No etymology found" }, 404);
  }

  return json({ etymology });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
