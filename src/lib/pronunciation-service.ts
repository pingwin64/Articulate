import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// ─── Transcription ────────────────────────────────────────────

export async function transcribeAudio(base64Audio: string): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'transcribe-audio',
      audioData: base64Audio,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error ?? `Transcription failed (${response.status})`);
  }

  const data = await response.json();
  return (data.text ?? '').trim();
}

// ─── Scoring ──────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export function computeSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na.length === 0 && nb.length === 0) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return 1 - dist / maxLen;
}

export type PronunciationResult = 'perfect' | 'close' | 'try_again';

export interface PronunciationFeedback {
  result: PronunciationResult;
  transcribed: string;
  expected: string;
  similarity: number;
}

export function scoreWord(transcribed: string, expected: string): PronunciationFeedback {
  const similarity = computeSimilarity(transcribed, expected);
  let result: PronunciationResult;

  if (similarity >= 0.8) {
    result = 'perfect';
  } else if (similarity >= 0.5) {
    result = 'close';
  } else {
    result = 'try_again';
  }

  return { result, transcribed, expected, similarity };
}
