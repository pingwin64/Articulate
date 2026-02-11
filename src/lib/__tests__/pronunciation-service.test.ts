import { computeSimilarity, scoreWord } from '../pronunciation-service';

describe('computeSimilarity', () => {
  it('returns 1.0 for identical strings', () => {
    expect(computeSimilarity('hello', 'hello')).toBe(1);
  });

  it('returns 1.0 for identical after normalization', () => {
    expect(computeSimilarity('Hello!', 'hello')).toBe(1);
  });

  it('returns 0 for completely different strings', () => {
    const sim = computeSimilarity('abc', 'xyz');
    expect(sim).toBeLessThan(0.1);
  });

  it('returns 1 for both empty', () => {
    expect(computeSimilarity('', '')).toBe(1);
  });

  it('returns 0 for one empty', () => {
    expect(computeSimilarity('hello', '')).toBe(0);
    expect(computeSimilarity('', 'hello')).toBe(0);
  });

  it('handles punctuation-only strings as empty', () => {
    expect(computeSimilarity('...', '!!!')).toBe(1); // both normalize to empty
  });

  it('is case insensitive', () => {
    expect(computeSimilarity('WORLD', 'world')).toBe(1);
  });

  it('returns high similarity for close words', () => {
    const sim = computeSimilarity('hello', 'helo');
    expect(sim).toBeGreaterThan(0.7);
  });

  it('returns moderate similarity for somewhat different words', () => {
    const sim = computeSimilarity('cat', 'car');
    expect(sim).toBeGreaterThan(0.5);
    expect(sim).toBeLessThan(1.0);
  });
});

describe('scoreWord', () => {
  it('returns perfect for exact match', () => {
    const result = scoreWord('hello', 'hello');
    expect(result.result).toBe('perfect');
    expect(result.similarity).toBe(1);
  });

  it('returns perfect for match with different case/punctuation', () => {
    const result = scoreWord('Hello!', 'hello');
    expect(result.result).toBe('perfect');
  });

  it('returns perfect for similarity >= 0.8', () => {
    // "hell" vs "hello" — 4/5 = 0.8
    const result = scoreWord('hell', 'hello');
    expect(result.result).toBe('perfect');
  });

  it('returns close for similarity >= 0.5 and < 0.8', () => {
    // "hel" vs "hello" — dist=2, max=5, sim=0.6
    const result = scoreWord('hel', 'hello');
    expect(result.result).toBe('close');
  });

  it('returns try_again for similarity < 0.5', () => {
    const result = scoreWord('xyz', 'hello');
    expect(result.result).toBe('try_again');
  });

  it('returns try_again for empty transcription', () => {
    const result = scoreWord('', 'hello');
    expect(result.result).toBe('try_again');
    expect(result.similarity).toBe(0);
  });

  it('preserves original transcribed and expected values', () => {
    const result = scoreWord('Hello!', 'world');
    expect(result.transcribed).toBe('Hello!');
    expect(result.expected).toBe('world');
  });
});
