// Badge tier levels
export type BadgeTier = 'bronze' | 'silver' | 'gold';

// Badge categories
export type BadgeCategory =
  | 'category'
  | 'streak'
  | 'words'
  | 'texts'
  | 'quiz'
  | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier?: BadgeTier;
  icon: string; // Feather icon name
  // For category badges, which category key
  categoryKey?: string;
  // Milestone threshold
  threshold?: number;
  // Reward unlocked by this badge
  reward?: {
    type: 'theme' | 'color';
    id: string;
    name: string;
  };
}

// Category names for badge generation
const CATEGORY_NAMES: Record<string, string> = {
  story: 'Story',
  article: 'Article',
  speech: 'Speech',
  philosophy: 'Philosophy',
  science: 'Science',
  literature: 'Literature',
  poetry: 'Poetry',
  history: 'History',
  mindfulness: 'Mindfulness',
};

// Category-specific icons
const CATEGORY_ICONS: Record<string, string> = {
  story: 'book',
  article: 'file-text',
  speech: 'mic',
  philosophy: 'compass',
  science: 'cpu',
  literature: 'feather',
  poetry: 'heart',
  history: 'clock',
  mindfulness: 'eye',
};

// Generate category milestones (9 categories x 3 tiers = 27 badges)
function generateCategoryBadges(): Badge[] {
  const badges: Badge[] = [];
  const categories = Object.entries(CATEGORY_NAMES);

  for (const [key, name] of categories) {
    const icon = CATEGORY_ICONS[key] || 'award';

    // Bronze - 5 texts
    badges.push({
      id: `category-${key}-bronze`,
      name: `${name} Reader`,
      description: `Complete 5 ${name.toLowerCase()} texts`,
      category: 'category',
      tier: 'bronze',
      icon,
      categoryKey: key,
      threshold: 5,
    });

    // Silver - 10 texts
    badges.push({
      id: `category-${key}-silver`,
      name: `${name} Enthusiast`,
      description: `Complete 10 ${name.toLowerCase()} texts`,
      category: 'category',
      tier: 'silver',
      icon,
      categoryKey: key,
      threshold: 10,
    });

    // Gold - 25 texts
    badges.push({
      id: `category-${key}-gold`,
      name: `${name} Master`,
      description: `Complete 25 ${name.toLowerCase()} texts`,
      category: 'category',
      tier: 'gold',
      icon,
      categoryKey: key,
      threshold: 25,
    });
  }

  return badges;
}

// Streak badges (4)
const STREAK_BADGES: Badge[] = [
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Read for 7 days in a row',
    category: 'streak',
    icon: 'trending-up',
    threshold: 7,
  },
  {
    id: 'streak-30',
    name: '30-Day Streak',
    description: 'Read for 30 days in a row',
    category: 'streak',
    icon: 'target',
    threshold: 30,
    reward: {
      type: 'theme',
      id: 'streak-30-theme',
      name: 'Midnight Theme',
    },
  },
  {
    id: 'streak-100',
    name: '100-Day Legend',
    description: 'Read for 100 days in a row',
    category: 'streak',
    icon: 'shield',
    threshold: 100,
    reward: {
      type: 'theme',
      id: 'streak-100-theme',
      name: 'Aurora Theme',
    },
  },
  {
    id: 'streak-365',
    name: '365 Champion',
    description: 'Read for 365 days in a row',
    category: 'streak',
    icon: 'award',
    threshold: 365,
    reward: {
      type: 'theme',
      id: 'streak-365-theme',
      name: 'Legendary Theme',
    },
  },
];

// Word milestone badges (4)
const WORD_BADGES: Badge[] = [
  {
    id: 'words-1k',
    name: '1K Club',
    description: 'Read 1,000 words total',
    category: 'words',
    icon: 'book-open',
    threshold: 1000,
  },
  {
    id: 'words-10k',
    name: '10K Reader',
    description: 'Read 10,000 words total',
    category: 'words',
    icon: 'layers',
    threshold: 10000,
  },
  {
    id: 'words-50k',
    name: '50K Milestone',
    description: 'Read 50,000 words total',
    category: 'words',
    icon: 'archive',
    threshold: 50000,
    reward: {
      type: 'theme',
      id: 'words-50k-theme',
      name: 'Ember Theme',
    },
  },
  {
    id: 'words-100k',
    name: '6-Figure Club',
    description: 'Read 100,000 words total',
    category: 'words',
    icon: 'hexagon',
    threshold: 100000,
  },
];

