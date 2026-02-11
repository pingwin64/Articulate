import { getISOWeekId } from '../date';

describe('getISOWeekId', () => {
  it('returns correct week for a known Monday', () => {
    // 2024-01-01 is a Monday — ISO week 1 of 2024
    expect(getISOWeekId(new Date(2024, 0, 1))).toBe('2024-W01');
  });

  it('returns correct week for mid-year date', () => {
    // 2024-06-15 is a Saturday — ISO week 24
    expect(getISOWeekId(new Date(2024, 5, 15))).toBe('2024-W24');
  });

  it('handles year boundary — Dec 31 can be W01 of next year', () => {
    // 2024-12-30 is a Monday — ISO week 1 of 2025
    expect(getISOWeekId(new Date(2024, 11, 30))).toBe('2025-W01');
  });

  it('handles year boundary — Jan 1 can be W52/53 of previous year', () => {
    // 2023-01-01 is a Sunday — ISO week 52 of 2022
    expect(getISOWeekId(new Date(2023, 0, 1))).toBe('2022-W52');
  });

  it('pads single-digit week numbers', () => {
    // 2024-01-08 is W02
    const result = getISOWeekId(new Date(2024, 0, 8));
    expect(result).toMatch(/W\d{2}$/);
  });

  it('returns consistent results for same date', () => {
    const date = new Date(2024, 6, 15);
    expect(getISOWeekId(date)).toBe(getISOWeekId(new Date(2024, 6, 15)));
  });
});
