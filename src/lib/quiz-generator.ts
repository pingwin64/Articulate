import type { QuizQuestion } from './data/quizzes';
import { callEdgeFunction } from './api';

export async function generateQuizFromText(
  text: string,
): Promise<QuizQuestion[]> {
  let response: Response;
  try {
    response = await callEdgeFunction('generate-quiz', { text });
  } catch (error) {
    // Re-throw RateLimitError and PremiumRequiredError as-is
    if (error instanceof Error && (error.name === 'RateLimitError' || error.name === 'PremiumRequiredError')) {
      throw error;
    }
    throw new Error('Unable to generate quiz. Check your connection and try again.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error ?? 'Unable to generate quiz. Check your connection and try again.');
  }

  const data = await response.json();
  const questions = data.questions as Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid quiz response');
  }

  return questions.map((q, i) => ({
    id: `custom-q-${Date.now()}-${i}`,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    categoryKey: 'custom',
    textId: 'custom',
  }));
}
