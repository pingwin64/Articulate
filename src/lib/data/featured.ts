import { categories, FREE_CATEGORY_KEYS, type TextEntry, type Category } from './categories';
import { useSettingsStore, getCurrentLevel } from '../store/settings';
import { computeDifficulty } from './difficulty';

export interface FeaturedText {
  text: TextEntry;
  category: Category;
  isPremium: boolean;
}

// Build flat list of all texts with their category
const ALL_TEXTS: { text: TextEntry; category: Category }[] = [];
for (const cat of categories) {
  for (const text of cat.texts) {
    ALL_TEXTS.push({ text, category: cat });
  }
}

/**
 * Returns a deterministic daily featured text based on the current date,
 * preferring texts near the user's difficulty level.
 */
export function getDailyFeaturedText(): FeaturedText {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );

  // Filter texts near user's level (±2 difficulty points)
  const state = useSettingsStore.getState();
  const userLevel = getCurrentLevel(state.levelProgress);
  const targetDifficulty = userLevel * 2; // 1-5 → 2-10

  const filtered = ALL_TEXTS.filter(({ text }) => {
    const diff = text.difficulty ?? computeDifficulty(text.words);
    return Math.abs(diff - targetDifficulty) <= 2;
  });

  // Use filtered set if non-empty, otherwise fall back to all texts
  const pool = filtered.length > 0 ? filtered : ALL_TEXTS;
  const index = (dayOfYear + now.getFullYear() * 367) % pool.length;
  const { text, category } = pool[index];

  const isPremium = !(FREE_CATEGORY_KEYS as readonly string[]).includes(category.key);

  return { text, category, isPremium };
}
