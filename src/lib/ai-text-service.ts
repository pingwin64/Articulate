/**
 * AI Daily Practice text generation service.
 * Generates personalized reading texts based on user level and preferences.
 */

import { useSettingsStore, getCurrentLevel, getLevelName } from './store/settings';
import type { CustomText } from './store/settings';

const SUPABASE_URL = 'https://mgwkhxlhhrvjgixptcnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nd2toeGxoaHJ2amdpeHB0Y251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyOTI5NTMsImV4cCI6MjA2Mjg2ODk1M30.QmUGVBHewz1Pz6yO3E2bLyXl1dQr8JgR7JcxiXQ-0os';

const CATEGORY_PROMPTS: Record<string, string> = {
  story: 'a self-contained narrative with a beginning, middle, and end',
  essay: 'a reflective personal essay exploring an idea',
  speech: 'an inspirational address or call to action',
  philosophy: 'a contemplative passage exploring a philosophical concept',
  science: 'a clear explanation of a fascinating scientific phenomenon',
  fiction: 'an evocative scene from a literary work',
  poetry: 'a prose poem or lyrical meditation',
  history: 'a vivid historical narrative or eyewitness account',
  wisdom: 'a contemplative passage drawing from world wisdom traditions',
};

const DIFFICULTY_PROMPTS: Record<string, string> = {
  Beginner: 'Use simple, common vocabulary. Short sentences (10-15 words). Concrete language.',
  Intermediate: 'Use moderate vocabulary with some sophisticated words. Mix of sentence lengths. Some abstract concepts.',
  Advanced: 'Use rich, varied vocabulary. Complex sentences with subordinate clauses. Abstract and nuanced concepts.',
  Expert: 'Use advanced vocabulary including domain-specific terms. Complex sentence structures. Dense, layered meaning.',
  Master: 'Use the full range of English vocabulary. Intricate prose style. Deeply nuanced and multi-layered.',
};

/**
 * Generate a daily AI text based on user's level and a random category.
 * Returns a CustomText object ready to be stored.
 */
export async function generateDailyText(): Promise<CustomText> {
  const state = useSettingsStore.getState();
  const level = getCurrentLevel(state.levelProgress);
  const levelName = getLevelName(state.levelProgress);

  // Pick a category based on day of year (deterministic daily rotation)
  const categoryKeys = Object.keys(CATEGORY_PROMPTS);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
  const categoryKey = categoryKeys[dayOfYear % categoryKeys.length];
  const categoryPrompt = CATEGORY_PROMPTS[categoryKey];
  const difficultyPrompt = DIFFICULTY_PROMPTS[levelName] ?? DIFFICULTY_PROMPTS['Intermediate'];

  // Build focus words from saved words (vocabulary adaptation)
  const focusWords = state.savedWords.slice(0, 5).map((w) => w.word);
  const focusPrompt = focusWords.length > 0
    ? `Try to naturally incorporate some of these words: ${focusWords.join(', ')}.`
    : '';

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: 'generate-text',
      difficulty: levelName.toLowerCase(),
      category: categoryKey,
      extraPrompt: `Write ${categoryPrompt}. ${difficultyPrompt} ${focusPrompt} Structure: Topic sentence → supporting details → concluding thought. No cliches. The passage should be 150-250 words.`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate text: ${response.status}`);
  }

  const data = await response.json();

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
