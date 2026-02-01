import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

interface ScanResult {
  text: string;
  wordCount: number;
}

export async function scanTextFromImage(base64Image: string): Promise<ScanResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: 'scan-image',
      imageData: base64Image,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage = errorBody?.error ?? '';

    if (response.status === 429) {
      throw new Error('Rate limited — please wait a moment and try again.');
    }
    throw new Error(errorMessage || 'Failed to scan text from image.');
  }

  const data = await response.json();
  const text = (data.text ?? '').trim();

  if (!text || text.length < 5) {
    throw new Error('No readable text found in this image. Try a clearer photo.');
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return { text, wordCount };
}
