import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "https://mgwkhxlhhrvjgixptcnu.supabase.co",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, apikey, x-client-info",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!OPENAI_API_KEY) {
    return json({ error: "OpenAI API key not configured" }, 500);
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "generate-quiz") {
      return await handleGenerateQuiz(body.text);
    }

    if (action === "parse-pdf") {
      return await handleParsePDF(body.fileData, body.model);
    }

    if (action === "scan-image") {
      return await handleScanImage(body.imageData);
    }

    if (action === "generate-text") {
      return await handleGenerateText(body.level, body.category, body.wordCount);
    }

    if (action === "generate-personalized-text") {
      return await handleGeneratePersonalizedText(body.payload);
    }

    if (action === "transcribe-audio") {
      return await handleTranscribeAudio(body.audioData);
    }

    if (action === "generate-wind-down-text") {
      return await handleGenerateWindDownText(body.payload);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});

async function handleGenerateQuiz(text: string) {
  if (!text || text.length < 20) {
    return json({ error: "Text too short for quiz generation" }, 400);
  }

  // Limit text length to control costs
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

  const questions = JSON.parse(jsonMatch[0]);
  return json({ questions });
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

  // Ensure proper data URI format
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
  if (!level || !category) {
    return json({ error: "Missing level or category" }, 400);
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

  const prompt = `Generate a ${safeWordCount}-word reading passage about ${category}.
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
    // Try to parse as JSON first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return json({ title: parsed.title, text: parsed.text });
    }
    // Fallback: use raw content as text
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

  // Build avoidance list
  const avoidTitles = [...(payload.recentTitles || []), ...(payload.recentAITopics || [])]
    .filter(Boolean)
    .slice(0, 10);
  const avoidanceClause = avoidTitles.length > 0
    ? `\nDo NOT reuse or closely paraphrase any of these recent titles: ${avoidTitles.map(t => `"${t}"`).join(", ")}.`
    : "";

  // Build interest breadcrumbs from saved words
  const wordBreadcrumbs = (payload.savedWordSamples || []).length > 0
    ? `\nThe reader has shown interest in words like: ${payload.savedWordSamples.join(", ")}. Let these hint at the reader's intellectual interests — weave similar vocabulary naturally.`
    : "";

  // Genre preferences
  const genreHint = (payload.favoriteGenres || []).length > 0
    ? `Their favorite genres are: ${payload.favoriteGenres.join(", ")}.`
    : "";

  // Difficulty preference
  const diffHint = payload.difficultyPreference === "challenging"
    ? "The reader prefers challenging material — lean into complexity."
    : payload.difficultyPreference === "accessible"
      ? "The reader prefers accessible material — keep it clear and inviting."
      : "";

  // New user treatment
  const newUserHint = payload.isNewUser
    ? "\nThis is a new reader — make the text welcoming, clear, and immediately engaging. Hook them in the first sentence."
    : "";

  // Streak acknowledgment
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

  // Decode base64 to binary
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

async function handleGenerateWindDownText(payload: {
  level: number;
  levelName: string;
  category: string;
  wordCount: number;
  favoriteGenres: string[];
  savedWordSamples: string[];
  recentTitles: string[];
  recentAITopics: string[];
}) {
  if (!payload?.category) {
    return json({ error: "Missing category in payload" }, 400);
  }

  const safeWordCount = Math.max(80, Math.min(payload.wordCount || 150, 200));

  // Build avoidance list
  const avoidTitles = [...(payload.recentTitles || []), ...(payload.recentAITopics || [])]
    .filter(Boolean)
    .slice(0, 10);
  const avoidanceClause = avoidTitles.length > 0
    ? `\nDo NOT reuse or closely paraphrase any of these recent titles: ${avoidTitles.map(t => `"${t}"`).join(", ")}.`
    : "";

  const systemPrompt = `You are a literary curator crafting a calming bedtime reading passage. Write a contemplative, soothing ${payload.category} text suitable for reading before sleep.

Reader level: ${payload.levelName} (Level ${payload.level}/5)

Guidelines:
- Write in a gentle, reflective, soothing tone
- No conflict, urgency, tension, or suspense
- The pace should feel unhurried and meditative
- Use imagery that evokes calm: nature, stillness, warmth, quiet
- The last sentence should feel like a natural resting point — a place where the reader can close their eyes
- Write an evocative, specific title — not generic${avoidanceClause}

Always respond with valid JSON containing exactly two fields: "title" and "text". No markdown, no extra commentary.`;

  const userPrompt = `Write a ${safeWordCount}-word calming ${payload.category} passage for bedtime reading. Return JSON with "title" and "text" fields.`;

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

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return json({ title: parsed.title, text: parsed.text });
    }
    return json({ title: "Tonight's Reading", text: content });
  } catch {
    return json({ title: "Tonight's Reading", text: content });
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://mgwkhxlhhrvjgixptcnu.supabase.co",
    },
  });
}
