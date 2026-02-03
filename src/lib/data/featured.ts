import { categories, type TextEntry, type Category } from './categories';

export interface FeaturedText {
  text: TextEntry;
  category: Category;
  isPremium: boolean;
}

const FREE_CATEGORY_KEYS = ['story', 'article', 'speech'];

// Build flat list of all texts with their category
const ALL_TEXTS: { text: TextEntry; category: Category }[] = [];
for (const cat of categories) {
  for (const text of cat.texts) {
    ALL_TEXTS.push({ text, category: cat });
  }
}

/**
 * Returns a deterministic daily featured text based on the current date.
 */
export function getDailyFeaturedText(): FeaturedText {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  const index = (dayOfYear + now.getFullYear() * 367) % ALL_TEXTS.length;
  const { text, category } = ALL_TEXTS[index];

  const isPremium = !FREE_CATEGORY_KEYS.includes(category.key);

  return { text, category, isPremium };
}
