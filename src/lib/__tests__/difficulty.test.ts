import {
  computeDifficulty,
  getDifficultyTier,
  getDifficultyMultiplier,
} from '../data/difficulty';

// countSyllables is not exported, but we can test it indirectly through computeDifficulty
// and test getDifficultyTier / getDifficultyMultiplier directly

describe('getDifficultyTier', () => {
  it('returns beginner for score <= 3.5', () => {
    expect(getDifficultyTier(1)).toBe('beginner');
    expect(getDifficultyTier(3.5)).toBe('beginner');
  });

  it('returns intermediate for 3.5 < score <= 6.5', () => {
    expect(getDifficultyTier(3.6)).toBe('intermediate');
    expect(getDifficultyTier(5)).toBe('intermediate');
    expect(getDifficultyTier(6.5)).toBe('intermediate');
  });

  it('returns advanced for score > 6.5', () => {
    expect(getDifficultyTier(6.6)).toBe('advanced');
    expect(getDifficultyTier(10)).toBe('advanced');
  });
});

describe('getDifficultyMultiplier', () => {
  it('returns 1.0 for score 1', () => {
    expect(getDifficultyMultiplier(1)).toBe(1.0);
  });

  it('returns 2.5 for score 10', () => {
    expect(getDifficultyMultiplier(10)).toBe(2.5);
  });

  it('returns ~1.75 for score 5.5 (midrange)', () => {
    const mult = getDifficultyMultiplier(5.5);
    expect(mult).toBeGreaterThan(1.5);
    expect(mult).toBeLessThan(2.0);
  });

  it('increases monotonically', () => {
    for (let score = 1; score < 10; score++) {
      expect(getDifficultyMultiplier(score + 1)).toBeGreaterThan(
        getDifficultyMultiplier(score)
      );
    }
  });
});

describe('computeDifficulty', () => {
  it('returns 5 for empty word list', () => {
    expect(computeDifficulty([])).toBe(5);
  });

  it('returns low score for simple common words', () => {
    const simple = ['the', 'cat', 'sat', 'on', 'the', 'mat.'];
    const score = computeDifficulty(simple);
    expect(score).toBeLessThan(5);
  });

  it('returns higher score for complex vocabulary', () => {
    const complex = [
      'The', 'epistemological', 'ramifications', 'of', 'quantum',
      'entanglement', 'necessitate', 'a', 'fundamental', 'reconceptualization',
      'of', 'our', 'ontological', 'presuppositions.', 'Furthermore,',
      'the', 'hermeneutical', 'implications', 'demand', 'unprecedented',
      'interdisciplinary', 'collaboration.',
    ];
    const score = computeDifficulty(complex);
    expect(score).toBeGreaterThan(5);
  });

  it('complex text scores higher than simple text', () => {
    const simple = ['I', 'like', 'the', 'big', 'red', 'dog.'];
    const complex = [
      'Unprecedented', 'metamorphosis', 'characterized', 'the',
      'extraordinary', 'transformation.',
    ];
    expect(computeDifficulty(complex)).toBeGreaterThan(
      computeDifficulty(simple)
    );
  });

  it('score is between 1 and 10', () => {
    const words = ['hello', 'world', 'this', 'is', 'a', 'test.'];
    const score = computeDifficulty(words);
    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(10);
  });
});
