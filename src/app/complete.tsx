import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { NumberRoll } from '../components/NumberRoll';
import { Paywall } from '../components/Paywall';
import { ShareCard } from '../components/ShareCard';
import { Spacing } from '../design/theme';

// Encouraging quotes for variable rewards
const ENCOURAGEMENT_QUOTES = [
  'A reader lives a thousand lives.',
  'Reading is dreaming with open eyes.',
  'Every word brings you closer to mastery.',
  'The more you read, the more you know.',
  'Consistency builds greatness.',
  'You just invested in yourself.',
  'Small steps, big progress.',
  'Your mind thanks you.',
];

export default function CompleteScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey?: string;
    customTextId?: string;
    wordsRead: string;
    timeSpent: string;
    title?: string;
  }>();

  const {
    hapticFeedback,
    incrementWordsRead,
    incrementTextsCompleted,
    incrementTextsReadToday,
    updateStreak,
    recordSessionWPM,
    addTimeSpent,
    addReadingSession,
    currentStreak,
    hasOnboarded,
    setHasOnboarded,
    setIsPremium,
    startTrial,
    bestWPM: prevBestWPM,
    firstSessionWPM,
    totalTimeSpent,
    textsCompleted: prevTextsCompleted,
    dailyGoalSet,
    dailyGoal,
    textsReadToday,
    showPaywall,
    setShowPaywall,
  } = useSettingsStore();

  const wordsRead = parseInt(params.wordsRead ?? '0', 10);
  const timeSpent = parseInt(params.timeSpent ?? '0', 10);
  const wpm = timeSpent > 0 ? Math.round((wordsRead / timeSpent) * 60) : 0;
  const category = categories.find((c) => c.key === params.categoryKey);
  const readingTitle = params.title || category?.name || 'Reading';
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Insights
  const isPersonalBest = wpm > prevBestWPM && prevBestWPM > 0;
  const speedImprovement = firstSessionWPM && firstSessionWPM > 0
    ? Math.round(((wpm - firstSessionWPM) / firstSessionWPM) * 100)
    : null;
  const totalMinutesThisWeek = Math.round((totalTimeSpent + timeSpent) / 60);

  // Texts completed milestone (every 10th)
  const newTextsCompleted = prevTextsCompleted + 1;
  const isTextsMilestone = newTextsCompleted % 10 === 0 && newTextsCompleted > 0;

  // Daily goal progress
  const newTextsToday = textsReadToday + 1;
  const dailyGoalReached = dailyGoalSet && newTextsToday >= dailyGoal;
  const textsUntilGoal = dailyGoalSet ? Math.max(0, dailyGoal - newTextsToday) : 0;

  // Whether to show glow (personal best or milestone)
  const showGlow = isPersonalBest || isTextsMilestone || dailyGoalReached;

  // Encouragement quote (pseudo-random based on textsCompleted)
  const quote = useMemo(
    () => ENCOURAGEMENT_QUOTES[newTextsCompleted % ENCOURAGEMENT_QUOTES.length],
    [newTextsCompleted]
  );

  // Animations
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const paywallOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  const didRun = useRef(false);
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    // Record stats
    incrementWordsRead(wordsRead);
    incrementTextsCompleted();
    incrementTextsReadToday();
    updateStreak();
    recordSessionWPM(wpm);
    addTimeSpent(timeSpent);

    // Add to reading history
    addReadingSession({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      categoryKey: params.categoryKey || undefined,
      customTextId: params.customTextId || undefined,
      title: readingTitle,
      wordsRead,
      timeSpentSeconds: timeSpent,
      wpm,
      readAt: new Date().toISOString(),
    });

    // Animation sequence
    const t1 = setTimeout(() => {
      checkScale.value = withSequence(
        withSpring(1.1, { damping: 12, stiffness: 180 }),
        withSpring(1.0, { damping: 15, stiffness: 150 })
      );
      checkOpacity.value = withTiming(1, { duration: 200 });
    }, 200);

    const t2 = setTimeout(() => {
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 400);

    // Radial glow for personal best / milestone
    const t5 = setTimeout(() => {
      if (showGlow) {
        glowOpacity.value = withSequence(
          withTiming(0.6, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.in(Easing.ease) })
        );
        glowScale.value = withSequence(
          withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
          withTiming(2.5, { duration: 1300, easing: Easing.out(Easing.ease) })
        );
      }
    }, 500);

    // Paywall for first reading
    const t3 = setTimeout(() => {
      if (!hasOnboarded) {
        paywallOpacity.value = withTiming(1, { duration: 400 });
      }
    }, 1800);

    const t4 = setTimeout(() => {
      ctaOpacity.value = withTiming(1, { duration: 300 });
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const ctaAnimStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const paywallAnimStyle = useAnimatedStyle(() => ({
    opacity: paywallOpacity.value,
  }));

  const glowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const handleContinue = () => {
    router.replace('/');
  };

  const handleReadAgain = () => {
    if (params.customTextId) {
      router.replace({
        pathname: '/reading',
        params: { customTextId: params.customTextId },
      });
    } else {
      router.replace({
        pathname: '/reading',
        params: { categoryKey: params.categoryKey ?? '' },
      });
    }
  };

  const handleSubscribe = () => {
    setIsPremium(true);
    setHasOnboarded(true);
    router.replace('/');
  };

  const handleDismiss = () => {
    // Keep customizations for 3-day trial (endowment effect)
    startTrial();
    setHasOnboarded(true);
    router.replace('/');
  };

  // Share functionality
  const shareCardRef = useRef<View>(null);

  const handleShare = async () => {
    try {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your reading stats',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device');
      }
    } catch (error: any) {
      // Fallback: text-based sharing
      const shareText = `I just read "${readingTitle}" - ${wordsRead} words at ${wpm} WPM! ${currentStreak > 0 ? `${currentStreak} day streak.` : ''} Read with Articulate.`;
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        const tmpPath = `${FileSystem.cacheDirectory}articulate-stats.txt`;
        await FileSystem.writeAsStringAsync(tmpPath, shareText);
        await Sharing.shareAsync(tmpPath);
      }
    }
  };

  const isFirstReading = !hasOnboarded;

  // Build next action text
  const nextActionText = dailyGoalSet && textsUntilGoal > 0
    ? `Read another? You're ${textsUntilGoal} away from your daily goal`
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Radial glow pulse (behind checkmark) */}
            {showGlow && (
              <Animated.View
                style={[
                  styles.glowRing,
                  glowAnimStyle,
                  {
                    borderColor: isPersonalBest
                      ? colors.success
                      : dailyGoalReached
                        ? colors.warning
                        : colors.info,
                    shadowColor: isPersonalBest
                      ? colors.success
                      : dailyGoalReached
                        ? colors.warning
                        : colors.info,
                  },
                ]}
                pointerEvents="none"
              />
            )}

            {/* Checkmark */}
            <Animated.View
              style={[
                styles.checkCircle,
                checkAnimStyle,
                {
                  backgroundColor: glass.fill,
                  borderColor: glass.border,
                  shadowOpacity: glass.shadowOpacity,
                },
              ]}
            >
              <Text style={[styles.checkmark, { color: colors.primary }]}>
                {'\u2713'}
              </Text>
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeIn.delay(500).duration(300)}
              style={[styles.title, { color: colors.primary }]}
            >
              {isPersonalBest ? 'New Personal Best!' : dailyGoalReached ? 'Goal Reached!' : 'Well Done'}
            </Animated.Text>

            {/* Category */}
            <Animated.Text
              entering={FadeIn.delay(700).duration(300)}
              style={[styles.categoryLabel, { color: colors.secondary }]}
            >
              {readingTitle}
            </Animated.Text>

            {/* Stats */}
            <Animated.View
              entering={FadeIn.delay(900).duration(400)}
              style={styles.statsContainer}
            >
              <GlassCard>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <NumberRoll target={wordsRead} delay={1000} />
                    <Text style={[styles.statLabel, { color: colors.muted }]}>
                      WORDS
                    </Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: glass.border }]} />
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {timeDisplay}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>
                      TIME
                    </Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: glass.border }]} />
                  <View style={styles.stat}>
                    <NumberRoll target={wpm} delay={1200} />
                    <Text style={[styles.statLabel, { color: colors.muted }]}>
                      WPM
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Insights Section */}
            <Animated.View
              entering={FadeIn.delay(1300).duration(300)}
              style={styles.insightsSection}
            >
              {/* Personal best badge */}
              {isPersonalBest && (
                <View style={[styles.insightBadge, { backgroundColor: isDark ? 'rgba(40,167,69,0.15)' : 'rgba(40,167,69,0.1)' }]}>
                  <Text style={[styles.insightBadgeText, { color: colors.success }]}>
                    {'\u2B50'} New personal best: {wpm} WPM
                  </Text>
                </View>
              )}

              {/* Speed comparison */}
              {speedImprovement !== null && speedImprovement > 0 && !isPersonalBest && (
                <Text style={[styles.insightText, { color: colors.secondary }]}>
                  {speedImprovement}% faster than your first session
                </Text>
              )}

              {/* Time milestone */}
              {totalMinutesThisWeek > 0 && (
                <Text style={[styles.insightText, { color: colors.secondary }]}>
                  {totalMinutesThisWeek} minutes of reading this week
                </Text>
              )}

              {/* Texts milestone */}
              {isTextsMilestone && (
                <View style={[styles.insightBadge, { backgroundColor: isDark ? 'rgba(10,132,255,0.15)' : 'rgba(10,132,255,0.1)' }]}>
                  <Text style={[styles.insightBadgeText, { color: colors.info }]}>
                    {newTextsCompleted} texts completed!
                  </Text>
                </View>
              )}

              {/* Daily goal reached */}
              {dailyGoalReached && (
                <View style={[styles.insightBadge, { backgroundColor: isDark ? 'rgba(255,149,0,0.15)' : 'rgba(255,149,0,0.1)' }]}>
                  <Text style={[styles.insightBadgeText, { color: colors.warning }]}>
                    Daily goal reached!
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Streak */}
            {currentStreak > 0 && (
              <Animated.View
                entering={FadeIn.delay(1500).duration(300)}
                style={styles.streakRow}
              >
                <Text style={[styles.streakText, { color: colors.secondary }]}>
                  {currentStreak} day streak
                </Text>
              </Animated.View>
            )}

            {/* Encouragement quote */}
            <Animated.Text
              entering={FadeIn.delay(1600).duration(300)}
              style={[styles.quoteText, { color: colors.muted }]}
            >
              "{quote}"
            </Animated.Text>

            {/* Paywall Section (first reading only) */}
            {isFirstReading && (
              <Animated.View style={[styles.paywallSection, paywallAnimStyle]}>
                <Text style={[styles.paywallHeadline, { color: colors.primary }]}>
                  Unlock the full experience
                </Text>
                <View style={styles.featureList}>
                  {[
                    'All typography styles',
                    'Full color palette',
                    'Entire reading library',
                    'New content added regularly',
                  ].map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <Text style={[styles.featureCheck, { color: colors.primary }]}>
                        {'\u2713'}
                      </Text>
                      <Text style={[styles.featureText, { color: colors.secondary }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.credibilityText, { color: colors.muted }]}>
                  Built on cognitive reading research
                </Text>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* CTAs */}
        <Animated.View style={[styles.ctaContainer, ctaAnimStyle]}>
          {isFirstReading ? (
            <>
              <GlassButton title="Start Free Trial" onPress={handleSubscribe} />
              <Pressable onPress={handleDismiss} style={styles.dismissButton}>
                <Text style={[styles.dismissLink, { color: colors.muted }]}>
                  Maybe later
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {nextActionText && (
                <Text style={[styles.nextActionText, { color: colors.secondary }]}>
                  {nextActionText}
                </Text>
              )}
              <GlassButton title="Continue" onPress={handleContinue} />
              <View style={styles.secondaryActions}>
                <GlassButton
                  title="Read Again"
                  onPress={handleReadAgain}
                  variant="outline"
                />
                <Pressable onPress={handleShare} style={styles.shareButton}>
                  <Feather name="share" size={18} color={colors.primary} />
                  <Text style={[styles.shareText, { color: colors.primary }]}>
                    Share
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>
      </SafeAreaView>

      {/* Off-screen Share Card for capture */}
      <ShareCard
        ref={shareCardRef}
        wordsRead={wordsRead}
        timeDisplay={timeDisplay}
        wpm={wpm}
        streak={currentStreak}
        title={readingTitle}
        isPersonalBest={isPersonalBest}
        quoteIndex={newTextsCompleted}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 16,
  },
  // Radial glow
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 0.8,
    top: '50%',
    marginTop: -146,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    marginBottom: 8,
    zIndex: 1,
  },
  checkmark: {
    fontSize: 36,
    fontWeight: '300',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 24,
  },
  statsContainer: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '500',
  },
  divider: {
    width: 0.5,
    height: 40,
  },
  // Insights
  insightsSection: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  insightBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderCurve: 'continuous',
  },
  insightBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  streakRow: {
    marginTop: 4,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '500',
  },
  quoteText: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '500',
  },
  nextActionText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  paywallSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  paywallHeadline: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  featureList: {
    width: '100%',
    gap: 10,
    paddingHorizontal: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheck: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '400',
  },
  credibilityText: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dismissLink: {
    fontSize: 14,
    fontWeight: '400',
  },
});
