import React, { useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Spacing } from '../design/theme';

export default function SessionDetailScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId: string }>();
  const { readingHistory, hapticFeedback } = useSettingsStore();

  const session = useMemo(
    () => readingHistory.find((s) => s.id === params.sessionId),
    [readingHistory, params.sessionId]
  );

  const avgWPM = useMemo(() => {
    if (readingHistory.length === 0) return 0;
    return Math.round(
      readingHistory.reduce((sum, s) => sum + s.wpm, 0) / readingHistory.length
    );
  }, [readingHistory]);

  const bestWPM = useSettingsStore((s) => s.bestWPM);

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <Feather name="chevron-left" size={24} color={colors.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Session</Text>
            <View style={styles.headerButton} />
          </View>
          <View style={styles.emptyCenter}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Session not found
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const date = new Date(session.readAt);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const minutes = Math.floor(session.timeSpentSeconds / 60);
  const seconds = session.timeSpentSeconds % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const handleReadAgain = () => {
    if (session.customTextId) {
      router.replace({
        pathname: '/reading',
        params: { customTextId: session.customTextId },
      });
    } else if (session.categoryKey) {
      router.replace({
        pathname: '/reading',
        params: { categoryKey: session.categoryKey },
      });
    }
  };

  const handleShare = async () => {
    try {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const shareText = `I read "${session.title}" - ${session.wordsRead} words at ${session.wpm} WPM!${session.comprehensionScore !== undefined ? ` Comprehension: ${session.comprehensionScore}/${session.comprehensionQuestions}` : ''} Read with Articulate.`;
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Use a temp file for sharing text
        const FileSystem = require('expo-file-system/legacy');
        const tmpPath = `${FileSystem.cacheDirectory}articulate-session.txt`;
        await FileSystem.writeAsStringAsync(tmpPath, shareText);
        await Sharing.shareAsync(tmpPath);
      }
    } catch (error) {
      // Silent fail
    }
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
            Session Detail
          </Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[styles.title, { color: colors.primary }]}>
              {session.title}
            </Text>
            <Text style={[styles.dateText, { color: colors.muted }]}>
              {dateStr} at {timeStr}
            </Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeIn.delay(100).duration(300)}>
            <GlassCard>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {session.wpm}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    WPM
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {session.wordsRead}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    WORDS
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {timeDisplay}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    TIME
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Comparisons */}
          <Animated.View entering={FadeIn.delay(200).duration(300)}>
            <GlassCard>
              <View style={styles.comparisonList}>
                <View style={styles.comparisonRow}>
                  <Text style={[styles.comparisonLabel, { color: colors.secondary }]}>
                    vs. Average
                  </Text>
                  <Text
                    style={[
                      styles.comparisonValue,
                      {
                        color:
                          session.wpm >= avgWPM ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {session.wpm >= avgWPM ? '+' : ''}
                    {session.wpm - avgWPM} WPM
                  </Text>
                </View>
                <View
                  style={[styles.compSeparator, { backgroundColor: glass.border }]}
                />
                <View style={styles.comparisonRow}>
                  <Text style={[styles.comparisonLabel, { color: colors.secondary }]}>
                    vs. Best
                  </Text>
                  <Text
                    style={[
                      styles.comparisonValue,
                      {
                        color:
                          session.wpm >= bestWPM
                            ? colors.success
                            : colors.secondary,
                      },
                    ]}
                  >
                    {session.wpm >= bestWPM ? '+' : ''}
                    {session.wpm - bestWPM} WPM
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Comprehension */}
          {session.comprehensionScore !== undefined &&
            session.comprehensionQuestions !== undefined && (
              <Animated.View entering={FadeIn.delay(300).duration(300)}>
                <GlassCard>
                  <View style={styles.comprehensionRow}>
                    <Text style={[styles.comparisonLabel, { color: colors.secondary }]}>
                      Comprehension
                    </Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {session.comprehensionScore}/{session.comprehensionQuestions}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>
            )}

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          <GlassButton title="Read Again" onPress={handleReadAgain} />
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Feather name="share" size={18} color={colors.primary} />
            <Text style={[styles.shareText, { color: colors.primary }]}>
              Share
            </Text>
          </Pressable>
        </View>
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
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  comparisonList: {
    gap: 0,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  comparisonLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  comparisonValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  compSeparator: {
    height: 0.5,
  },
  comprehensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
