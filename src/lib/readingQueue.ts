import { categories, type TextEntry, type Category } from './data/categories';
import { useSettingsStore } from './store/settings';

export interface QueueItem {
  category: Category;
  text: TextEntry;
  reason: 'continue' | 'explore' | 'new_unlock';
}

const FREE_CATEGORIES = ['story', 'article', 'speech'];

export function getReadingQueue(limit = 5): QueueItem[] {
  const state = useSettingsStore.getState();
  const {
    readingHistory,
    categoryReadCounts,
    isPremium,
  } = state;

  const queue: QueueItem[] = [];
  const usedTextIds = new Set<string>();

  // Available categories based on subscription
  const availableCategories = isPremium
    ? categories
    : categories.filter((c) => FREE_CATEGORIES.includes(c.key));

  // Get list of completed text IDs
  const completedTextIds = new Set(
    readingHistory
      .filter((h) => h.textId)
      .map((h) => h.textId!)
  );

  // Helper: get next unread text in a category
  const getNextUnread = (cat: Category): TextEntry | undefined => {
    return cat.texts.find((t) => {
      if (completedTextIds.has(t.id)) return false;
      if (usedTextIds.has(t.id)) return false;
      // Check requiredReads gate
      const readCount = categoryReadCounts[cat.key] ?? 0;
      if (t.requiredReads && readCount < t.requiredReads) return false;
      return true;
    });
  };

  // 1. Continue current category — next unread in the last-read category
  if (readingHistory.length > 0) {
    const lastRead = readingHistory[readingHistory.length - 1];
    if (lastRead.categoryKey && lastRead.categoryKey !== 'custom') {
      const cat = availableCategories.find((c) => c.key === lastRead.categoryKey);
      if (cat) {
        const next = getNextUnread(cat);
        if (next) {
          queue.push({ category: cat, text: next, reason: 'continue' });
          usedTextIds.add(next.id);
        }
      }
    }
  }

  // 2. Least-read categories — variety from underexplored
  const sortedByReads = [...availableCategories].sort(
    (a, b) => (categoryReadCounts[a.key] ?? 0) - (categoryReadCounts[b.key] ?? 0)
  );

  for (const cat of sortedByReads) {
    if (queue.length >= limit) break;
    const next = getNextUnread(cat);
    if (next) {
      queue.push({ category: cat, text: next, reason: 'explore' });
      usedTextIds.add(next.id);
    }
  }

  // 3. New unlocks — texts that just became available
  for (const cat of availableCategories) {
    if (queue.length >= limit) break;
    const readCount = categoryReadCounts[cat.key] ?? 0;
    const justUnlocked = cat.texts.find((t) => {
      if (completedTextIds.has(t.id)) return false;
      if (usedTextIds.has(t.id)) return false;
      // Text is just unlocked if requiredReads equals current read count
      return t.requiredReads !== undefined && t.requiredReads === readCount;
    });
    if (justUnlocked) {
      queue.push({ category: cat, text: justUnlocked, reason: 'new_unlock' });
      usedTextIds.add(justUnlocked.id);
    }
  }

  return queue.slice(0, limit);
}
