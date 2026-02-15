import { categories, FREE_CATEGORY_KEYS, type TextEntry, type Category } from './data/categories';
import { useSettingsStore, getCurrentLevel } from './store/settings';
import { computeDifficulty } from './data/difficulty';

export interface QueueItem {
  category: Category;
  text: TextEntry;
  reason: 'continue' | 'explore' | 'new_unlock' | 'level_match';
}

export function getReadingQueue(limit = 5): QueueItem[] {
  const state = useSettingsStore.getState();
  const {
    readingHistory,
    categoryReadCounts,
    isPremium,
    levelProgress,
  } = state;

  const queue: QueueItem[] = [];
  const usedTextIds = new Set<string>();

  // Available categories based on subscription
  const availableCategories = isPremium
    ? categories
    : categories.filter((c) => (FREE_CATEGORY_KEYS as readonly string[]).includes(c.key));

  // Get list of completed text IDs
  const completedTextIds = new Set(
    readingHistory
      .filter((h) => h.textId)
      .map((h) => h.textId!)
  );

  // User's current level (1-5)
  const userLevel = getCurrentLevel(levelProgress);

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
    // readingHistory is stored newest-first.
    const lastRead = readingHistory[0];
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

  // 2. Level-matched texts — suggest texts near user's difficulty level
  // Map user level (1-5) to target difficulty score (1-10)
  const targetScore = userLevel * 2; // Level 1→2, Level 2→4, Level 3→6, etc.

  const scoredTexts: { cat: Category; text: TextEntry; scoreDiff: number }[] = [];
  for (const cat of availableCategories) {
    const readCount = categoryReadCounts[cat.key] ?? 0;
    for (const t of cat.texts) {
      if (completedTextIds.has(t.id) || usedTextIds.has(t.id)) continue;
      if (t.requiredReads && readCount < t.requiredReads) continue;
      const score = computeDifficulty(t.words);
      scoredTexts.push({ cat, text: t, scoreDiff: Math.abs(score - targetScore) });
    }
  }
  // Sort by closest to user level
  scoredTexts.sort((a, b) => a.scoreDiff - b.scoreDiff);

  for (const { cat, text } of scoredTexts) {
    if (queue.length >= limit - 1) break; // Leave room for new_unlock
    if (usedTextIds.has(text.id)) continue;
    queue.push({ category: cat, text, reason: 'level_match' });
    usedTextIds.add(text.id);
  }

  // 3. New unlocks — prioritize texts that just became available
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

  // 4. Least-read categories — variety from underexplored
  const sortedByReads = [...availableCategories].sort(
    (a, b) => (categoryReadCounts[a.key] ?? 0) - (categoryReadCounts[b.key] ?? 0)
  );

  for (const cat of sortedByReads) {
    if (queue.length >= limit) break;
    const next = getNextUnread(cat);
    if (next && !usedTextIds.has(next.id)) {
      queue.push({ category: cat, text: next, reason: 'explore' });
      usedTextIds.add(next.id);
    }
  }

  return queue.slice(0, limit);
}
