import React, { useMemo, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Rect, Path, Line, Text as SvgText } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { getISOWeekId, getWeekStart } from '../lib/date';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { WeeklySummaryShareCard } from '../components/WeeklySummaryShareCard';
import { captureAndShare } from '../lib/share';
import { Paywall } from '../components/Paywall';
import { Spacing } from '../design/theme';

function formatCompact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return String(n);
}

function niceMax(value: number): number {
  if (value <= 0) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(value)));
  const norm = value / mag;
  if (norm <= 1) return mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

const Y_AXIS_WIDTH = 35;

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
    totalQuizzesTaken,
    perfectQuizzes,
    avgComprehension,
    perfectPronunciations,
    totalPronunciationAttempts,
  } = useSettingsStore();

  const readingHistory = useSettingsStore((s) => s.readingHistory);
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const weeklySummaryRef = useRef<View>(null);

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

  // ─── Weekly share data ────────────────────────────────────
  const weekShareData = useMemo(() => {
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Texts this week from readingHistory
    const thisWeekEntries = readingHistory.filter((e) => {
      const d = new Date(e.completedAt);
      return d >= weekStart && d < weekEnd;
    });
    const textsThisWeekCount = thisWeekEntries.length;

    // Top category from this week's entries
    const catCounts: Record<string, number> = {};
    thisWeekEntries.forEach((e) => {
      catCounts[e.categoryKey] = (catCounts[e.categoryKey] ?? 0) + 1;
    });
    const topCat = Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0]?.[0];

    // Reading days booleans (Mon-Sun)
    const readingDaysBool: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const key = day.toISOString().split('T')[0];
      readingDaysBool.push((dailyReadingLog[key] ?? 0) > 0);
    }

    const activeDays = readingDaysBool.filter(Boolean).length;

    const weekNum = currentWeekId.split('-W')[1];
    const weekLabel = `Week ${parseInt(weekNum, 10)}`;

    return {
      weekLabel,
      wordsRead: wordsThisWeek,
      textsRead: textsThisWeekCount,
      topCategory: topCat,
      readingDays: readingDaysBool,
      daysActive: activeDays,
    };
  }, [readingHistory, dailyReadingLog, wordsThisWeek, currentWeekId]);

  const handleShareWeek = async () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await captureAndShare(
      weeklySummaryRef,
      `I read ${wordsThisWeek.toLocaleString()} words this week on Articulate!\n\nImprove your reading one word at a time.`,
      'Share your week'
    );
  };

  const chartWidth = 280;
  const chartHeight = 120;
  const plotWidth = chartWidth - Y_AXIS_WIDTH;
  const barWidth = 24;
  const barGap = (plotWidth - barWidth * weeklyData.length) / (weeklyData.length - 1 || 1);
  const niceMaxWords = niceMax(maxWeeklyWords);
  const yTicksWords = [0, Math.round(niceMaxWords / 2), niceMaxWords];

  // WPM trend — compute min/max for Y-axis
  const minWPM = useMemo(() => {
    const nonZero = wpmData.filter((v) => v > 0);
    return nonZero.length > 0 ? Math.min(...nonZero) : 0;
  }, [wpmData]);

  const wpmPadding = 10; // top/bottom padding in SVG
  const wpmPlotHeight = chartHeight - wpmPadding * 2;

  // WPM trend path
  const wpmPath = useMemo(() => {
    if (wpmData.every((v) => v === 0)) return '';
    const range = maxWPM - minWPM || 1;
    const points = wpmData.map((v, i) => {
      const x = Y_AXIS_WIDTH + (i / (wpmData.length - 1 || 1)) * plotWidth;
      const y = wpmPadding + wpmPlotHeight - ((v - minWPM) / range) * wpmPlotHeight;
      return `${x},${y}`;
    });
    return 'M' + points.join(' L');
  }, [wpmData, maxWPM, minWPM, plotWidth, wpmPlotHeight]);

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
                  {/* Y-axis labels */}
                  {yTicksWords.map((tick) => {
                    const y = chartHeight - (tick / niceMaxWords) * (chartHeight - 20);
                    return (
                      <SvgText
                        key={tick}
                        x={Y_AXIS_WIDTH - 6}
                        y={y + 3}
                        fontSize={9}
                        fill={colors.muted}
                        textAnchor="end"
                      >
                        {formatCompact(tick)}
                      </SvgText>
                    );
                  })}
                  {/* Bars */}
                  {weeklyData.map((d, i) => {
                    const x = Y_AXIS_WIDTH + i * (barWidth + barGap);
                    const barHeight = (d.words / niceMaxWords) * (chartHeight - 20);
                    return (
                      <Rect
                        key={d.week}
                        x={x}
                        y={chartHeight - barHeight}
                        width={barWidth}
                        height={Math.max(2, barHeight)}
                        rx={4}
                        fill={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}
                      />
                    );
                  })}
                </Svg>
                <View style={[styles.chartLabels, { paddingLeft: Y_AXIS_WIDTH }]}>
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
                    <>
                      {/* Y-axis labels: min and max WPM */}
                      <SvgText
                        x={Y_AXIS_WIDTH - 6}
                        y={wpmPadding + 3}
                        fontSize={9}
                        fill={colors.muted}
                        textAnchor="end"
                      >
                        {maxWPM}
                      </SvgText>
                      <SvgText
                        x={Y_AXIS_WIDTH - 6}
                        y={wpmPadding + wpmPlotHeight + 3}
                        fontSize={9}
                        fill={colors.muted}
                        textAnchor="end"
                      >
                        {minWPM}
                      </SvgText>
                      {/* Faint gridlines at min and max */}
                      <Line
                        x1={Y_AXIS_WIDTH}
                        y1={wpmPadding}
                        x2={chartWidth}
                        y2={wpmPadding}
                        stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                        strokeWidth={0.5}
                      />
                      <Line
                        x1={Y_AXIS_WIDTH}
                        y1={wpmPadding + wpmPlotHeight}
                        x2={chartWidth}
                        y2={wpmPadding + wpmPlotHeight}
                        stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                        strokeWidth={0.5}
                      />
                      {/* Trend line */}
                      <Path
                        d={wpmPath}
                        fill="none"
                        stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : (
                    <Line
                      x1={Y_AXIS_WIDTH}
                      y1={chartHeight / 2}
                      x2={chartWidth}
                      y2={chartHeight / 2}
                      stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
                      strokeWidth={1}
                      strokeDasharray="4,4"
                    />
                  )}
                </Svg>
                <View style={[styles.chartLabels, { paddingLeft: Y_AXIS_WIDTH }]}>
                  {weeks.map((wk) => (
                    <Text
                      key={wk}
                      style={[styles.chartLabel, { color: colors.muted, width: plotWidth / weeks.length }]}
                    >
                      W{wk.split('-W')[1]}
                    </Text>
                  ))}
                </View>
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

          {/* Quiz insights */}
          {totalQuizzesTaken > 0 && (
            <Animated.View entering={FadeIn.delay(600).duration(300)}>
              <GlassCard>
                <Text style={[styles.chartTitle, { color: colors.secondary }]}>
                  QUIZZES
                </Text>
                <View style={styles.streakRow}>
                  <View style={styles.streakItem}>
                    <Text style={[styles.streakValue, { color: colors.primary }]}>
                      {totalQuizzesTaken}
                    </Text>
                    <Text style={[styles.streakLabel, { color: colors.muted }]}>taken</Text>
                  </View>
                  <View style={styles.streakItem}>
                    <Text style={[styles.streakValue, { color: colors.primary }]}>
                      {perfectQuizzes}
                    </Text>
                    <Text style={[styles.streakLabel, { color: colors.muted }]}>perfect</Text>
                  </View>
                  <View style={styles.streakItem}>
                    <Text style={[styles.streakValue, { color: colors.primary }]}>
                      {avgComprehension}%
                    </Text>
                    <Text style={[styles.streakLabel, { color: colors.muted }]}>comprehension</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Pronunciation insights */}
          {totalPronunciationAttempts > 0 && (
            <Animated.View entering={FadeIn.delay(700).duration(300)}>
              <GlassCard>
                <Text style={[styles.chartTitle, { color: colors.secondary }]}>
                  PRONUNCIATION
                </Text>
                <View style={styles.streakRow}>
                  <View style={styles.streakItem}>
                    <Text style={[styles.streakValue, { color: colors.primary }]}>
                      {perfectPronunciations}
                    </Text>
                    <Text style={[styles.streakLabel, { color: colors.muted }]}>perfect</Text>
                  </View>
                  <View style={styles.streakItem}>
                    <Text style={[styles.streakValue, { color: colors.primary }]}>
                      {Math.round((perfectPronunciations / totalPronunciationAttempts) * 100)}%
                    </Text>
                    <Text style={[styles.streakLabel, { color: colors.muted }]}>accuracy</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Share Your Week */}
          {isPremium && (
            <Animated.View entering={FadeIn.delay(800).duration(300)}>
              <Pressable
                onPress={handleShareWeek}
                style={({ pressed }) => [
                  styles.shareWeekButton,
                  { borderColor: glass.border, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="share" size={16} color={colors.secondary} />
                <Text style={[styles.shareWeekText, { color: colors.secondary }]}>
                  Share Your Week
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Blur overlay for free users */}
          {!isPremium && renderBlurOverlay()}
        </View>
      </ScrollView>

      {/* Off-screen share card for weekly summary capture */}
      <View style={styles.offScreenContainer} pointerEvents="none">
        <WeeklySummaryShareCard
          ref={weeklySummaryRef}
          weekLabel={weekShareData.weekLabel}
          wordsRead={weekShareData.wordsRead}
          textsRead={weekShareData.textsRead}
          streak={currentStreak}
          topCategory={weekShareData.topCategory}
          daysActive={weekShareData.daysActive}
          readingDays={weekShareData.readingDays}
        />
      </View>

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
  // Share week
  shareWeekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
  },
  shareWeekText: {
    fontSize: 15,
    fontWeight: '500',
  },
  offScreenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
  },
});
