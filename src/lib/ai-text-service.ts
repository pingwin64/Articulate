/**
 * AI Daily Practice text generation service.
 * Generates personalized reading texts based on user signals — category preferences,
 * saved words, reading history, difficulty breakdown, favorites.
 */

import { useSettingsStore, getCurrentLevel } from './store/settings';
import type { CustomText } from './store/settings';
import { callEdgeFunction } from './api';

const CATEGORIES = [
  'story', 'essay', 'speech', 'philosophy', 'science',
  'fiction', 'poetry', 'history', 'wisdom',
] as const;

type CategoryKey = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<string, string> = {
  story: 'stories',
  essay: 'essays',
  speech: 'speeches',
  philosophy: 'philosophy',
  science: 'science',
  fiction: 'fiction',
  poetry: 'poetry',
  history: 'history',
  wisdom: 'wisdom',
};

// New user rotation for first 3 texts
const NEW_USER_ROTATION: CategoryKey[] = ['story', 'wisdom', 'poetry'];

interface PersonalizationPayload {
  level: number;
  levelName: string;
  category: string;
  wordCount: number;
  favoriteGenres: string[];
  savedWordSamples: string[];
  savedWordCategories: string[];
  difficultyPreference: string;
  recentTitles: string[];
  recentAITopics: string[];
  isNewUser: boolean;
  currentStreak: number;
  avgWPM: number;
}

interface CategoryWeight {
  key: string;
  weight: number;
}

/**
 * Build the personalization payload from all available store signals.
 */
function buildPersonalizationPayload(): PersonalizationPayload {
  const state = useSettingsStore.getState();
  const level = getCurrentLevel(state.levelProgress);
  const levelNames = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
  const levelName = levelNames[level - 1] ?? 'Beginner';

  // Category weighting
  const weights: CategoryWeight[] = CATEGORIES.map((key) => {
    let weight = state.categoryReadCounts[key] ?? 0;

    // Recency bonus: +3 for categories read in last 5 entries
    const recentCategories = state.readingHistory.slice(0, 5).map((e) => e.categoryKey);
    if (recentCategories.includes(key)) weight += 3;

    // Favorite bonus: +2 per favorited text in this category
    const favCount = state.favoriteTexts.filter((f) => f.categoryKey === key).length;
    weight += Math.min(favCount * 2, 4);

    // Saved word bonus: +1 per word from this category, capped at 3
    const wordCount = state.savedWords.filter((w) => w.sourceCategory === key).length;
    weight += Math.min(wordCount, 3);

    return { key, weight };
  });

  // Top categories by weight
  const sorted = [...weights].sort((a, b) => b.weight - a.weight);
  const favoriteGenres = sorted
    .filter((c) => c.weight > 0)
    .slice(0, 3)
    .map((c) => c.key);

  // Saved word samples (up to 8, most recent)
  const savedWordSamples = state.savedWords
    .slice(0, 8)
    .map((w) => w.word);

  // Saved word source categories
  const savedWordCategories = [...new Set(
    state.savedWords
      .filter((w) => w.sourceCategory)
      .map((w) => w.sourceCategory!)
  )];

  // Difficulty preference from breakdown
  const total = state.beginnerTextsCompleted + state.intermediateTextsCompleted + state.advancedTextsCompleted;
  let difficultyPreference = 'balanced';
  if (total >= 3) {
    if (state.advancedTextsCompleted / total > 0.5) difficultyPreference = 'challenging';
    else if (state.beginnerTextsCompleted / total > 0.5) difficultyPreference = 'accessible';
  }

  // Recent titles from reading history
  const recentTitles = state.readingHistory
    .slice(0, 10)
    .map((e) => e.title);

  // Average WPM from recent history
  const recentWPMs = state.readingHistory.slice(0, 10).map((e) => e.wpm).filter((w) => w > 0);
  const avgWPM = recentWPMs.length > 0
    ? Math.round(recentWPMs.reduce((a, b) => a + b, 0) / recentWPMs.length)
    : 200;

  // Word count: based on daily word goal, capped 100-350
  const wordCount = Math.max(100, Math.min(state.dailyWordGoal || 150, 350));

  return {
    level,
    levelName,
    category: '', // Filled by selectCategory
    wordCount,
    favoriteGenres,
    savedWordSamples,
    savedWordCategories,
    difficultyPreference,
    recentTitles,
    recentAITopics: state.recentAITopics ?? [],
    isNewUser: state.textsCompleted < 3,
    currentStreak: state.currentStreak,
    avgWPM,
  };
}

/**
 * Select a category using weighted randomness.
 * Returns { category, reason }.
 */
