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
import { ALL_BADGES, getBadgeById, type Badge } from '../lib/data/badges';

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
    addDailyWordsRead,
    resetDailyUploadIfNewDay,
    addReadingHistory,
    incrementCategoryReadCount,
    categoryReadCounts,
    unlockBadge,
    unlockedBadges,
    unlockReward,
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

  // Track newly unlocked badges for display
  const [newBadge, setNewBadge] = React.useState<Badge | null>(null);

  // Checkmark animation
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  // CTA visibility
  const ctaOpacity = useSharedValue(0);

  // Paywall visibility (for first reading)
  const paywallOpacity = useSharedValue(0);

  // Badge fly-in animation
  const badgeScale = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);

  const didRun = useRef(false);
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    // Record stats
    resetDailyUploadIfNewDay(); // ensure daily counters are fresh
    incrementWordsRead(wordsRead);
    addDailyWordsRead(wordsRead);
    incrementTextsCompleted();
    updateStreak();

    // Record reading history
    const historyEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      categoryKey: params.categoryKey ?? 'custom',
      textId: params.textId,
      customTextId: params.customTextId,
      title: displayName,
      wordsRead,
      completedAt: new Date().toISOString(),
      wpm,
    };
    addReadingHistory(historyEntry);

    // Increment category read count
    if (params.categoryKey) {
      incrementCategoryReadCount(params.categoryKey);
    }

    // Check and unlock badges
    const checkBadges = () => {
      const state = useSettingsStore.getState();
      const newlyUnlocked: Badge[] = [];
      const hour = new Date().getHours();

      for (const badge of ALL_BADGES) {
        if (state.unlockedBadges.includes(badge.id)) continue;

        let shouldUnlock = false;

        switch (badge.category) {
          case 'special':
            if (badge.id === 'first-steps' && state.textsCompleted >= 1) shouldUnlock = true;
            if (badge.id === 'custom-creator' && params.customTextId) shouldUnlock = true;
            if (badge.id === 'listener' && state.hasUsedTTS) shouldUnlock = true;
            if (badge.id === 'speed-demon' && wpm >= 500) shouldUnlock = true;
            if (badge.id === 'night-owl' && hour >= 0 && hour < 6) shouldUnlock = true;
            if (badge.id === 'early-bird' && hour >= 4 && hour < 6) shouldUnlock = true;
            break;

          case 'streak':
            if (badge.threshold && state.currentStreak >= badge.threshold) shouldUnlock = true;
            break;

          case 'words':
            if (badge.threshold && state.totalWordsRead >= badge.threshold) shouldUnlock = true;
            break;

          case 'texts':
            if (badge.threshold && state.textsCompleted >= badge.threshold) shouldUnlock = true;
            break;

          case 'category':
            if (badge.categoryKey && badge.threshold) {
              const count = state.categoryReadCounts[badge.categoryKey] ?? 0;
              if (count >= badge.threshold) shouldUnlock = true;
            }
            break;
        }

        if (shouldUnlock) {
          unlockBadge(badge.id);
          newlyUnlocked.push(badge);

          // Unlock reward if badge has one
          if (badge.reward) {
            unlockReward(badge.reward.id);
          }
        }
      }

      // Show first newly unlocked badge
      if (newlyUnlocked.length > 0) {
        setNewBadge(newlyUnlocked[0]);
        if (hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        // Animate badge fly-in
        setTimeout(() => {
          badgeScale.value = withSequence(
            withSpring(1.2, { damping: 8, stiffness: 150 }),
            withSpring(1, { damping: 12, stiffness: 200 })
          );
          badgeOpacity.value = withTiming(1, { duration: 300 });
        }, 1600);
      }
    };
    checkBadges();

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
  }, [wordsRead, wpm, displayName, params.categoryKey, params.textId, params.customTextId, incrementWordsRead, addDailyWordsRead, resetDailyUploadIfNewDay, incrementTextsCompleted, updateStreak, hapticFeedback, checkScale, checkOpacity, ctaOpacity, paywallOpacity, badgeScale, badgeOpacity, hasOnboarded, addReadingHistory, incrementCategoryReadCount, unlockBadge, unlockReward]);

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

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
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

            {/* Badge unlock notification */}
            {newBadge && (
              <Animated.View style={[styles.badgeUnlock, badgeAnimStyle]}>
                <Feather name="award" size={18} color={colors.primary} />
                <Text style={[styles.badgeUnlockText, { color: colors.primary }]}>
                  {newBadge.name}
                </Text>
              </Animated.View>
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

            {/* Tomorrow's preview — Commitment & Consistency */}
            {!isFirstReading && (() => {
              // Find next text in the same category
              if (category && params.textId) {
                const currentIdx = category.texts.findIndex((t) => t.id === params.textId);
                const nextText = category.texts[currentIdx + 1];
                if (nextText) {
                  return (
                    <Animated.View entering={FadeIn.delay(1900).duration(300)}>
                      <Text style={[styles.tomorrowPreview, { color: colors.muted }]}>
                        Tomorrow: continue your streak with "{nextText.title}"
                      </Text>
                    </Animated.View>
                  );
                }
              }
              return null;
            })()}
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
                  title="Take Quiz 🔒"
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
  badgeUnlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  badgeUnlockText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tomorrowPreview: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