// Reading milestone badges (3)
const TEXT_BADGES: Badge[] = [
  {
    id: 'texts-10',
    name: 'Double Digits',
    description: 'Complete 10 texts',
    category: 'texts',
    icon: 'check-circle',
    threshold: 10,
  },
  {
    id: 'texts-50',
    name: 'Bookworm',
    description: 'Complete 50 texts',
    category: 'texts',
    icon: 'bookmark',
    threshold: 50,
  },
  {
    id: 'texts-100',
    name: 'Century',
    description: 'Complete 100 texts',
    category: 'texts',
    icon: 'award',
    threshold: 100,
    reward: {
      type: 'color',
      id: 'texts-100-color',
      name: 'Depth Color',
    },
  },
];

// Quiz badges (5)
const QUIZ_BADGES: Badge[] = [
  {
    id: 'quiz-first',
    name: 'Quiz Rookie',
    description: 'Complete your first quiz',
    category: 'quiz',
    icon: 'help-circle',
    threshold: 1,
  },
  {
    id: 'quiz-perfect',
    name: 'Perfect Score',
    description: 'Get 100% on a quiz',
    category: 'quiz',
    icon: 'check-square',
  },
  {
    id: 'quiz-10',
    name: 'Quiz Enthusiast',
    description: 'Complete 10 quizzes',
    category: 'quiz',
    icon: 'edit-3',
    threshold: 10,
  },
  {
    id: 'quiz-25',
    name: 'Quiz Master',
    description: 'Complete 25 quizzes',
    category: 'quiz',
    tier: 'silver',
    icon: 'clipboard',
    threshold: 25,
  },
  {
    id: 'quiz-scholar',
    name: 'Scholar',
    description: 'Complete 10+ quizzes with 80%+ average',
    category: 'quiz',
    tier: 'gold',
    icon: 'award',
    reward: {
      type: 'color',
      id: 'quiz-scholar-color',
      name: 'Scholar Ink Color',
    },
  },
];

// Special badges (6+)
const SPECIAL_BADGES: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first reading',
    category: 'special',
    icon: 'star',
  },
  {
    id: 'custom-creator',
    name: 'Your Words',
    description: 'Read your own text',
    category: 'special',
    icon: 'feather',
  },
  {
    id: 'listener',
    name: 'Audio Explorer',
    description: 'Use the TTS feature',
    category: 'special',
    icon: 'headphones',
  },
  {
    id: 'speed-demon',
    name: 'Lightning Reader',
    description: 'Read at 500+ WPM',
    category: 'special',
    icon: 'zap',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Read after midnight',
    category: 'special',
    icon: 'moon',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Read before 6am',
    category: 'special',
    icon: 'sunrise',
  },
  {
    id: 'challenge-first',
    name: 'Challenger',
    description: 'Complete your first weekly challenge',
    category: 'special',
    icon: 'target',
    threshold: 1,
  },
  {
    id: 'challenge-10',
    name: 'Challenge Veteran',
    description: 'Complete 10 weekly challenges',
    category: 'special',
    icon: 'target',
    threshold: 10,
    reward: {
      type: 'color',
      id: 'challenge-10-color',
      name: 'Dawn Color',
    },
  },
  {
    id: 'category-master',
    name: 'Category Master',
    description: 'Earn a Gold badge in any category',
    category: 'special',
    icon: 'award',
    reward: {
      type: 'theme',
      id: 'category-master-theme',
      name: 'Verdant Theme',
    },
  },
];

// All badges combined
export const ALL_BADGES: Badge[] = [
  ...generateCategoryBadges(),
  ...STREAK_BADGES,
  ...WORD_BADGES,
  ...TEXT_BADGES,
  ...QUIZ_BADGES,
  ...SPECIAL_BADGES,
];

// Helper to get badge by ID
export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find((b) => b.id === id);
}

// Helper to get badges by category
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter((b) => b.category === category);
}

// Helper to get category badges for a specific content category
export function getCategoryBadges(categoryKey: string): Badge[] {
  return ALL_BADGES.filter(
    (b) => b.category === 'category' && b.categoryKey === categoryKey
  );
}

// Tier colors for display
export const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
};

// Tier tints for glass cards (lighter)
export const TIER_TINTS: Record<BadgeTier, { light: string; dark: string }> = {
  bronze: {
    light: 'rgba(205, 127, 50, 0.08)',
    dark: 'rgba(205, 127, 50, 0.12)',
  },
  silver: {
    light: 'rgba(192, 192, 192, 0.08)',
    dark: 'rgba(192, 192, 192, 0.12)',
  },
  gold: {
    light: 'rgba(255, 215, 0, 0.08)',
    dark: 'rgba(255, 215, 0, 0.12)',
  },
};
