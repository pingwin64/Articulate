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
        "Access-Control-Allow-Origin": "*",
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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
