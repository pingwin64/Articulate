/**
 * Difficulty scoring algorithm for reading texts.
 * Returns a 1-10 score from 4 weighted sub-scores.
 */

// Common English words (top ~200) — used for vocabulary rarity scoring
const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
  'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us', 'was', 'were', 'are', 'is', 'had', 'has',
  'been', 'did', 'said', 'each', 'tell', 'does', 'set', 'three', 'own',
  'hand', 'high', 'keep', 'last', 'long', 'make', 'much', 'more', 'must',
  'name', 'never', 'next', 'old', 'part', 'place', 'same', 'should', 'show',
  'small', 'still', 'such', 'under', 'great', 'here', 'through', 'where',
  'before', 'between', 'may', 'world', 'too', 'every', 'found', 'those',
  'very', 'many', 'while', 'down', 'man', 'life', 'little', 'being',
  'another', 'again', 'might', 'left', 'right', 'both', 'head', 'let',
  'put', 'few', 'got', 'things', 'thing', 'nothing', 'without', 'upon',
  'went', 'came', 'made', 'having', 'something', 'always', 'away',
]);

/**
 * Estimate syllable count for a word using heuristic rules.
 */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) return 1;

  let count = 0;
  const vowels = 'aeiouy';
  let prevIsVowel = false;

  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevIsVowel) count++;
    prevIsVowel = isVowel;
  }

  // Adjust for silent e
  if (w.endsWith('e') && count > 1) count--;
  // Adjust for -le endings
  if (w.endsWith('le') && w.length > 2 && !vowels.includes(w[w.length - 3])) count++;

  return Math.max(1, count);
}

/**
 * Compute difficulty score for a text (1-10 scale).
 *
 * Sub-scores (weighted):
 * - Average word length (20%)
 * - Syllables per word (30%)
 * - Sentence complexity (15%)
 * - Vocabulary rarity (35%)
 */
export function computeDifficulty(words: string[]): number {
  if (words.length === 0) return 5;

  // Clean words for analysis
  const cleanWords = words.map((w) => w.toLowerCase().replace(/[^a-z'-]/g, '')).filter((w) => w.length > 0);
  if (cleanWords.length === 0) return 5;

  // 1. Average word length (20%) — normalize to 1-10
  const avgLength = cleanWords.reduce((sum, w) => sum + w.length, 0) / cleanWords.length;
  // avgLength typically 3-8; map to 1-10
  const lengthScore = Math.min(10, Math.max(1, (avgLength - 3) * 1.8 + 1));

  // 2. Syllables per word (30%) — normalize to 1-10
  const avgSyllables = cleanWords.reduce((sum, w) => sum + countSyllables(w), 0) / cleanWords.length;
  // avgSyllables typically 1.2-3.0; map to 1-10
  const syllableScore = Math.min(10, Math.max(1, (avgSyllables - 1.2) * 5 + 1));

  // 3. Sentence complexity (15%) — words per sentence
  const fullText = words.join(' ');
  const sentences = fullText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : words.length;
  // avgSentenceLength typically 10-35; map to 1-10
  const sentenceScore = Math.min(10, Math.max(1, (avgSentenceLength - 10) * 0.36 + 1));

  // 4. Vocabulary rarity (35%) — percentage of uncommon words
  const uncommonCount = cleanWords.filter((w) => w.length >= 3 && !COMMON_WORDS.has(w)).length;
  const rarityPct = uncommonCount / cleanWords.length;
  // rarityPct typically 0.3-0.8; map to 1-10
  const rarityScore = Math.min(10, Math.max(1, (rarityPct - 0.3) * 18 + 1));

  // Weighted sum
  const score = lengthScore * 0.20 + syllableScore * 0.30 + sentenceScore * 0.15 + rarityScore * 0.35;

  // Clamp to 1-10
  return Math.round(Math.min(10, Math.max(1, score)) * 10) / 10;
}

/**
 * Map a 1-10 difficulty score to a tier label.
 */
export type DifficultyTier = 'beginner' | 'intermediate' | 'advanced';

export function getDifficultyTier(score: number): DifficultyTier {
  if (score <= 3.5) return 'beginner';
  if (score <= 6.5) return 'intermediate';
  return 'advanced';
}

/**
 * Get a continuous multiplier from difficulty score (1.0 to 2.5).
 */
export function getDifficultyMultiplier(score: number): number {
  return Math.round((1.0 + ((score - 1) / 9) * 1.5) * 100) / 100;
}

/**
 * Get difficulty badge color.
 */
export function getDifficultyColor(tier: DifficultyTier): string {
  switch (tier) {
    case 'beginner': return '#4CAF50';
    case 'intermediate': return '#FF9800';
    case 'advanced': return '#9C27B0';
  }
}
