import { callEdgeFunction } from './api';

interface ScanResult {
  text: string;
  wordCount: number;
}

export async function scanTextFromImage(base64Image: string): Promise<ScanResult> {
  const response = await callEdgeFunction('scan-image', { imageData: base64Image });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage = errorBody?.error ?? '';
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
