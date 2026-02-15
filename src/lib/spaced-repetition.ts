import type { SavedWord } from './store/settings';

type PronunciationHistory = Record<string, { attempts: number; perfects: number }>;

// ─── Spaced Repetition Intervals ──────────────────────────────
// SR Level | Criteria              | Due After
// 0        | Never reviewed        | Immediately
// 1        | 1 review              | 1 day
// 2        | 2 reviews             | 3 days
// 3        | 3 reviews             | 7 days
// 4        | 4+ reviews, >=75% acc | 14 days

const SR_INTERVALS = [
  { minReviews: 0, daysUntilDue: 0 },
  { minReviews: 1, daysUntilDue: 1 },
  { minReviews: 2, daysUntilDue: 3 },
  { minReviews: 3, daysUntilDue: 7 },
  { minReviews: 4, daysUntilDue: 14 },
] as const;

function getSRLevel(attempts: number, accuracy: number): number {
  if (attempts >= 4 && accuracy >= 0.75) return 4;
  if (attempts >= 3) return 3;
  if (attempts >= 2) return 2;
  if (attempts >= 1) return 1;
  return 0;
}

function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns saved words that are due for review based on spaced repetition intervals.
 */
export function getDueWords(
  savedWords: SavedWord[],
  pronunciationHistory: PronunciationHistory,
): SavedWord[] {
  return savedWords.filter((word) => {
    const history = pronunciationHistory[word.word.toLowerCase()];
    const attempts = history?.attempts ?? 0;
    const accuracy = attempts > 0 ? (history?.perfects ?? 0) / attempts : 0;
    const srLevel = getSRLevel(attempts, accuracy);
    const interval = SR_INTERVALS[srLevel];
    const days = daysSince(word.lastReviewedDate);
    return days >= interval.daysUntilDue;
  });
}

export type ReviewUrgency = 'critical' | 'high' | 'normal';

/**
 * Determines urgency level based on how many words are due and how overdue they are.
 */
export function getReviewUrgency(
  dueWords: SavedWord[],
  pronunciationHistory: PronunciationHistory,
): ReviewUrgency {
  // Critical: 3+ words overdue by 7+ days
  const overdueCount = dueWords.filter((word) => {
    const days = daysSince(word.lastReviewedDate);
    return days >= 7;
  }).length;

  if (overdueCount >= 3) return 'critical';
  if (dueWords.length >= 5) return 'high';
  return 'normal';
}

// ─── Per-Word Mastery ─────────────────────────────────────────
// Level    | Criteria                     | Visual
// New      | 0 reviews                    | Nothing
// Learning | 1-2 reviews or <50% accuracy | 1 dot
// Familiar | 3+ reviews, >=50% accuracy   | 2 dots
// Mastered | 5+ reviews, >=75% accuracy   | 3 dots + label

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

export interface WordMastery {
  level: MasteryLevel;
  dots: number;
  showLabel: boolean;
}

export function getWordMastery(
  word: SavedWord,
  pronunciationHistory: PronunciationHistory,
): WordMastery {
  const history = pronunciationHistory[word.word.toLowerCase()];
  const attempts = history?.attempts ?? 0;
  const accuracy = attempts > 0 ? (history?.perfects ?? 0) / attempts : 0;

  if (attempts === 0) {
    return { level: 'new', dots: 0, showLabel: false };
  }

  if (attempts >= 5 && accuracy >= 0.75) {
    return { level: 'mastered', dots: 3, showLabel: true };
  }

  if (attempts >= 3 && accuracy >= 0.5) {
    return { level: 'familiar', dots: 2, showLabel: false };
  }

  return { level: 'learning', dots: 1, showLabel: false };
}
