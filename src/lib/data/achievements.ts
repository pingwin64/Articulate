import type { SettingsState } from '../store/settings';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'reading' | 'speed' | 'comprehension' | 'streak' | 'exploration';
  icon: string; // Feather icon name
  check: (state: SettingsState) => boolean;
}

export const achievements: Achievement[] = [
  // ── Reading ────────────────────────────────────
  {
    id: 'first_words',
    title: 'First Words',
    description: 'Complete your first reading',
    category: 'reading',
    icon: 'book-open',
    check: (s) => s.textsCompleted >= 1,
  },
  {
    id: 'page_turner',
    title: 'Page Turner',
    description: 'Read 500 words total',
    category: 'reading',
    icon: 'book',
    check: (s) => s.lifetimeWordsRead >= 500,
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Read 5,000 words total',
    category: 'reading',
    icon: 'bookmark',
    check: (s) => s.lifetimeWordsRead >= 5000,
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Read 25,000 words total',
    category: 'reading',
    icon: 'award',
    check: (s) => s.lifetimeWordsRead >= 25000,
  },
  {
    id: 'sage',
    title: 'Sage',
    description: 'Read 100,000 words total',
    category: 'reading',
    icon: 'star',
    check: (s) => s.lifetimeWordsRead >= 100000,
  },

  // ── Speed ──────────────────────────────────────
  {
    id: 'speed_reader',
    title: 'Speed Reader',
    description: 'Reach 200 WPM in a session',
    category: 'speed',
    icon: 'zap',
    check: (s) => s.bestWPM >= 200,
  },
  {
    id: 'lightning_eyes',
    title: 'Lightning Eyes',
    description: 'Reach 300 WPM in a session',
    category: 'speed',
    icon: 'trending-up',
    check: (s) => s.bestWPM >= 300,
  },
  {
    id: 'personal_best',
    title: 'New Personal Best',
    description: 'Beat your previous best WPM',
    category: 'speed',
    icon: 'target',
    check: (s) => s.readingHistory.length >= 2 && s.bestWPM > 0,
  },

  // ── Comprehension ──────────────────────────────
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on a comprehension quiz',
    category: 'comprehension',
    icon: 'check-circle',
    check: (s) =>
      s.readingHistory.some(
        (r) =>
          r.comprehensionScore !== undefined &&
          r.comprehensionQuestions !== undefined &&
          r.comprehensionQuestions > 0 &&
          r.comprehensionScore === r.comprehensionQuestions
      ),
  },
  {
    id: 'quick_thinker',
    title: 'Quick Thinker',
    description: 'Score 80%+ on a quiz with 200+ WPM',
    category: 'comprehension',
    icon: 'cpu',
    check: (s) =>
      s.readingHistory.some(
        (r) =>
          r.wpm >= 200 &&
          r.comprehensionScore !== undefined &&
          r.comprehensionQuestions !== undefined &&
          r.comprehensionQuestions > 0 &&
          r.comprehensionScore / r.comprehensionQuestions >= 0.8
      ),
  },

  // ── Streak ─────────────────────────────────────
  {
    id: 'three_day',
    title: 'Getting Started',
    description: 'Read 3 days in a row',
    category: 'streak',
    icon: 'sunrise',
    check: (s) => s.bestStreak >= 3 || s.currentStreak >= 3,
  },
  {
    id: 'one_week',
    title: 'One Week Strong',
    description: 'Read 7 days in a row',
    category: 'streak',
    icon: 'calendar',
    check: (s) => s.bestStreak >= 7 || s.currentStreak >= 7,
  },
  {
    id: 'monthly_master',
    title: 'Monthly Master',
    description: 'Read 30 days in a row',
    category: 'streak',
    icon: 'shield',
    check: (s) => s.bestStreak >= 30 || s.currentStreak >= 30,
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Read 100 days in a row',
    category: 'streak',
    icon: 'sun',
    check: (s) => s.bestStreak >= 100 || s.currentStreak >= 100,
  },

  // ── Exploration ────────────────────────────────
  {
    id: 'importer',
    title: 'Importer',
    description: 'Read your first custom text',
    category: 'exploration',
    icon: 'upload',
    check: (s) =>
      s.readingHistory.some((r) => r.customTextId !== undefined),
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Read after 10 PM',
    category: 'exploration',
    icon: 'moon',
    check: (s) =>
      s.readingHistory.some((r) => {
        const hour = new Date(r.readAt).getHours();
        return hour >= 22;
      }),
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Read before 7 AM',
    category: 'exploration',
    icon: 'coffee',
    check: (s) =>
      s.readingHistory.some((r) => {
        const hour = new Date(r.readAt).getHours();
        return hour < 7;
      }),
  },
  {
    id: 'all_categories',
    title: 'All Categories',
    description: 'Read from every curated category',
    category: 'exploration',
    icon: 'grid',
    check: (s) => {
      const cats = new Set(s.readingHistory.filter((r) => r.categoryKey).map((r) => r.categoryKey));
      return cats.size >= 6;
    },
  },
  {
    id: 'five_sessions',
    title: 'Dedicated Reader',
    description: 'Complete 5 reading sessions',
    category: 'reading',
    icon: 'layers',
    check: (s) => s.textsCompleted >= 5,
  },
  {
    id: 'ten_sessions',
    title: 'Reading Habit',
    description: 'Complete 10 reading sessions',
    category: 'reading',
    icon: 'heart',
    check: (s) => s.textsCompleted >= 10,
  },
];

export function checkNewAchievements(state: SettingsState): string[] {
  const newlyUnlocked: string[] = [];
  for (const achievement of achievements) {
    if (
      !state.unlockedAchievements.includes(achievement.id) &&
      achievement.check(state)
    ) {
      newlyUnlocked.push(achievement.id);
    }
  }
  return newlyUnlocked;
}
