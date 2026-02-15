import {
  getCurrentLevel,
  getProgressToNextLevel,
  getWordsToNextLevel,
} from '../store/settings';

describe('getCurrentLevel', () => {
  it('returns level 1 for 0 words', () => {
    expect(getCurrentLevel(0)).toBe(1);
  });

  it('returns level 1 just below threshold', () => {
    expect(getCurrentLevel(749)).toBe(1);
  });

  it('returns level 2 at exactly 750', () => {
    expect(getCurrentLevel(750)).toBe(2);
  });

  it('returns level 2 just below 2500', () => {
    expect(getCurrentLevel(2499)).toBe(2);
  });

  it('returns level 3 at 2500', () => {
    expect(getCurrentLevel(2500)).toBe(3);
  });

  it('returns level 3 just below 5500', () => {
    expect(getCurrentLevel(5499)).toBe(3);
  });

  it('returns level 4 at 5500', () => {
    expect(getCurrentLevel(5500)).toBe(4);
  });

  it('returns level 4 just below 10000', () => {
    expect(getCurrentLevel(9999)).toBe(4);
  });

  it('returns level 5 at 10000', () => {
    expect(getCurrentLevel(10000)).toBe(5);
  });

  it('returns level 5 for very large values', () => {
    expect(getCurrentLevel(50000)).toBe(5);
  });
});

describe('getProgressToNextLevel', () => {
  it('returns 0% at start of level 1', () => {
    expect(getProgressToNextLevel(0)).toBe(0);
  });

  it('returns ~50% halfway through level 1', () => {
    // Level 1: 0-750, halfway = 375
    expect(getProgressToNextLevel(375)).toBe(50);
  });

  it('returns 100% at end of level 1 (= start of level 2)', () => {
    // At 750, you're now level 2 with 0% progress
    expect(getProgressToNextLevel(750)).toBe(0);
  });

  it('returns ~50% halfway through level 2', () => {
    // Level 2: 750-2500, range = 1750, halfway = 750 + 875 = 1625
    expect(getProgressToNextLevel(1625)).toBe(50);
  });

  it('handles endgame milestones (level 5+)', () => {
    // At 15000: milestone = 20000, prev = 10000, progress = 5000/10000 = 50%
    expect(getProgressToNextLevel(15000)).toBe(50);
  });

  it('returns 0% at exact endgame milestone (new cycle)', () => {
    expect(getProgressToNextLevel(20000)).toBe(0);
  });

  it('returns 0% just past milestone', () => {
    // 20001: milestone = 30000, prev = 20000, progress = 1/10000 ~ 0%
    expect(getProgressToNextLevel(20001)).toBe(0);
  });

  it('clamps invalid negative progress to 0%', () => {
    expect(getProgressToNextLevel(-250)).toBe(0);
  });

  it('clamps non-finite progress to 0%', () => {
    expect(getProgressToNextLevel(Number.NaN)).toBe(0);
  });
});

describe('getWordsToNextLevel', () => {
  it('returns 750 at start', () => {
    expect(getWordsToNextLevel(0)).toBe(750);
  });

  it('returns 1 word at 749', () => {
    expect(getWordsToNextLevel(749)).toBe(1);
  });

  it('returns 1750 at level 2 start', () => {
    expect(getWordsToNextLevel(750)).toBe(1750);
  });

  it('handles endgame: words to next 10K milestone', () => {
    expect(getWordsToNextLevel(15000)).toBe(5000);
  });

  it('returns 10000 at exact milestone boundary', () => {
    expect(getWordsToNextLevel(20000)).toBe(10000);
  });
});
