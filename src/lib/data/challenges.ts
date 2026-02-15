export interface WeeklyChallenge {
  id: string;
  type: 'texts_read' | 'categories_diverse' | 'quiz_perfect' | 'words_total' | 'pronunciation_perfect' | 'listen_repeat' | 'daily_goal' | 'advanced';
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
  {
    id: 'pronunciation-10',
    type: 'pronunciation_perfect',
    description: 'Get 10 perfect pronunciations',
    target: 10,
    icon: 'mic',
  },
  {
    id: 'listen-repeat-3',
    type: 'listen_repeat',
    description: 'Complete 3 Listen & Repeat sessions',
    target: 3,
    icon: 'repeat',
  },
  {
    id: 'daily-goal-5',
    type: 'daily_goal',
    description: 'Hit daily goal 5 days this week',
    target: 5,
    icon: 'target',
  },
  {
    id: 'texts-10',
    type: 'texts_read',
    description: 'Read 10 texts',
    target: 10,
    icon: 'book-open',
  },
  {
    id: 'advanced-3',
    type: 'advanced',
    description: 'Read 3 advanced texts',
    target: 3,
    icon: 'trending-up',
  },
];

import { getISOWeekId } from '../date';

/**
 * Returns the ISO week identifier as "YYYY-WNN"
 */
export function getCurrentWeekId(): string {
  return getISOWeekId(new Date());
}

/**
 * Returns the current week's challenge, deterministically rotating through the list.
 */
export function getCurrentChallenge(): WeeklyChallenge {
  const weekId = getCurrentWeekId();
  const weekNum = parseInt(weekId.split('-W')[1], 10);
  return WEEKLY_CHALLENGES[weekNum % WEEKLY_CHALLENGES.length];
}

/**
 * Returns the number of days remaining until next Monday.
 */
export function getDaysRemainingInWeek(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ...
  // Days until next Monday (day 1), not counting today
  if (day === 0) return 1;
  if (day === 1) return 6; // Monday = 6 days left (Tue-Sun)
  return 8 - day;
}
