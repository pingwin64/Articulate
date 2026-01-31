import type { QuizQuestion } from './data/quizzes';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export async function generateQuizFromText(
  text: string,
): Promise<QuizQuestion[]> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: 'generate-quiz',
      text,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error ?? `Edge function error: ${response.status}`);
  }

  const data = await response.json();
  const questions = data.questions as Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;

  return questions.map((q, i) => ({
    id: `custom-q-${Date.now()}-${i}`,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    categoryKey: 'custom',
    textId: 'custom',
  }));
}
