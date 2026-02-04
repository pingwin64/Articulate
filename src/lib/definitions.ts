import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export interface WordDefinition {
  word: string;
  syllables: string;
  partOfSpeech: string;
  definition: string;
}

interface DefinitionCandidate {
  partOfSpeech: string;
  definition: string;
  score: number;
}

/**
 * Fetch word definition from Supabase, with fallback to Free Dictionary API
 * @param word - The word to look up
 * @param context - Optional surrounding sentence for context-aware definitions
 */
export async function fetchDefinition(
  word: string,
  context?: string
): Promise<WordDefinition> {
  // Try Supabase first if configured
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/word-definition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ word, context }),
      });

      if (res.ok) {
        const data = await res.json();
        // Validate response has actual content
        if (data.word && data.definition) {
          // Convert IPA phonetics to readable syllables
          return {
            ...data,
            syllables: splitIntoSyllables(data.word),
          };
        }
      }
    } catch {
      // Fall through to fallback API
    }
  }

  // Fallback to Free Dictionary API
  const cleanWord = word.toLowerCase().replace(/[^a-z'-]/g, '');
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
  );

  if (!res.ok) {
    throw new Error('Word not found');
  }

  const data = await res.json();
  const entry = data[0];

  if (!entry) {
    throw new Error('Word not found');
  }

  // Collect all definitions with context-based scoring
  const candidates: DefinitionCandidate[] = [];
  const contextWords = context
    ? context.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    : [];

  for (const meaning of entry.meanings || []) {
    const pos = meaning.partOfSpeech || 'unknown';
    for (const def of meaning.definitions || []) {
      const definition = def.definition || '';
      const score = scoreDefinition(definition, pos, contextWords, cleanWord);
      candidates.push({ partOfSpeech: pos, definition, score });
    }
  }

  // Sort by score (highest first) and pick the best
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0] || {
    partOfSpeech: 'unknown',
    definition: 'No definition available',
  };

  return {
    word: entry.word || cleanWord,
    syllables: splitIntoSyllables(entry.word || cleanWord),
    partOfSpeech: best.partOfSpeech,
    definition: best.definition,
  };
}

/**
 * Score a definition based on context relevance
 * Higher score = more likely to be the correct/common meaning
 */
function scoreDefinition(
  definition: string,
  partOfSpeech: string,
  contextWords: string[],
  targetWord: string
): number {
  let score = 0;
  const defLower = definition.toLowerCase();

  // HEAVILY boost human-related definitions (most common meanings for people words)
  const humanTerms = ['human', 'person', 'people', 'child', 'woman', 'man', 'female', 'male', 'young woman', 'young man', 'boy', 'girl'];
  for (const term of humanTerms) {
    if (defLower.includes(term) && !defLower.includes('animal')) {
      score += 20;
    }
  }

  // HEAVILY penalize animal-specific definitions for common words
  if (defLower.includes('animal') || defLower.includes('species') || defLower.includes('mammal')) {
    score -= 25;
  }

  // Boost for matching context words in the definition
  for (const word of contextWords) {
    if (word !== targetWord && word.length > 3 && defLower.includes(word)) {
      score += 10;
    }
  }

  // Boost common/primary meanings (shorter definitions often more common)
  if (definition.length < 60) score += 3;
  if (definition.length < 40) score += 2;

  // Boost for common parts of speech in reading context
  if (partOfSpeech === 'noun') score += 3;
  if (partOfSpeech === 'verb') score += 2;
  if (partOfSpeech === 'adjective') score += 1;

  // Penalize technical/rare/archaic meanings
  const technicalTerms = [
    'architecture', 'edifice', 'computing', 'programming',
    'biology', 'chemistry', 'physics', 'mathematics',
    'legal', 'archaic', 'obsolete', 'rare', 'dialect',
    'zoology', 'botany', 'geology', 'nautical'
  ];
  for (const term of technicalTerms) {
    if (defLower.includes(term)) {
      score -= 10;
    }
  }

  // Boost definitions about narrative/story meanings
  const narrativeTerms = ['narrative', 'tale', 'account', 'book', 'read', 'written', 'fiction', 'plot', 'story'];
  for (const term of narrativeTerms) {
    if (defLower.includes(term)) {
      score += 8;
    }
  }

  // Boost everyday/common meanings
  const commonTerms = ['a person', 'someone', 'something', 'the act of', 'to make', 'to do', 'to be'];
  for (const term of commonTerms) {
    if (defLower.includes(term)) {
      score += 5;
    }
  }

  return score;
}

