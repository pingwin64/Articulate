export interface WeeklyChallenge {
  id: string;
  type: 'texts_read' | 'categories_diverse' | 'quiz_perfect' | 'words_total';
  description: string;
  target: number;
  icon: string; // Feather icon name
}

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'texts-3',
    type: 'texts_read',
    description: 'Read 3 texts',
    target: 3,
    icon: 'book-open',
  },
  {
    id: 'categories-2',
    type: 'categories_diverse',
    description: 'Read from 2 categories',
    target: 2,
    icon: 'grid',
  },
  {
    id: 'texts-5',
    type: 'texts_read',
    description: 'Read 5 texts',
    target: 5,
    icon: 'book-open',
  },
  {
    id: 'words-500',
    type: 'words_total',
    description: 'Read 500 words',
    target: 500,
    icon: 'type',
  },
  {
    id: 'quiz-perfect',
    type: 'quiz_perfect',
    description: 'Get a perfect quiz score',
    target: 1,
    icon: 'check-square',
  },
  {
    id: 'categories-3',
    type: 'categories_diverse',
    description: 'Read from 3 categories',
    target: 3,
    icon: 'grid',
  },
  {
    id: 'texts-7',
    type: 'texts_read',
    description: 'Read 7 texts',
    target: 7,
    icon: 'book-open',
  },
  {
    id: 'words-750',
    type: 'words_total',
    description: 'Read 750 words',
    target: 750,
    icon: 'type',
  },
];

/**
 * Returns the ISO week identifier as "YYYY-WNN"
 */
export function getCurrentWeekId(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNum = Math.ceil((dayOfYear + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Returns the current week's challenge, deterministically rotating through the list.
 */
export function getCurrentChallenge(): WeeklyChallenge {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNum = Math.ceil((dayOfYear + jan1.getDay() + 1) / 7);
  return WEEKLY_CHALLENGES[weekNum % WEEKLY_CHALLENGES.length];
}

/**
 * Returns the number of days remaining until next Monday.
 */
export function getDaysRemainingInWeek(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ...
  // Days until next Monday (day 1)
  if (day === 0) return 1;
  if (day === 1) return 7; // If Monday, full week remaining
  return 8 - day;
}
