import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Rect, Path, Line } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { getISOWeekId } from '../lib/date';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Paywall } from '../components/Paywall';
import { Spacing } from '../design/theme';

function getLast8Weeks(): string[] {
  const weeks: string[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const wk = getISOWeekId(d);
    if (!weeks.includes(wk)) weeks.push(wk);
  }
  return weeks.slice(-8);
}

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

export default function InsightsScreen() {
  const { colors, glass, isDark } = useTheme();
  const {
    isPremium,
    totalWordsRead,
    textsCompleted,
    weeklyWordCounts,
    weeklyAvgWPM,
    dailyReadingLog,
    longestStreak,
    currentStreak,
    categoryReadCounts,
    showPaywall,
    setPaywallContext,
    paywallContext,
  } = useSettingsStore();

  const weeks = useMemo(() => getLast8Weeks(), []);
  const last7Days = useMemo(() => getLast7Days(), []);

  // Best WPM across all weeks
  const bestWPM = useMemo(() => {
    const vals = Object.values(weeklyAvgWPM);
    return vals.length > 0 ? Math.max(...vals) : 0;
  }, [weeklyAvgWPM]);

  // Weekly words data for bar chart
  const weeklyData = useMemo(() => {
    return weeks.map((wk) => ({
      week: wk.split('-W')[1],
      words: weeklyWordCounts[wk] ?? 0,
    }));
  }, [weeks, weeklyWordCounts]);

  const maxWeeklyWords = Math.max(1, ...weeklyData.map((d) => d.words));

  // WPM trend data
  const wpmData = useMemo(() => {
    return weeks.map((wk) => weeklyAvgWPM[wk] ?? 0);
  }, [weeks, weeklyAvgWPM]);

  const maxWPM = Math.max(1, ...wpmData);

  // Category distribution
  const categoryData = useMemo(() => {
    const entries = Object.entries(categoryReadCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
    const maxCount = entries.length > 0 ? entries[0][1] : 1;
    return entries.map(([key, count]) => ({
      key,
      count,
      fraction: count / maxCount,
    }));
  }, [categoryReadCounts]);

  // Reading consistency (days read out of last 7)
  const daysRead = useMemo(() => {
    return last7Days.filter((d) => (dailyReadingLog[d] ?? 0) > 0).length;
  }, [last7Days, dailyReadingLog]);

  // Words read this week
  const currentWeekId = getISOWeekId(new Date());
  const wordsThisWeek = weeklyWordCounts[currentWeekId] ?? 0;

  const chartWidth = 280;
  const chartHeight = 120;
  const barWidth = 24;
  const barGap = (chartWidth - barWidth * weeklyData.length) / (weeklyData.length - 1 || 1);

  // WPM trend path
  const wpmPath = useMemo(() => {
    if (wpmData.every((v) => v === 0)) return '';
    const points = wpmData.map((v, i) => {
      const x = (i / (wpmData.length - 1 || 1)) * chartWidth;
      const y = chartHeight - (v / maxWPM) * (chartHeight - 10);
      return `${x},${y}`;
    });
    return 'M' + points.join(' L');
  }, [wpmData, maxWPM]);

  const renderBlurOverlay = () => (
    <View style={styles.blurOverlayContainer}>
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.blurContent}>
        <Feather name="lock" size={24} color={colors.primary} />
        <Text style={[styles.blurTitle, { color: colors.primary }]}>
          You've read {wordsThisWeek.toLocaleString()} words this week
        </Text>
        <Text style={[styles.blurSubtitle, { color: colors.secondary }]}>
          Unlock your full reading insights
        </Text>
        <GlassButton
          title="See Your Progress"
          onPress={() => setPaywallContext('locked_insights')}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary pills */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.summaryRow}>
          <View style={[styles.summaryPill, { backgroundColor: glass.fill, borderColor: glass.border }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {totalWordsRead.toLocaleString()}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>total words</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: glass.fill, borderColor: glass.border }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {textsCompleted}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>texts</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: glass.fill, borderColor: glass.border }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {bestWPM}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>best WPM</Text>
          </View>
        </Animated.View>

        {/* Charts container — blurred for free users */}
        <View style={styles.chartsContainer}>
          {/* Weekly Words bar chart */}
          <Animated.View entering={FadeIn.delay(100).duration(300)}>
            <GlassCard>
              <Text style={[styles.chartTitle, { color: colors.secondary }]}>
                WEEKLY WORDS
              </Text>
              <View style={styles.chartContainer}>
                <Svg width={chartWidth} height={chartHeight}>
                  {weeklyData.map((d, i) => {
                    const x = i * (barWidth + barGap);
                    const barHeight = (d.words / maxWeeklyWords) * (chartHeight - 20);
                    return (
                      <React.Fragment key={d.week}>
                        <Rect
                          x={x}
                          y={chartHeight - barHeight}
                          width={barWidth}
                          height={Math.max(2, barHeight)}
                          rx={4}
                          fill={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}
                        />
                      </React.Fragment>
                    );
                  })}
                </Svg>
                <View style={styles.chartLabels}>
                  {weeklyData.map((d) => (
                    <Text
                      key={d.week}
                      style={[styles.chartLabel, { color: colors.muted, width: barWidth + barGap }]}
                    >
                      W{d.week}
                    </Text>
                  ))}
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* WPM Trend */}
          <Animated.View entering={FadeIn.delay(200).duration(300)}>
            <GlassCard>
              <Text style={[styles.chartTitle, { color: colors.secondary }]}>
                WPM TREND
              </Text>
              <View style={styles.chartContainer}>
                <Svg width={chartWidth} height={chartHeight}>
                  {wpmPath ? (
                    <Path
                      d={wpmPath}
                      fill="none"
                      stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <Line
                      x1={0}
                      y1={chartHeight / 2}
                      x2={chartWidth}
                      y2={chartHeight / 2}
                      stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
                      strokeWidth={1}
                      strokeDasharray="4,4"
                    />
                  )}
                </Svg>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Category Distribution */}
          {categoryData.length > 0 && (
            <Animated.View entering={FadeIn.delay(300).duration(300)}>
              <GlassCard>
                <Text style={[styles.chartTitle, { color: colors.secondary }]}>
                  CATEGORIES
                </Text>
                <View style={styles.categoryBars}>
                  {categoryData.map((cd) => (
                    <View key={cd.key} style={styles.categoryBarRow}>
                      <Text style={[styles.categoryBarLabel, { color: colors.primary }]}>
                        {cd.key}
                      </Text>
                      <View style={[styles.categoryBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <View
                          style={[
                            styles.categoryBarFill,
                            {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                              width: `${cd.fraction * 100}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.categoryBarCount, { color: colors.muted }]}>
                        {cd.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Reading consistency */}
          <Animated.View entering={FadeIn.delay(400).duration(300)}>
            <GlassCard>
              <Text style={[styles.chartTitle, { color: colors.secondary }]}>
                THIS WEEK
              </Text>
              <View style={styles.consistencyRow}>
                {last7Days.map((day) => {
                  const didRead = (dailyReadingLog[day] ?? 0) > 0;
                  const dayLabel = new Date(day + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'narrow' });
                  return (
                    <View key={day} style={styles.consistencyDay}>
                      <View
                        style={[
                          styles.consistencyDot,
                          {
                            backgroundColor: didRead
                              ? colors.primary
                              : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                          },
                        ]}
                      />
                      <Text style={[styles.consistencyLabel, { color: colors.muted }]}>
                        {dayLabel}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={[styles.consistencyText, { color: colors.secondary }]}>
                {daysRead} of 7 days
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Streak records */}
          <Animated.View entering={FadeIn.delay(500).duration(300)}>
            <GlassCard>
              <Text style={[styles.chartTitle, { color: colors.secondary }]}>
                STREAKS
              </Text>
              <View style={styles.streakRow}>
                <View style={styles.streakItem}>
                  <Text style={[styles.streakValue, { color: colors.primary }]}>
                    {currentStreak}
                  </Text>
                  <Text style={[styles.streakLabel, { color: colors.muted }]}>current</Text>
                </View>
                <View style={styles.streakItem}>
                  <Text style={[styles.streakValue, { color: colors.primary }]}>
                    {longestStreak}
                  </Text>
                  <Text style={[styles.streakLabel, { color: colors.muted }]}>longest</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Blur overlay for free users */}
          {!isPremium && renderBlurOverlay()}
        </View>
      </ScrollView>

      <Paywall
        visible={showPaywall}
        onDismiss={() => setPaywallContext(null)}
        context={paywallContext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: 16,
  },
  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    gap: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  // Charts
  chartsContainer: {
    position: 'relative',
    gap: 16,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    gap: 8,
  },
  chartLabels: {
    flexDirection: 'row',
  },
  chartLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  // Category bars
  categoryBars: {
    gap: 10,
  },
  categoryBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBarLabel: {
    width: 70,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: 8,
    borderRadius: 4,
  },
  categoryBarCount: {
    width: 30,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  // Consistency
  consistencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  consistencyDay: {
    alignItems: 'center',
    gap: 4,
  },
  consistencyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  consistencyLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  consistencyText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Streaks
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
    gap: 2,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '400',
  },
  // Blur overlay
  blurOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContent: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  blurTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  blurSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
});
