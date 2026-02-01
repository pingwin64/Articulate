import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { NumberRoll } from '../components/NumberRoll';
import { Paywall } from '../components/Paywall';
import { Spacing } from '../design/theme';

export default function CompleteScreen() {
  const { colors, glass } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey: string;
    textId?: string;
    customTextId?: string;
    wordsRead: string;
    timeSpent: string;
  }>();

  const {
    hapticFeedback,
    incrementWordsRead,
    incrementTextsCompleted,
    updateStreak,
    currentStreak,
    hasOnboarded,
    setHasOnboarded,
    setIsPremium,
    setFontFamily,
    setWordColor,
    startTrial,
    isPremium,
    textsCompleted,
    totalWordsRead,
    showPaywall,
    setPaywallContext,
    paywallContext,
    hasShownThirdReadingNudge,
    setHasShownThirdReadingNudge,
    unlockAchievement,
    unlockedAchievements,
  } = useSettingsStore();

  const { customTexts } = useSettingsStore();
  const customText = params.customTextId
    ? customTexts.find((t) => t.id === params.customTextId)
    : undefined;

  const wordsRead = parseInt(params.wordsRead ?? '0', 10);
  const timeSpent = parseInt(params.timeSpent ?? '0', 10);
  const wpm = timeSpent > 0 ? Math.round((wordsRead / timeSpent) * 60) : 0;
  const category = categories.find((c) => c.key === params.categoryKey);
  const textEntry = params.textId
    ? category?.texts.find((t) => t.id === params.textId)
    : undefined;
  const displayName = customText?.title ?? textEntry?.title ?? category?.name ?? 'Reading';
  const displayIcon = customText ? 'clipboard' : category?.icon;

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Track newly unlocked achievements for display
  const [newAchievement, setNewAchievement] = React.useState<string | null>(null);

  // Checkmark animation
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  // CTA visibility
  const ctaOpacity = useSharedValue(0);

  // Paywall visibility (for first reading)
  const paywallOpacity = useSharedValue(0);

  const didRun = useRef(false);
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    // Record stats
    incrementWordsRead(wordsRead);
    incrementTextsCompleted();
    updateStreak();

    // Check achievement conditions
    const checkAchievements = () => {
      const state = useSettingsStore.getState();
      const checks: { id: string; label: string; condition: boolean }[] = [
        { id: 'first_read', label: 'First Read', condition: state.textsCompleted >= 1 },
        { id: 'streak_7', label: '7-Day Streak', condition: state.currentStreak >= 7 },
        { id: 'streak_30', label: '30-Day Streak', condition: state.currentStreak >= 30 },
        { id: 'words_1k', label: '1,000 Words', condition: state.totalWordsRead >= 1000 },
        { id: 'words_10k', label: '10,000 Words', condition: state.totalWordsRead >= 10000 },
        { id: 'speed_reader', label: 'Speed Reader', condition: wpm > 300 },
      ];
      for (const check of checks) {
        if (check.condition && !state.unlockedAchievements.includes(check.id)) {
          unlockAchievement(check.id);
          setNewAchievement(check.label);
          if (hapticFeedback) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          break; // Show one achievement at a time
        }
      }
    };
    checkAchievements();

    // Animation sequence
    // T+200ms: checkmark
    const t1 = setTimeout(() => {
      checkScale.value = withSequence(
        withSpring(1.1, { damping: 12, stiffness: 180 }),
        withSpring(1.0, { damping: 15, stiffness: 150 })
      );
      checkOpacity.value = withTiming(1, { duration: 200 });
    }, 200);

    // T+400ms: haptic
    const t2 = setTimeout(() => {
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 400);

    // T+1800ms: Paywall (first reading only)
    const t3 = setTimeout(() => {
      if (!hasOnboarded) {
        paywallOpacity.value = withTiming(1, { duration: 400 });
      }
    }, 1800);

    // T+2000ms: CTAs
    const t4 = setTimeout(() => {
      ctaOpacity.value = withTiming(1, { duration: 300 });
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [wordsRead, incrementWordsRead, incrementTextsCompleted, updateStreak, hapticFeedback, checkScale, checkOpacity, ctaOpacity, paywallOpacity, hasOnboarded]);

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

  const handleContinue = () => {
    router.replace('/');
  };

  const handleTakeQuiz = () => {
    router.push({
      pathname: '/quiz',
      params: {
        ...(params.categoryKey ? { categoryKey: params.categoryKey } : {}),
        ...(params.textId ? { textId: params.textId } : {}),
        ...(params.customTextId ? { customTextId: params.customTextId } : {}),
      },
    });
  };

  const handleReadAgain = () => {
    router.replace({
      pathname: '/reading',
      params: {
        categoryKey: params.categoryKey ?? '',
        ...(params.textId ? { textId: params.textId } : {}),
        ...(params.customTextId ? { customTextId: params.customTextId } : {}),
      },
    });
  };

  const handleSubscribe = () => {
    startTrial();
    setHasOnboarded(true);
    router.replace('/');
  };

  const handleDismiss = () => {
    setFontFamily('sourceSerif');
    setWordColor('default');
    setHasOnboarded(true);
    router.replace('/');
  };

  const isFirstReading = !hasOnboarded;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
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
              <Feather name="check" size={32} color={colors.primary} />
            </Animated.View>

            {/* Well Done */}
            <Animated.Text
              entering={FadeIn.delay(500).duration(300)}
              style={[styles.title, { color: colors.primary }]}
            >
              Well Done
            </Animated.Text>

            {/* Category */}
            <Animated.View
              entering={FadeIn.delay(700).duration(300)}
              style={styles.categoryRow}
            >
              {displayIcon && (
                <Feather name={displayIcon as any} size={16} color={colors.secondary} />
              )}
              <Text style={[styles.categoryLabel, { color: colors.secondary }]}>
                {displayName}
              </Text>
            </Animated.View>

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

            {/* Achievement badge */}
            {newAchievement && (
              <Animated.Text
                entering={FadeIn.delay(1700).duration(400)}
                style={[styles.milestoneText, { color: colors.secondary }]}
              >
                {newAchievement} unlocked
              </Animated.Text>
            )}

            {/* Milestone celebration */}
            {(() => {
              const milestones: Record<number, string> = {
                1: 'Your reading journey begins!',
                5: 'Five texts down. You\'re building a habit.',
                10: 'Double digits! Consistency is your superpower.',
                25: 'Twenty-five texts. You\'re on fire.',
                50: 'Fifty completed. That\'s dedication.',
                100: 'One hundred texts. Legendary reader.',
              };
              const msg = milestones[textsCompleted];
              if (!msg) return null;
              return (
                <Animated.View entering={FadeIn.delay(1600).duration(300)}>
                  <Text style={[styles.milestoneText, { color: colors.secondary }]}>
                    {msg}
                  </Text>
                </Animated.View>
              );
            })()}

            {/* Paywall Section (first reading only) */}
            {isFirstReading && (
              <Animated.View style={[styles.paywallSection, paywallAnimStyle]}>
                <Text style={[styles.paywallHeadline, { color: colors.primary }]}>
                  You just read {wordsRead} words
                </Text>
                <View style={styles.featureList}>
                  {[
                    'All typography styles & fonts',
                    'Full color palette & themes',
                    'Entire reading library',
                    'Auto-play, breathing & chunk reading',
                  ].map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <Feather name="check" size={16} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.secondary }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.credibilityText, { color: colors.muted }]}>
                  Grounded in cognitive reading science
                </Text>
              </Animated.View>
            )}

            {/* Third-reading soft nudge */}
            {!isFirstReading && !isPremium && textsCompleted >= 3 && !hasShownThirdReadingNudge && (
              <Animated.View entering={FadeIn.delay(1800).duration(300)}>
                <Pressable onPress={() => {
                  setHasShownThirdReadingNudge(true);
                  setPaywallContext('generic');
                }}>
                  <Text style={[styles.nudgeText, { color: colors.secondary }]}>
                    Enjoying Articulate? Go Pro for the full experience.
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* CTAs */}
        <Animated.View style={[styles.ctaContainer, ctaAnimStyle]}>
          {isFirstReading ? (
            <>
              <GlassButton title="Try Free for 3 Days" onPress={handleSubscribe} />
              <Pressable onPress={handleDismiss} style={styles.dismissButton}>
                <Text style={[styles.dismissLink, { color: colors.muted }]}>
                  Maybe later
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <GlassButton title="Continue" onPress={handleContinue} />
              {isPremium ? (
                <GlassButton
                  title="Take Quiz"
                  onPress={handleTakeQuiz}
                  variant="outline"
                />
              ) : (
                <GlassButton
                  title="Take Quiz  \u{1F512}"
                  onPress={() => setPaywallContext('locked_quiz')}
                  variant="outline"
                />
              )}
              <GlassButton
                title="Read Again"
                onPress={handleReadAgain}
                variant="outline"
              />
            </>
          )}
        </Animated.View>
      </SafeAreaView>

      {/* Paywall modal (for third-reading nudge) */}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 16,
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
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '400',
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
  streakRow: {
    marginTop: 8,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 12,
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
  nudgeText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: 4,
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
