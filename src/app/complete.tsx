import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore, getCurrentLevel, getLevelName, TextDifficultyLevel, STREAK_MILESTONES } from '../lib/store/settings';
import { categories, TextDifficulty } from '../lib/data/categories';
import { computeDifficulty, getDifficultyMultiplier } from '../lib/data/difficulty';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { NumberRoll } from '../components/NumberRoll';
import { Paywall } from '../components/Paywall';
import { GoalScrollPicker } from '../components/GoalScrollPicker';
import { OnboardingPaywall } from '../components/OnboardingPaywall';
import { StreakCelebrationPopup } from '../components/StreakCelebrationPopup';
import { StreakShareCard } from '../components/StreakShareCard';
import { captureAndShare } from '../lib/share';
import { Spacing } from '../design/theme';
import { ALL_BADGES, getBadgeById, type Badge } from '../lib/data/badges';
import { cancelStreakAtRiskReminder } from '../lib/notifications';
import { getCurrentChallenge } from '../lib/data/challenges';
import * as StoreReview from 'expo-store-review';

// Difficulty multipliers for level progress — wider spread so difficulty choice matters
const DIFFICULTY_MULTIPLIERS: Record<TextDifficulty, number> = {
  beginner: 1.0,
  intermediate: 1.5,
  advanced: 2.5,
};

