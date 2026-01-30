import type { ReadingSession } from './store/settings';

export interface SpeedRecommendation {
  suggestedWPM: number;
  trend: 'improving' | 'stable' | 'declining';
  message: string;
}

export function getSpeedRecommendation(
  sessions: ReadingSession[],
  currentAutoPlayWPM: number
): SpeedRecommendation | null {
  if (sessions.length < 5) return null;

  // Take last 10 sessions (or all if fewer)
  const recent = sessions.slice(0, Math.min(10, sessions.length));
  const avgWPM = Math.round(
    recent.reduce((sum, s) => sum + s.wpm, 0) / recent.length
  );

  // Split into older and newer halves to detect trend
  const midpoint = Math.floor(recent.length / 2);
  const olderHalf = recent.slice(midpoint);
  const newerHalf = recent.slice(0, midpoint);

  const olderAvg =
    olderHalf.reduce((sum, s) => sum + s.wpm, 0) / olderHalf.length;
  const newerAvg =
    newerHalf.reduce((sum, s) => sum + s.wpm, 0) / newerHalf.length;

  const changePct = ((newerAvg - olderAvg) / olderAvg) * 100;

  let trend: 'improving' | 'stable' | 'declining';
  let multiplier: number;

  if (changePct > 5) {
    trend = 'improving';
    multiplier = 1.1; // Suggest 10% above average
  } else if (changePct < -5) {
    trend = 'declining';
    multiplier = 1.0; // Stay at current average
  } else {
    trend = 'stable';
    multiplier = 1.05; // Suggest 5% above average
  }

  const suggestedWPM = Math.round((avgWPM * multiplier) / 10) * 10; // Round to nearest 10

  // Don't suggest if already close to current setting
  if (Math.abs(suggestedWPM - currentAutoPlayWPM) < 20) return null;

  const messages: Record<string, string> = {
    improving: `You're getting faster! Try ${suggestedWPM} WPM`,
    stable: `Based on your sessions, try ${suggestedWPM} WPM`,
    declining: `Your average is ${avgWPM} WPM. Take it steady.`,
  };

  return {
    suggestedWPM,
    trend,
    message: messages[trend],
  };
}