function selectCategory(payload: PersonalizationPayload): { category: string; reason: string } {
  const state = useSettingsStore.getState();

  // New user fallback
  if (payload.isNewUser) {
    const dayOfWeek = new Date().getDay();
    const category = NEW_USER_ROTATION[dayOfWeek % NEW_USER_ROTATION.length];
    return { category, reason: 'Curated for new readers' };
  }

  // Build weighted list
  const weights: CategoryWeight[] = CATEGORIES.map((key) => {
    let weight = state.categoryReadCounts[key] ?? 0;
    const recentCategories = state.readingHistory.slice(0, 5).map((e) => e.categoryKey);
    if (recentCategories.includes(key)) weight += 3;
    const favCount = state.favoriteTexts.filter((f) => f.categoryKey === key).length;
    weight += Math.min(favCount * 2, 4);
    const wordCount = state.savedWords.filter((w) => w.sourceCategory === key).length;
    weight += Math.min(wordCount, 3);
    return { key, weight };
  });

  const sorted = [...weights].sort((a, b) => b.weight - a.weight);
  const top3 = sorted.slice(0, 3).filter((c) => c.weight > 0);
  const coldCategories = sorted.filter((c) => c.weight === 0);

  // Roll strategy
  const roll = Math.random();

  if (roll < 0.70 && top3.length > 0) {
    // Weighted pick from top 3
    const totalWeight = top3.reduce((sum, c) => sum + c.weight, 0);
    let target = Math.random() * totalWeight;
    for (const c of top3) {
      target -= c.weight;
      if (target <= 0) {
        const label = CATEGORY_LABELS[c.key] ?? c.key;
        return { category: c.key, reason: `Based on your love of ${label}` };
      }
    }
    // Fallback to first
    const label = CATEGORY_LABELS[top3[0].key] ?? top3[0].key;
    return { category: top3[0].key, reason: `Based on your love of ${label}` };
  }

  if (roll < 0.90 && coldCategories.length > 0) {
    // Cold category — something new
    const pick = coldCategories[Math.floor(Math.random() * coldCategories.length)];
    return { category: pick.key, reason: 'Something new to explore' };
  }

  // Cross-pollination — fresh perspective on top category
  if (top3.length > 0) {
    return { category: top3[0].key, reason: 'A fresh perspective' };
  }

  // Ultimate fallback
  const fallback = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  return { category: fallback, reason: 'Personalized to your reading taste' };
}

/**
 * Generate a daily AI text with full personalization.
 * Returns { text, reason, categoryKey }.
 */
export async function generateDailyText(): Promise<{ text: CustomText; reason: string; categoryKey: string }> {
  const payload = buildPersonalizationPayload();
  const { category, reason } = selectCategory(payload);
  payload.category = category;

  const response = await callEdgeFunction('generate-personalized-text', { payload });

  if (!response.ok) {
    throw new Error(`Failed to generate text: ${response.status}`);
  }

  const data = await response.json();

  if (!data.text || data.text.trim().split(/\s+/).length < 10) {
    throw new Error('Generated text was too short');
  }

  const aiText: CustomText = {
    id: `ai-${Date.now().toString(36)}`,
    title: data.title || 'Your Daily Read',
    text: data.text || '',
    wordCount: (data.text || '').split(/\s+/).length,
    createdAt: new Date().toISOString(),
    timesRead: 0,
    source: 'paste',
  };

  return { text: aiText, reason, categoryKey: category };
}

/**
 * Check if today's AI text is already generated.
 */
export function hasTodayAIText(): boolean {
  const state = useSettingsStore.getState();
  return state.dailyAITextDate === new Date().toDateString() && state.dailyAIText !== null;
}

/**
 * Get or generate today's AI text.
 */
export async function getOrGenerateDailyText(): Promise<CustomText> {
  const state = useSettingsStore.getState();

  // Return cached if today's text already exists
  if (state.dailyAITextDate === new Date().toDateString() && state.dailyAIText) {
    return state.dailyAIText;
  }

  // Generate new text
  const { text, reason, categoryKey } = await generateDailyText();
  state.setDailyAIText(text, reason, categoryKey);
  return text;
}

/**
 * Background prefetch — call on app launch with delay.
 * Silently generates and caches today's text if premium.
 */
export async function prefetchDailyText(): Promise<void> {
  const state = useSettingsStore.getState();

  // Only prefetch for premium users
  if (!state.isPremium && !state.trialActive) return;

  // Skip if already cached for today
  if (state.dailyAITextDate === new Date().toDateString() && state.dailyAIText) return;

  // Generate and cache
  const { text, reason, categoryKey } = await generateDailyText();
  state.setDailyAIText(text, reason, categoryKey);
}

// ─── Wind-Down "Tonight's Reading" ────────────────────────────

const WIND_DOWN_CATEGORIES: CategoryKey[] = ['wisdom', 'poetry', 'philosophy'];

/**
 * Generate a calming wind-down text for bedtime reading.
 */
export async function generateWindDownText(): Promise<CustomText> {
  const payload = buildPersonalizationPayload();
  // Force calming category and shorter length
  payload.category = WIND_DOWN_CATEGORIES[Math.floor(Math.random() * WIND_DOWN_CATEGORIES.length)];
  payload.wordCount = Math.min(payload.wordCount, 200);

  const response = await callEdgeFunction('generate-wind-down-text', { payload });

  if (!response.ok) {
    throw new Error(`Failed to generate wind-down text: ${response.status}`);
  }

  const data = await response.json();

  if (!data.text || data.text.trim().split(/\s+/).length < 10) {
    throw new Error('Generated text was too short');
  }

  return {
    id: `winddown-${Date.now().toString(36)}`,
    title: data.title || "Tonight's Reading",
    text: data.text || '',
    wordCount: (data.text || '').split(/\s+/).length,
    createdAt: new Date().toISOString(),
    timesRead: 0,
    source: 'paste',
  };
}

/**
 * Get or generate tonight's wind-down text.
 */
export async function getOrGenerateWindDownText(): Promise<CustomText> {
  const state = useSettingsStore.getState();

  // Return cached if today's wind-down text exists
  if (state.windDownTextDate === new Date().toDateString() && state.windDownText) {
    return state.windDownText;
  }

  const text = await generateWindDownText();
  state.setWindDownText(text);
  return text;
}

/**
 * Background prefetch wind-down text — call on app launch if wind-down enabled.
 */
export async function prefetchWindDownText(): Promise<void> {
  const state = useSettingsStore.getState();

  // Only prefetch for premium users with wind-down enabled
  if (!state.isPremium && !state.trialActive) return;
  if (!state.windDownMode) return;

  // Skip if already cached for today
  if (state.windDownTextDate === new Date().toDateString() && state.windDownText) return;

  const text = await generateWindDownText();
  state.setWindDownText(text);
}
