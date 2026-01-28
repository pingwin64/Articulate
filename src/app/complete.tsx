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
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { NumberRoll } from '../components/NumberRoll';
import { Spacing } from '../design/theme';

export default function CompleteScreen() {
  const { colors, glass } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey: string;
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
  } = useSettingsStore();

  const wordsRead = parseInt(params.wordsRead ?? '0', 10);
  const timeSpent = parseInt(params.timeSpent ?? '0', 10);
  const wpm = timeSpent > 0 ? Math.round((wordsRead / timeSpent) * 60) : 0;
  const category = categories.find((c) => c.key === params.categoryKey);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

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

  const handleReadAgain = () => {
    router.replace({
      pathname: '/reading',
      params: { categoryKey: params.categoryKey ?? '' },
    });
  };

  const handleSubscribe = () => {
    setIsPremium(true);
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
              <Text style={[styles.checkmark, { color: colors.primary }]}>
                {'\u2713'}
              </Text>
            </Animated.View>

            {/* Well Done */}
            <Animated.Text
              entering={FadeIn.delay(500).duration(300)}
              style={[styles.title, { color: colors.primary }]}
            >
              Well Done
            </Animated.Text>

            {/* Category */}
            <Animated.Text
              entering={FadeIn.delay(700).duration(300)}
              style={[styles.categoryLabel, { color: colors.secondary }]}
            >
              {category?.name ?? 'Reading'}
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
              <GlassButton title="Unlock Premium" onPress={handleSubscribe} />
              <Pressable onPress={handleDismiss} style={styles.dismissButton}>
                <Text style={[styles.dismissLink, { color: colors.muted }]}>
                  Maybe later
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <GlassButton title="Continue" onPress={handleContinue} />
              <GlassButton
                title="Read Again"
                onPress={handleReadAgain}
                variant="outline"
              />
            </>
          )}
        </Animated.View>
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
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
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
