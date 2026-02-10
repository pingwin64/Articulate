/**
 * AI Daily Practice text generation service.
 * Generates personalized reading texts based on user level and preferences.
 */

import { useSettingsStore, getCurrentLevel } from './store/settings';
import type { CustomText } from './store/settings';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const CATEGORIES = [
  'story', 'essay', 'speech', 'philosophy', 'science',
  'fiction', 'poetry', 'history', 'wisdom',
];

/**
 * Generate a daily AI text based on user's level and a random category.
 * Returns a CustomText object ready to be stored.
 */
export async function generateDailyText(): Promise<CustomText> {
  const state = useSettingsStore.getState();
  const level = getCurrentLevel(state.levelProgress);

  // Pick a category based on day of year (deterministic daily rotation)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
  const categoryKey = CATEGORIES[dayOfYear % CATEGORIES.length];

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: 'generate-text',
      level: level,
      category: categoryKey,
      wordCount: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate text: ${response.status}`);
  }

  const data = await response.json();

  if (!data.text || data.text.trim().split(/\s+/).length < 10) {
    throw new Error('Generated text was too short');
  }

  const aiText: CustomText = {
    id: `ai-${Date.now().toString(36)}`,
    title: data.title || 'Today\'s Practice',
    text: data.text || '',
    wordCount: (data.text || '').split(/\s+/).length,
    createdAt: new Date().toISOString(),
    timesRead: 0,
    source: 'paste', // stored as CustomText for compatibility
  };

  return aiText;
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
  const text = await generateDailyText();
  state.setDailyAIText(text);
  return text;
}