/**
 * Split a word into syllables using linguistic rules
 * Returns word with middle dots (·) between syllables
 */
function splitIntoSyllables(word: string): string {
  const lower = word.toLowerCase();

  // Common word syllable patterns (override for accuracy)
  const knownSyllables: Record<string, string> = {
    'beneath': 'be·neath',
    'above': 'a·bove',
    'below': 'be·low',
    'between': 'be·tween',
    'because': 'be·cause',
    'before': 'be·fore',
    'behind': 'be·hind',
    'believe': 'be·lieve',
    'beyond': 'be·yond',
    'beautiful': 'beau·ti·ful',
    'about': 'a·bout',
    'again': 'a·gain',
    'against': 'a·gainst',
    'always': 'al·ways',
    'another': 'an·oth·er',
    'around': 'a·round',
    'away': 'a·way',
    'every': 'ev·ery',
    'everything': 'ev·ery·thing',
    'everyone': 'ev·ery·one',
    'people': 'peo·ple',
    'little': 'lit·tle',
    'water': 'wa·ter',
    'other': 'oth·er',
    'under': 'un·der',
    'over': 'o·ver',
    'after': 'af·ter',
    'never': 'nev·er',
    'together': 'to·geth·er',
    'important': 'im·por·tant',
    'different': 'dif·fer·ent',
    'something': 'some·thing',
    'nothing': 'noth·ing',
    'anything': 'any·thing',
    'through': 'through',
    'thought': 'thought',
    'should': 'should',
    'would': 'would',
    'could': 'could',
    'without': 'with·out',
    'within': 'with·in',
  };

  if (knownSyllables[lower]) {
    return knownSyllables[lower];
  }

  // Algorithmic syllable splitting
  // Based on common English syllabification rules
  let result = lower;

  // Rule 1: Split before consonant + vowel (CV pattern)
  // Rule 2: Split between two consonants (VC-CV)
  // Rule 3: Keep consonant blends together (bl, br, ch, cl, cr, dr, fl, fr, gl, gr, pl, pr, sc, sh, sk, sl, sm, sn, sp, st, sw, th, tr, tw, wh, wr)

  const vowels = 'aeiouy';
  const blends = ['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr', 'ck', 'ng', 'nk', 'qu'];

  const chars = result.split('');
  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < chars.length; i++) {
    current += chars[i];

    // Check if we should split here
    if (i < chars.length - 1) {
      const curr = chars[i];
      const next = chars[i + 1];
      const nextNext = chars[i + 2] || '';

      const currIsVowel = vowels.includes(curr);
      const nextIsVowel = vowels.includes(next);
      const nextNextIsVowel = vowels.includes(nextNext);

      // Split between vowel and consonant followed by vowel (V-CV)
      if (currIsVowel && !nextIsVowel && nextNextIsVowel) {
        // Check if next two chars form a blend
        const potentialBlend = next + nextNext;
        if (!blends.some(b => potentialBlend.startsWith(b))) {
          // Don't split yet, let consonant go with next syllable
        }
      }

      // Split between two consonants (VC-CV) unless they form a blend
      if (!currIsVowel && !nextIsVowel && current.length > 1) {
        const potentialBlend = curr + next;
        if (!blends.includes(potentialBlend)) {
          // Check if there's a vowel before this consonant
          const hasVowelBefore = current.slice(0, -1).split('').some(c => vowels.includes(c));
          if (hasVowelBefore && nextNextIsVowel) {
            syllables.push(current);
            current = '';
          }
        }
      }
    }
  }

  if (current) {
    syllables.push(current);
  }

  // If algorithm produced only one syllable for a long word, use simple fallback
  if (syllables.length === 1 && lower.length > 4) {
    return simpleSyllableSplit(lower);
  }

  return syllables.join('·');
}

/**
 * Simple fallback syllable split for when the algorithm fails
 */
function simpleSyllableSplit(word: string): string {
  const vowels = 'aeiouy';
  const parts: string[] = [];
  let current = '';
  let lastWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const isVowel = vowels.includes(char);

    current += char;

    // After a vowel group, if we hit consonants followed by a vowel, consider splitting
    if (lastWasVowel && !isVowel && i < word.length - 1) {
      const remaining = word.slice(i + 1);
      const hasVowelAhead = remaining.split('').some(c => vowels.includes(c));

      if (hasVowelAhead && current.length > 1) {
        // Split before this consonant
        parts.push(current.slice(0, -1));
        current = char;
      }
    }

    lastWasVowel = isVowel;
  }

  if (current) {
    parts.push(current);
  }

  return parts.length > 1 ? parts.join('·') : word;
}
