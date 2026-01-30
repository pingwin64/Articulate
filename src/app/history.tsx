import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from '../components/GlassCard';
import { WPMChart } from '../components/WPMChart';
import { Spacing } from '../design/theme';

function getMonthDays(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function CalendarHeatmap() {
  const { colors, isDark } = useTheme();
  const { readingHistory } = useSettingsStore();

  const heatmapData = useMemo(() => {
    const readDates = new Set<string>();
    readingHistory.forEach((session) => {
      const d = new Date(session.readAt);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      readDates.add(date);
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = getMonthDays(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const weeks: (string | null)[][] = [];
    let currentWeek: (string | null)[] = [];

    // Pad first week
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentWeek.push(dateStr);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { weeks, readDates, month, year };
  }, [readingHistory]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.heatmapContainer}>
      <Text style={[styles.heatmapTitle, { color: colors.primary }]}>
        {monthNames[heatmapData.month]} {heatmapData.year}
      </Text>
      {/* Day labels */}
      <View style={styles.dayLabelsRow}>
        {dayLabels.map((label, i) => (
          <Text key={i} style={[styles.dayLabel, { color: colors.muted }]}>
            {label}
          </Text>
        ))}
      </View>
      {/* Weeks */}
      {heatmapData.weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((dateStr, di) => {
            if (!dateStr) {
              return <View key={di} style={styles.heatmapCell} />;
            }
            const hasRead = heatmapData.readDates.has(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <View
                key={di}
                style={[
                  styles.heatmapCell,
                  {
                    backgroundColor: hasRead
                      ? colors.success
                      : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.04)',
                    borderWidth: isToday ? 1.5 : 0,
                    borderColor: isToday ? colors.primary : 'transparent',
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function HistoryScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const {
    readingHistory,
    totalWordsRead,
    textsCompleted,
    totalTimeSpent,
    bestWPM,
    currentStreak,
    bestStreak,
  } = useSettingsStore();

  const avgWPM = useMemo(() => {
    if (readingHistory.length === 0) return 0;
    const total = readingHistory.reduce((sum, s) => sum + s.wpm, 0);
    return Math.round(total / readingHistory.length);
  }, [readingHistory]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Reading History
          </Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* WPM Chart */}
          <Animated.View entering={FadeIn.delay(50).duration(400)}>
            <GlassCard>
              <WPMChart height={160} />
            </GlassCard>
          </Animated.View>

          {/* Calendar Heatmap */}
          <Animated.View entering={FadeIn.delay(100).duration(400)}>
            <GlassCard>
              <CalendarHeatmap />
            </GlassCard>
          </Animated.View>

          {/* Summary Stats */}
          <Animated.View entering={FadeIn.delay(200).duration(400)}>
            <GlassCard>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {totalWordsRead.toLocaleString()}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    WORDS
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {textsCompleted}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    TEXTS
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {formatTime(totalTimeSpent)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    TIME
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {avgWPM}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    AVG WPM
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {bestWPM}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    BEST WPM
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {bestStreak}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    BEST STREAK
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Recent Sessions */}
          <Text style={[styles.sectionHeader, { color: colors.secondary }]}>
            RECENT SESSIONS
          </Text>
          {readingHistory.length === 0 ? (
            <Animated.View entering={FadeIn.delay(300).duration(400)}>
              <GlassCard>
                <View style={styles.emptyState}>
                  <Feather name="book-open" size={24} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.muted }]}>
                    No readings yet. Start reading to see your history here.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          ) : (
            readingHistory.slice(0, 50).map((session, i) => (
              <Animated.View
                key={session.id}
                entering={FadeIn.delay(300 + i * 50).duration(300)}
              >
                <GlassCard
                  onPress={() =>
                    router.push({
                      pathname: '/session-detail',
                      params: { sessionId: session.id },
                    })
                  }
                >
                  <View style={styles.sessionRow}>
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionTitle, { color: colors.primary }]}>
                        {session.title}
                      </Text>
                      <Text style={[styles.sessionDate, { color: colors.muted }]}>
                        {formatDate(session.readAt)}
                      </Text>
                    </View>
                    <View style={styles.sessionStats}>
                      <Text style={[styles.sessionStat, { color: colors.secondary }]}>
                        {session.wordsRead} words
                      </Text>
                      <Text style={[styles.sessionStat, { color: colors.muted }]}>
                        {session.wpm} WPM
                      </Text>
                      <Feather name="chevron-right" size={14} color={colors.muted} />
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  // Heatmap
  heatmapContainer: {
    gap: 8,
  },
  heatmapTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
    width: 28,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  heatmapCell: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  // Summary
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '33%',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  // Sections
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: -4,
    paddingLeft: 4,
  },
  // Sessions
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 13,
  },
  sessionStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  sessionStat: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