function getShareStreakMessage(streak: number): string {
  if (streak >= 30) return 'Unstoppable';
  if (streak >= 14) return 'Consistency is key';
  if (streak >= 7) return 'One week strong';
  if (streak >= 3) return 'Building the habit';
  return 'Every journey starts with a single step';
}

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

  const levelProgress = useSettingsStore((s) => s.levelProgress);
  const addLevelProgress = useSettingsStore((s) => s.addLevelProgress);

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
    addDailyWordsRead,
    resetDailyIfNewDay,
    addReadingHistory,
    incrementCategoryReadCount,
    categoryReadCounts,
    unlockBadge,
    unlockedBadges,
    unlockReward,
    canUseFreeQuiz,
    lastUnlockedBadgeId,
    clearLastUnlockedBadge,
    isFirstReading,
    setIsFirstReading,
    dailyWordGoal,
    setDailyWordGoal,
    fontFamily,
    wordColor,
    backgroundTheme,
    incrementDifficultyCount,
    beginnerTextsCompleted,
    intermediateTextsCompleted,
    advancedTextsCompleted,
    markStreakCelebrationShown,
    savedWords,
    hasRequestedReview,
    setHasRequestedReview,
    hasUsedPronunciation,
    lastWordReviewDate,
  } = useSettingsStore();

  // First reading flow state: 'celebration' = normal completion, 'journey' = goal setup, 'paywall' = onboarding paywall
  const [calibrationStep, setCalibrationStep] = useState<'celebration' | 'journey' | 'paywall'>('celebration');
  const [selectedGoal, setSelectedGoal] = useState(dailyWordGoal);

  // Handle journey setup completion - show paywall
  const handleStartJourney = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDailyWordGoal(selectedGoal);
    // Show onboarding paywall for everyone
    setCalibrationStep('paywall');
  }, [hapticFeedback, selectedGoal, setDailyWordGoal]);

  // Handle paywall completion (subscribe or continue free)
  const handlePaywallComplete = useCallback(() => {
    if (hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsFirstReading(false);
    setHasOnboarded(true);
    router.replace('/');
  }, [hapticFeedback, setIsFirstReading, setHasOnboarded, router]);

  const { customTexts, dailyAIText, addFavoriteText, removeFavoriteText, isFavoriteText } = useSettingsStore();
  const customText = params.customTextId
    ? (customTexts.find((t) => t.id === params.customTextId)
      ?? (dailyAIText?.id === params.customTextId ? dailyAIText : undefined))
    : undefined;

  // Check if this is a bundled text (has categoryKey and textId)
  const isBundledText = !!params.categoryKey && !!params.textId && !params.customTextId;
  const isCurrentlyFavorited = isBundledText ? isFavoriteText(params.categoryKey, params.textId!) : false;
  const [isFavorited, setIsFavorited] = React.useState(isCurrentlyFavorited);

  const handleToggleFavorite = () => {
    if (!isBundledText || !params.textId) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isFavorited) {
      removeFavoriteText(params.categoryKey, params.textId);
      setIsFavorited(false);
    } else {
      addFavoriteText(params.categoryKey, params.textId);
      setIsFavorited(true);
    }
  };

  const wordsRead = parseInt(params.wordsRead ?? '0', 10);
  const timeSpent = parseInt(params.timeSpent ?? '0', 10);
  const wpm = timeSpent > 0 ? Math.round((wordsRead / timeSpent) * 60) : 0;
  const category = categories.find((c) => c.key === params.categoryKey);
  const textEntry = params.textId
    ? category?.texts.find((t) => t.id === params.textId)
    : undefined;
  const displayName = customText?.title ?? textEntry?.title ?? category?.name ?? 'Reading';
  const displayIcon = customText ? 'clipboard' as const : category?.icon;

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Find next text in the same category (for "Read Next" button)
  const nextText = React.useMemo(() => {
    if (!category || !params.textId) return null;
    const currentIdx = category.texts.findIndex((t) => t.id === params.textId);
    return category.texts[currentIdx + 1] ?? null;
  }, [category, params.textId]);

  const handleReadNext = () => {
    if (!nextText || !params.categoryKey) return;
    router.replace({
      pathname: '/reading',
      params: { categoryKey: params.categoryKey, textId: nextText.id },
    });
  };

  // Track newly unlocked badges for display
  const [newBadge, setNewBadge] = React.useState<Badge | null>(null);
  // Badge-triggered upsell for free users
  const [showBadgeUpsell, setShowBadgeUpsell] = React.useState(false);
  // Streak celebration popup
  const [showStreakCelebration, setShowStreakCelebration] = React.useState(false);

  // Smart CTA: should we suggest practice?
  const showPracticeInstead = savedWords.length >= 1;
  const daysSinceReview = lastWordReviewDate
    ? Math.floor((Date.now() - new Date(lastWordReviewDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const suggestReview = showPracticeInstead && daysSinceReview >= 3;

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

  const shareCardRef = useRef<View>(null);
  const didRun = useRef(false);
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    // Record stats
    resetDailyIfNewDay(); // ensure daily counters are fresh
    incrementWordsRead(wordsRead);
    addDailyWordsRead(wordsRead);
    incrementTextsCompleted();
    updateStreak();

    // Cancel any pending "streak at risk" notifications since user just read
    cancelStreakAtRiskReminder();

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

    // Update custom text metadata
    if (params.customTextId && customText) {
      const { updateCustomText } = useSettingsStore.getState();
      updateCustomText(params.customTextId, {
        lastReadAt: new Date().toISOString(),
        timesRead: (customText.timesRead ?? 0) + 1,
      });
    }

    // Increment AI texts read counter if this was an AI-generated text
    const dailyAI = useSettingsStore.getState().dailyAIText;
    if (params.customTextId && dailyAI && params.customTextId === dailyAI.id) {
      const currentCount = useSettingsStore.getState().aiTextsRead || 0;
      useSettingsStore.setState({ aiTextsRead: currentCount + 1 });
    }

    // Record weekly reading data for insights
    const { recordWeeklyReading } = useSettingsStore.getState();
    recordWeeklyReading(wordsRead, wpm);

    // Get text difficulty and apply multiplier for level progress
    // Use continuous difficulty score if available, fallback to tier-based
    const textDifficulty = textEntry?.textDifficulty;
    let difficultyMultiplier = 1.0;
    if (textEntry) {
      const score = computeDifficulty(textEntry.words);
      difficultyMultiplier = getDifficultyMultiplier(score);
    } else if (textDifficulty) {
      difficultyMultiplier = DIFFICULTY_MULTIPLIERS[textDifficulty];
    }
    // Apply streak bonus multiplier (Phase 6F)
    let streakMultiplier = 1.0;
    if (currentStreak >= 30) {
      streakMultiplier = 1.2;
    } else if (currentStreak >= 7) {
      streakMultiplier = 1.1;
    }
    const adjustedWords = Math.round(wordsRead * difficultyMultiplier * streakMultiplier);

    // Add level progress (new 5-level system) with difficulty + streak multiplier
    addLevelProgress(adjustedWords);

    // Check daily goal streak
    const { checkDailyGoalMet } = useSettingsStore.getState();
    checkDailyGoalMet();

    // Track unique vocabulary words
    if (textEntry) {
      const { addEncounteredWords } = useSettingsStore.getState();
      addEncounteredWords(textEntry.words);
    }

    // Increment difficulty count if text has difficulty
    if (textDifficulty) {
      incrementDifficultyCount(textDifficulty as TextDifficultyLevel);
    }

    // Update weekly challenge progress
    const { checkWeeklyChallenge, incrementWeeklyChallengeProgress } = useSettingsStore.getState();
    checkWeeklyChallenge();
    incrementWeeklyChallengeProgress('texts_read', 1);
    incrementWeeklyChallengeProgress('words_total', wordsRead);

    // Track advanced challenge progress
    const textDifficultyTier = textEntry?.textDifficulty;
    if (textDifficultyTier === 'advanced') {
      incrementWeeklyChallengeProgress('advanced', 1);
    }

    // Auto App Store review after 5th text (one-time, non-intrusive)
    const reviewState = useSettingsStore.getState();
    if (reviewState.textsCompleted === 5 && !reviewState.hasRequestedReview) {
      setTimeout(async () => {
        try {
          if (await StoreReview.hasAction()) {
            await StoreReview.requestReview();
          }
        } catch {}
        useSettingsStore.getState().setHasRequestedReview(true);
      }, 3000);
    }

    // Track unique categories for diverse challenge
    if (params.categoryKey) {
      const challengeState = useSettingsStore.getState();
      if (!challengeState.weeklyCategoriesRead.includes(params.categoryKey)) {
        useSettingsStore.setState({
          weeklyCategoriesRead: [...challengeState.weeklyCategoriesRead, params.categoryKey],
        });
        incrementWeeklyChallengeProgress('categories_diverse', 1);
      }
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
            if (badge.id === 'night-owl' && hour >= 0 && hour < 4) shouldUnlock = true;
            if (badge.id === 'early-bird' && hour >= 4 && hour < 6) shouldUnlock = true;
            if (badge.id === 'challenge-first' && state.weeklyChallengesCompleted >= 1) shouldUnlock = true;
            if (badge.id === 'challenge-10' && state.weeklyChallengesCompleted >= 10) shouldUnlock = true;
            // Level badges (checked automatically via addLevelProgress, but also check here for migration)
            if (badge.id === 'reached-intermediate' && state.levelProgress >= 750) shouldUnlock = true;
            if (badge.id === 'reached-advanced' && state.levelProgress >= 2500) shouldUnlock = true;
            if (badge.id === 'reached-expert' && state.levelProgress >= 5500) shouldUnlock = true;
            if (badge.id === 'reached-master' && state.levelProgress >= 10000) shouldUnlock = true;
            // Difficulty badges
            if (badge.id === 'difficulty-advanced-5' && state.advancedTextsCompleted >= 5) shouldUnlock = true;
            if (badge.id === 'difficulty-advanced-10' && state.advancedTextsCompleted >= 10) shouldUnlock = true;
            if (badge.id === 'difficulty-all-levels' &&
              state.beginnerTextsCompleted >= 5 &&
              state.intermediateTextsCompleted >= 5 &&
              state.advancedTextsCompleted >= 5) shouldUnlock = true;
            // Listen & Repeat badges
            if (badge.id === 'listen-repeat-5' && state.listenRepeatSessionsCompleted >= 5) shouldUnlock = true;
            if (badge.id === 'listen-repeat-25' && state.listenRepeatSessionsCompleted >= 25) shouldUnlock = true;
            // AI Reader badges
            if (badge.id === 'ai-reader-5' && state.aiTextsRead >= 5) shouldUnlock = true;
            if (badge.id === 'ai-reader-25' && state.aiTextsRead >= 25) shouldUnlock = true;
            // Vocabulary badges
            if (badge.id === 'vocab-1000' && state.uniqueWordsEncountered >= 1000) shouldUnlock = true;
            if (badge.id === 'vocab-2500' && state.uniqueWordsEncountered >= 2500) shouldUnlock = true;
            if (badge.id === 'vocab-5000' && state.uniqueWordsEncountered >= 5000) shouldUnlock = true;
            // Review badges
            if (badge.id === 'reviewer-10' && state.wordsReviewed >= 10) shouldUnlock = true;
            // Daily goal streak badges
            if (badge.id === 'daily-goal-7' && state.dailyGoalStreak >= 7) shouldUnlock = true;
            if (badge.id === 'daily-goal-30' && state.dailyGoalStreak >= 30) shouldUnlock = true;
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
            withTiming(1.15, { duration: 250, easing: Easing.out(Easing.cubic) }),
            withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
          );
          badgeOpacity.value = withTiming(1, { duration: 300 });
        }, 1600);

        // Badge-triggered upsell for free users (after badge animation)
        if (!isPremium && !hasOnboarded) {
          // First reading already shows paywall, skip
        } else if (!isPremium) {
          setTimeout(() => {
            setShowBadgeUpsell(true);
          }, 2500);
        }
      }

      // Check for streak celebration milestone
      const celebrationState = useSettingsStore.getState();
      if (
        STREAK_MILESTONES.includes(celebrationState.currentStreak) &&
        !celebrationState.shownStreakCelebrations.includes(celebrationState.currentStreak)
      ) {
        // Delay: after badge animation if present, otherwise 2s
        const delay = newlyUnlocked.length > 0 ? 3500 : 2000;
        setTimeout(() => setShowStreakCelebration(true), delay);
        // NOTE: markStreakCelebrationShown is now called in onDismiss to prevent race condition
      }
    };
    checkBadges();

    // Animation sequence
    // T+200ms: checkmark (simple fade-in, no bounce)
    const t1 = setTimeout(() => {
      checkScale.value = withTiming(1, { duration: 300 });
      checkOpacity.value = withTiming(1, { duration: 300 });
    }, 200);

    // T+400ms: haptic
    const t2 = setTimeout(() => {
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 400);

    // For first reading, we start at celebration (no auto-advance needed)
    // User manually advances to calibration via "Continue" button
    const t3: ReturnType<typeof setTimeout> | undefined = undefined;

    // T+2000ms: CTAs
    const t4 = setTimeout(() => {
      ctaOpacity.value = withTiming(1, { duration: 300 });
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (t3) clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [wordsRead, wpm, displayName, params.categoryKey, params.textId, params.customTextId, incrementWordsRead, addDailyWordsRead, resetDailyIfNewDay, incrementTextsCompleted, updateStreak, hapticFeedback, checkScale, checkOpacity, ctaOpacity, paywallOpacity, badgeScale, badgeOpacity, isFirstReading, addReadingHistory, incrementCategoryReadCount, unlockBadge, unlockReward, addLevelProgress, incrementDifficultyCount, textEntry]);

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

  const handleShareProgress = async () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const streakText = currentStreak > 1 ? `${currentStreak}-day streak` : '';
    const fallback = newBadge
      ? `I just earned the "${newBadge.name}" badge on Articulate! ${streakText ? `(${streakText})` : ''}\n\nImprove your reading skills one word at a time.`
      : `I just read ${wordsRead} words at ${wpm} WPM on Articulate! ${streakText ? `${streakText} and counting!` : ''}\n\nImprove your reading skills one word at a time.`;

    await captureAndShare(shareCardRef, fallback, 'Share Progress');
  };

  const handleShareBadge = async () => {
    if (!newBadge) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const tierText = newBadge.tier ? ` (${newBadge.tier.toUpperCase()})` : '';
    const message = `I just unlocked "${newBadge.name}"${tierText} on Articulate!\n\n${newBadge.description}\n\nImprove your reading skills one word at a time.`;

    try {
      await Share.share({ message });
    } catch (error) {
      // User cancelled or error occurred
    }
  };

  const handleSubscribe = () => {
    startTrial();
    setIsFirstReading(false);
    setHasOnboarded(true);
    router.replace('/');
  };

  const handleDismiss = () => {
    setFontFamily('sourceSerif');
    setWordColor('default');
    setHasOnboarded(true);
    setIsFirstReading(false);
    router.replace('/');
  };

  // ============================================
  // FIRST READING: Focused Calibration Layout
  // ============================================
  // Defensive: if hasOnboarded is false, treat as first reading
  const showFirstReadingFlow = isFirstReading || !hasOnboarded;

  if (showFirstReadingFlow) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          <View style={styles.firstReadingContent}>
            {/* Phase 1: Celebration (normal completion experience) */}
            {calibrationStep === 'celebration' && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.celebrationContainer}>
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

                {/* Headline */}
                <Animated.Text
                  entering={FadeIn.delay(500).duration(300)}
                  style={[styles.firstReadingHeadline, { color: colors.primary }]}
                >
                  Well Done!
                </Animated.Text>

                {/* Stats */}
                <Animated.Text
                  entering={FadeIn.delay(700).duration(300)}
                  style={[styles.firstReadingStats, { color: colors.secondary }]}
                >
                  {wordsRead} words · {timeDisplay}
                </Animated.Text>

                {/* Take Quiz (optional) */}
                <Animated.View entering={FadeIn.delay(900).duration(300)} style={styles.celebrationActions}>
                  <GlassButton
                    title="Take Quiz"
                    variant="outline"
                    onPress={() => router.push({
                      pathname: '/quiz',
                      params: {
                        ...(params.categoryKey ? { categoryKey: params.categoryKey } : {}),
                        ...(params.textId ? { textId: params.textId } : {}),
                      },
                    })}
                  />
                </Animated.View>

                {/* Continue to journey setup */}
                <Animated.View entering={FadeIn.delay(1300).duration(300)} style={styles.celebrationContinue}>
                  <GlassButton
                    title="Continue"
                    onPress={() => setCalibrationStep('journey')}
                  />
                </Animated.View>
              </Animated.View>
            )}

            {/* Phase 2: Journey Setup */}
            {calibrationStep === 'journey' && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.journeyContainer}>
                <Text style={[styles.journeyHeadline, { color: colors.primary }]}>
                  Your reading journey.
                </Text>

                <GlassCard style={styles.journeyCard}>
                  <View style={styles.journeyLevelCard}>
                    <Text style={[styles.journeyLevelTitle, { color: colors.primary }]}>
                      Level 1 · Beginner
                    </Text>
                    <View style={[styles.journeyProgressBar, { backgroundColor: glass.border }]}>
                      <View style={[styles.journeyProgressFill, { backgroundColor: colors.primary, width: `${Math.min(100, (wordsRead / 1000) * 100)}%` }]} />
                    </View>
                    <Text style={[styles.journeyLevelSubtitle, { color: colors.muted }]}>
                      {wordsRead.toLocaleString()} / 1,000 words to Intermediate
                    </Text>
                  </View>
                </GlassCard>

                <Text style={[styles.journeyGoalPrompt, { color: colors.secondary }]}>
                  You read {wordsRead} words in {timeDisplay}.{'\n'}How much feels right daily?
                </Text>

                <View style={styles.goalPickerContainer}>
                  <GoalScrollPicker
                    value={selectedGoal}
                    onValueChange={setSelectedGoal}
                    options={[50, 100, 150, 200, 250, 300]}
                  />
                </View>
                <Text style={[styles.goalEstimate, { color: colors.muted }]}>
                  ~{Math.round(selectedGoal / 10)} min/day
                </Text>

                <View style={styles.journeyCta}>
                  <GlassButton title="Start Your Journey" onPress={handleStartJourney} />
                </View>
              </Animated.View>
            )}

            {/* Phase 4: Onboarding Paywall */}
            {calibrationStep === 'paywall' && (
              <OnboardingPaywall
                fontFamily={fontFamily}
                wordColor={wordColor}
                backgroundTheme={backgroundTheme}
                dailyGoal={selectedGoal}
                onSubscribe={handlePaywallComplete}
                onContinueFree={handlePaywallComplete}
              />
            )}
          </View>
        </SafeAreaView>

        {/* Paywall modal (for upgrade banner tap) */}
        <Paywall
          visible={showPaywall}
          onDismiss={() => setPaywallContext(null)}
          context={paywallContext}
        />

        {/* Streak celebration popup */}
        <StreakCelebrationPopup
          visible={showStreakCelebration}
          streak={currentStreak}
          onDismiss={() => {
            markStreakCelebrationShown(currentStreak);
            setShowStreakCelebration(false);
          }}
        />
      </View>
    );
  }

  // ============================================
  // NORMAL COMPLETION: Full Layout
  // ============================================
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
                <Feather name={displayIcon} size={16} color={colors.secondary} />
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
                  {currentStreak >= 30 ? '  ·  +20% XP bonus' : currentStreak >= 7 ? '  ·  +10% XP bonus' : ''}
                </Text>
              </Animated.View>
            )}

            {/* Badge unlock notification */}
            {newBadge && (
              <Animated.View style={[styles.badgeUnlockContainer, badgeAnimStyle]}>
                <View style={styles.badgeUnlock}>
                  <Feather name="award" size={18} color={colors.primary} />
                  <Text style={[styles.badgeUnlockText, { color: colors.primary }]}>
                    {newBadge.name}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Badge-triggered upsell for free users */}
            {showBadgeUpsell && newBadge && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.badgeUpsellContainer}>
                <Text style={[styles.badgeUpsellText, { color: colors.secondary }]}>
                  You're making progress! Unlock all badges and premium features
                </Text>
                <Pressable
                  onPress={() => {
                    setShowBadgeUpsell(false);
                    setPaywallContext('generic');
                  }}
                  style={styles.badgeUpsellLink}
                >
                  <Text style={[styles.badgeUpsellLinkText, { color: colors.primary }]}>
                    See what's included →
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* Milestone celebration */}
            {(() => {
              const milestones: Record<number, string> = {
                1: 'Your reading habit starts here.',
                3: '3 done. You\'re building momentum.',
                5: '5 reads = habit forming. Keep it up.',
                6: '6 reads. Consistency looks good on you.',
                9: '9 done. Double digits are next.',
                10: '10 done. You\'re in the top 5% of starters.',
                12: '12 reads. You\'re a regular now.',
                15: '15 done. This is who you are.',
                25: '25 down. Your streak is real now.',
                50: '50 completed! You\'ve read 10K+ words.',
                100: '100 readings complete. You\'re a reading master.',
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

            {/* Weekly challenge progress nudge */}
            {(() => {
              const { weeklyChallengeProgress, weeklyChallengeCompleted } = useSettingsStore.getState();
              const challenge = getCurrentChallenge();
              const remaining = challenge.target - weeklyChallengeProgress;
              if (weeklyChallengeCompleted) {
                return (
                  <Animated.View entering={FadeIn.delay(1700).duration(300)}>
                    <Text style={[styles.milestoneText, { color: colors.secondary }]}>
                      Weekly challenge complete!
                    </Text>
                  </Animated.View>
                );
              }
              if (remaining > 0 && remaining < challenge.target) {
                return (
                  <Animated.View entering={FadeIn.delay(1700).duration(300)}>
                    <Text style={[styles.milestoneText, { color: colors.secondary }]}>
                      {remaining} more to finish this week's challenge
                    </Text>
                  </Animated.View>
                );
              }
              return null;
            })()}

            {/* Nudge text for free users */}
            {!isPremium && textsCompleted >= 3 && !hasShownThirdReadingNudge ? (
              <Animated.View entering={FadeIn.delay(1800).duration(300)}>
                <Pressable onPress={() => {
                  setHasShownThirdReadingNudge(true);
                  setPaywallContext('generic');
                }}>
                  <Text style={[styles.nudgeText, { color: colors.secondary }]}>
                    {textsCompleted} reads done. Unlock unlimited uploads and 6 more categories.
                  </Text>
                </Pressable>
              </Animated.View>
            ) : null}

          </View>
        </ScrollView>

        {/* CTAs */}
        <Animated.View style={[styles.ctaContainer, ctaAnimStyle]}>
          <GlassButton title="Continue" onPress={handleContinue} />
          {nextText && (
            <GlassButton
              title={`Read Next: "${nextText.title.length > 25 ? nextText.title.slice(0, 25) + '...' : nextText.title}"`}
              onPress={handleReadNext}
              variant="outline"
            />
          )}
          {isPremium ? (
            <GlassButton
              title="Take Quiz"
              onPress={handleTakeQuiz}
              variant="outline"
            />
          ) : canUseFreeQuiz() ? (
            <GlassButton
              title="Take Quiz (Free Today)"
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
          <View style={styles.secondaryActions}>
            {showPracticeInstead ? (
              <Pressable
                onPress={() => router.push('/word-bank')}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="book-open" size={18} color={colors.primary} />
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  {suggestReview ? 'Review Words' : 'Practice Words'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleReadAgain}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="refresh-cw" size={18} color={colors.primary} />
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Read Again
                </Text>
              </Pressable>
            )}
            {isBundledText && (
              <Pressable
                onPress={handleToggleFavorite}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name={isFavorited ? 'heart' : 'heart'} size={18} color={isFavorited ? '#FF6B6B' : colors.primary} />
                <Text style={[styles.secondaryButtonText, { color: isFavorited ? '#FF6B6B' : colors.primary }]}>
                  {isFavorited ? 'Saved' : 'Save'}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleShareProgress}
              style={({ pressed }) => [
                styles.secondaryButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Feather name="share" size={18} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Share
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Paywall modal (for third-reading nudge) */}
      <Paywall
        visible={showPaywall}
        onDismiss={() => setPaywallContext(null)}
        context={paywallContext}
      />

      {/* Streak celebration popup */}
      <StreakCelebrationPopup
        visible={showStreakCelebration}
        streak={currentStreak}
        onDismiss={() => {
          markStreakCelebrationShown(currentStreak);
          setShowStreakCelebration(false);
        }}
      />

      {/* Off-screen share card for capture */}
      <View style={styles.offScreenContainer} pointerEvents="none">
        <StreakShareCard
          ref={shareCardRef}
          streak={currentStreak}
          message={getShareStreakMessage(currentStreak)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offScreenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
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
  badgeUnlockContainer: {
    alignItems: 'center',
    gap: 8,
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
  shareBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  shareBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Badge upsell
  badgeUpsellContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  badgeUpsellText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  badgeUpsellLink: {
    paddingVertical: 4,
  },
  badgeUpsellLinkText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Journey setup styles
  journeySection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  journeyHeadline: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  journeyLevelCard: {
    alignItems: 'center',
    gap: 8,
  },
  journeyLevelTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  journeyProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  journeyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  journeyLevelSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  journeyDivider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginVertical: 8,
  },
  journeyGoalPrompt: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  goalPickerContainer: {
    width: '100%',
    marginTop: 8,
  },
  goalEstimate: {
    fontSize: 13,
    fontWeight: '400',
  },
  // First reading focused layout
  firstReadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  firstReadingHeadline: {
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 34,
    marginTop: 16,
  },
  firstReadingStats: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  journeyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  journeyCard: {
    width: '100%',
  },
  journeyCta: {
    width: '100%',
    marginTop: 24,
  },
  // Celebration phase styles
  celebrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  celebrationActions: {
    width: '100%',
    marginTop: 16,
  },
  celebrationContinue: {
    width: '100%',
    marginTop: 8,
  },
  // Upgrade banner (inline soft CTA)
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    marginTop: 16,
    gap: 12,
    width: '100%',
  },
  upgradeBannerText: {
    flex: 1,
    gap: 2,
  },
  upgradeBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  upgradeBannerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
});
