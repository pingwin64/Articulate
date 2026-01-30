import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';

export function TodaysInsight() {
  const { colors } = useTheme();
  const {
    lifetimeWordsRead,
    textsCompleted,
    bestStreak,
    currentStreak,
    totalTimeSpent,
    bestWPM,
    readingHistory,
    baselineWPM,
  } = useSettingsStore();

  const insight = useMemo(() => {
    // Cycle through insights based on day of year
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const avgWPM =
      readingHistory.length > 0
        ? Math.round(
            readingHistory.reduce((sum, s) => sum + s.wpm, 0) /
              readingHistory.length
          )
        : 0;

    const totalMinutes = Math.round(totalTimeSpent / 60);

    // Speed improvement over baseline
    const speedImprovement =
      baselineWPM && avgWPM > 0
        ? Math.round(((avgWPM - baselineWPM) / baselineWPM) * 100)
        : null;

    const insights = [
      lifetimeWordsRead > 0
        ? `You've read ${lifetimeWordsRead.toLocaleString()} words in total`
        : null,
      avgWPM > 0 ? `Your average reading speed is ${avgWPM} WPM` : null,
      textsCompleted > 0
        ? `${textsCompleted} ${textsCompleted === 1 ? 'text' : 'texts'} completed so far`
        : null,
      bestStreak > 1 ? `Your best streak was ${bestStreak} days` : null,
      speedImprovement !== null && speedImprovement > 0
        ? `You're reading ${speedImprovement}% faster than your baseline`
        : null,
      totalMinutes > 0
        ? `${totalMinutes} ${totalMinutes === 1 ? 'minute' : 'minutes'} of focused reading`
        : null,
      currentStreak > 1
        ? `${currentStreak} days in a row and counting`
        : null,
    ].filter(Boolean) as string[];

    if (insights.length === 0) return null;

    return insights[dayOfYear % insights.length];
  }, [
    lifetimeWordsRead,
    textsCompleted,
    bestStreak,
    currentStreak,
    totalTimeSpent,
    bestWPM,
    readingHistory,
    baselineWPM,
  ]);

  if (!insight) return null;

  return (
    <Animated.View entering={FadeIn.delay(200).duration(400)}>
      <Text style={[styles.insight, { color: colors.muted }]}>{insight}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  insight: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
});
