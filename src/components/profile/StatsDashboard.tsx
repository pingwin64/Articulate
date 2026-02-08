import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import {
  getCurrentLevel,
  getLevelName,
  getProgressToNextLevel,
  getWordsToNextLevel,
  LEVEL_NAMES,
} from '../../lib/store/settings';
import { getISOWeekId } from '../../lib/date';
import { GlassCard } from '../GlassCard';
import { StatCard } from '../StatCard';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function getLast7Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

interface StatsDashboardProps {
  reduceMotion: boolean;
}

export function StatsDashboard({ reduceMotion }: StatsDashboardProps) {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();

  const dailyWordsToday = useSettingsStore((s) => s.dailyWordsToday);
  const dailyWordGoal = useSettingsStore((s) => s.dailyWordGoal);
  const dailyReadingLog = useSettingsStore((s) => s.dailyReadingLog);
  const totalWordsRead = useSettingsStore((s) => s.totalWordsRead);
  const currentStreak = useSettingsStore((s) => s.currentStreak);
  const weeklyAvgWPM = useSettingsStore((s) => s.weeklyAvgWPM);
  const avgComprehension = useSettingsStore((s) => s.avgComprehension);
  const levelProgress = useSettingsStore((s) => s.levelProgress);

  // Progress ring calculations
  const ringSize = 64;
  const strokeWidth = 5;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const goalProgress = Math.min(1, dailyWordGoal > 0 ? dailyWordsToday / dailyWordGoal : 0);
  const goalPercent = Math.round(goalProgress * 100);

  // Animated progress ring
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      animatedProgress.value = goalProgress;
    } else {
      animatedProgress.value = withTiming(goalProgress, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [goalProgress, reduceMotion, animatedProgress]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - animatedProgress.value * circumference,
  }));

  const trackColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const barActiveColor = colors.primary;
  const barInactiveColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';

  // Weekly data
  const last7Days = useMemo(() => getLast7Days(), []);
  const todayKey = last7Days[last7Days.length - 1];

  const weeklyBarData = useMemo(() => {
    return last7Days.map((day) => dailyReadingLog[day] ?? 0);
  }, [last7Days, dailyReadingLog]);

  const maxWords = useMemo(() => Math.max(...weeklyBarData, 1), [weeklyBarData]);

  // Day labels — start from correct weekday
  const dayLabels = useMemo(() => {
    return last7Days.map((day) => {
      const d = new Date(day + 'T12:00:00');
      return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
    });
  }, [last7Days]);

  // Weekly avg WPM
  const currentWeekId = useMemo(() => getISOWeekId(new Date()), []);
  const currentWPM = weeklyAvgWPM[currentWeekId] ?? 0;

  // Level data
  const currentLevel = getCurrentLevel(levelProgress);
  const levelName = getLevelName(levelProgress);
  const progressPercent = getProgressToNextLevel(levelProgress);
  const wordsToNext = getWordsToNextLevel(levelProgress);
  const isMaster = currentLevel >= 5;
  const nextLevelName = currentLevel < 5 ? LEVEL_NAMES[currentLevel] : null;

  // Bar chart dimensions
  const barWidth = 24;
  const barGap = 8;
  const maxBarHeight = 48;
  const chartWidth = 7 * barWidth + 6 * barGap;
  const chartHeight = maxBarHeight + 4;

  const entering = reduceMotion ? undefined : FadeIn.delay(80).duration(400);

  return (
    <Animated.View entering={entering}>
      <GlassCard>
        {/* A) Daily Goal Progress Ring */}
        <View style={styles.ringSection}>
          <View style={styles.ringContainer}>
            <Svg width={ringSize} height={ringSize}>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={trackColor}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={barActiveColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                animatedProps={animatedCircleProps}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            </Svg>
            <View style={styles.ringTextOverlay}>
              <Text style={[styles.ringPercent, { color: colors.primary }]}>
                {goalPercent}%
              </Text>
            </View>
          </View>
          <Text style={[styles.ringLabel, { color: colors.muted }]}>
            {dailyWordsToday} / {dailyWordGoal} words today
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: glass.border }]} />

        {/* B) Weekly Activity Bars */}
        <View style={styles.barsSection}>
          <View style={styles.barsContainer}>
            <Svg width={chartWidth} height={chartHeight}>
              {weeklyBarData.map((words, i) => {
                const barHeight = Math.max(3, (words / maxWords) * maxBarHeight);
                const x = i * (barWidth + barGap);
                const y = chartHeight - barHeight;
                const isToday = last7Days[i] === todayKey;
                return (
                  <Rect
                    key={last7Days[i]}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={4}
                    fill={isToday ? barActiveColor : barInactiveColor}
                  />
                );
              })}
            </Svg>
          </View>
          <View style={[styles.dayLabelsRow, { width: chartWidth }]}>
            {dayLabels.map((label, i) => (
              <Text
                key={`${label}-${i}`}
                style={[styles.dayLabel, { color: colors.muted, width: barWidth }]}
              >
                {label}
              </Text>
            ))}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: glass.border }]} />

        {/* C) Stat Cards Row */}
        <View style={styles.statsRow}>
          <StatCard label="WORDS" value={formatNumber(totalWordsRead)} />
          <StatCard label="STREAK" value={String(currentStreak)} />
          <StatCard label="AVG WPM" value={currentWPM > 0 ? String(currentWPM) : '-'} />
          <StatCard label="COMP." value={avgComprehension > 0 ? `${avgComprehension}%` : '-'} />
        </View>

        <View style={[styles.divider, { backgroundColor: glass.border }]} />

        {/* D) Level Progress Bar */}
        <Pressable onPress={() => router.push('/achievements')}>
          <View style={styles.levelSection}>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  borderColor: glass.border,
                },
              ]}
            >
              <Text style={[styles.levelNumber, { color: colors.primary }]}>
                {currentLevel}
              </Text>
            </View>

            <View style={styles.levelInfo}>
              <View style={styles.levelHeader}>
                <Text style={[styles.levelTitle, { color: colors.primary }]}>
                  {levelName}
                </Text>
                <Feather name="chevron-right" size={16} color={colors.muted} />
              </View>

              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${progressPercent}%`,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.levelProgressText, { color: colors.muted }]}>
                {isMaster
                  ? 'Mastery Achieved'
                  : `${wordsToNext.toLocaleString()} words to ${nextLevelName}`}
              </Text>
            </View>
          </View>
        </Pressable>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Ring section
  ringSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ringContainer: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  ringTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringPercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  ringLabel: {
    fontSize: 13,
    fontWeight: '400',
  },

  // Divider
  divider: {
    height: 0.5,
  },

  // Bars section
  barsSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  barsContainer: {
    alignItems: 'center',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
  },

  // Level section
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  levelInfo: {
    flex: 1,
    gap: 6,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  levelProgressText: {
    fontSize: 12,
    fontWeight: '400',
  },
});
