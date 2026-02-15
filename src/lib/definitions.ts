import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { useSettingsStore } from './store/settings';

export interface WordDefinition {
  word: string;
  syllables: string;
  partOfSpeech: string;
  definition: string;
  etymology?: string;
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
      const userId = useSettingsStore.getState().deviceUserId || 'anonymous';
      const res = await fetch(`${SUPABASE_URL}/functions/v1/word-definition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'x-user-id': userId,
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
    const groupSize = (meaning.definitions || []).length;
    let posIndex = 0;
    for (const def of meaning.definitions || []) {
      const definition = def.definition || '';
      const score = scoreDefinition(definition, pos, contextWords, cleanWord, posIndex, groupSize);
      candidates.push({ partOfSpeech: pos, definition, score });
      posIndex++;
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
 * Fetch etymology for a word from the OpenAI proxy edge function.
 * Returns the etymology string or null on failure.
 */
export async function fetchEtymology(word: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const userId = useSettingsStore.getState().deviceUserId || 'anonymous';
    const res = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'x-user-id': userId,
      },
      body: JSON.stringify({ action: 'fetch-etymology', word }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.etymology || null;
  } catch {
    return null;
  }
}

/**
 * Score a definition based on context relevance, dictionary ordering,
 * and meaning group size.
 *
 * Key signals:
 * 1. Order within POS group — first definitions are most common
 * 2. Meaning group size — POS with more definitions = primary usage
 *    (e.g., "have" has 20+ verb defs but only 3 noun defs → verb is primary)
 * 3. Context word matching — surrounding sentence provides disambiguation
 */
function scoreDefinition(
  definition: string,
  partOfSpeech: string,
  contextWords: string[],
  targetWord: string,
  orderIndex: number,
  meaningGroupSize: number
): number {
  let score = 0;
  const defLower = definition.toLowerCase();

  // ORDER WITHIN POS GROUP: First definition in each POS group is most common.
  // +15 for first, decaying by 3 per position.
  score += Math.max(0, 15 - orderIndex * 3);

  // MEANING GROUP SIZE: More definitions = more important POS for this word.
  // "have" verb (27 defs) vs noun (2 defs) → verb group gets much bigger bonus.
  // "big" adj (13 defs) vs verb (2 defs) → adjective group wins.
  // Capped at +15 so very large groups don't runaway.
  score += Math.min(15, meaningGroupSize);

  // Penalize animal-specific definitions for common words
  if (defLower.includes('animal') || defLower.includes('species') || defLower.includes('mammal')) {
    score -= 15;
  }

  // Boost for matching context words in the definition
  for (const word of contextWords) {
    if (word !== targetWord && word.length > 3 && defLower.includes(word)) {
      score += 5;
    }
  }

  // Penalize technical/rare/archaic meanings
  const technicalTerms = [
    'archaic', 'obsolete', 'rare', 'dialect',
    'zoology', 'botany', 'geology', 'nautical',
    'heraldry', 'falconry'
  ];
  for (const term of technicalTerms) {
    if (defLower.includes(term)) {
      score -= 10;
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
