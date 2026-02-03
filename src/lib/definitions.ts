import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export interface WordDefinition {
  word: string;
  syllables: string;
  partOfSpeech: string;
  definition: string;
}

export async function fetchDefinition(word: string): Promise<WordDefinition> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/word-definition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ word }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Failed to fetch definition (${res.status})`);
  }

  return res.json();
}
