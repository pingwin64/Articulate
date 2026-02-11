import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import type { SavedWord } from '../lib/store/settings';
import { usePronunciationDrill } from '../hooks/usePronunciationDrill';
import { useRecording } from '../hooks/useRecording';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { NumberRoll } from '../components/NumberRoll';
import { Spacing } from '../design/theme';
import { fetchDefinition } from '../lib/definitions';

type Phase = 'ready' | 'countdown' | 'review' | 'complete';
type WordResult = 'perfect' | 'close' | 'missed';

type DeltaInfo =
  | { type: 'best' }
  | { type: 'up'; delta: number }
  | { type: 'down'; delta: number }
  | { type: 'same' }
  | { type: 'first' };

export default function WordBankScreen() {
  const { colors, glass } = useTheme();
  const router = useRouter();
  const savedWords = useSettingsStore((s) => s.savedWords);
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const isPremium = useSettingsStore((s) => s.isPremium);
  const incrementWordsReviewed = useSettingsStore((s) => s.incrementWordsReviewed);
  const pronunciationHistory = useSettingsStore((s) => s.pronunciationHistory);
  const setLastWordReviewDate = useSettingsStore((s) => s.setLastWordReviewDate);
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed);
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const reviewSessions = useSettingsStore((s) => s.reviewSessions);
  const addReviewSession = useSettingsStore((s) => s.addReviewSession);

  // ─── Phase state machine ──────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('ready');

  // ─── Review state ─────────────────────────────────────────────
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const showDefinitionRef = useRef(false);
  const [reviewOrder, setReviewOrder] = useState<SavedWord[]>([]);
  const [pronunciationEnabled, setPronunciationEnabled] = useState(false);
  const [drillPerfects, setDrillPerfects] = useState(0);
  const [drillTotal, setDrillTotal] = useState(0);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const sessionStartRef = useRef(Date.now());

  // Per-word results tracking for completion screen
  const wordResultsRef = useRef<Map<string, WordResult>>(new Map());

  // Recording + pronunciation drill hooks
  const recorder = useRecording();
  const drill = usePronunciationDrill({ ttsSpeed, voiceGender, hapticFeedback, recorder });

  const lastWordReviewDate = useSettingsStore((s) => s.lastWordReviewDate);

  // ─── Ready screen insight ──────────────────────────────────────
  const readyInsight = useMemo(() => {
    const pronSessions = reviewSessions.filter(s => (s.mode ?? 'pronunciation') === 'pronunciation');
    if (pronSessions.length > 0) {
      const best = Math.max(...pronSessions.map(s => s.accuracy));
      return `Your best: ${best}%`;
    }
    const newCount = savedWords.filter(w => !w.lastReviewedDate).length;
    if (newCount > 0) return `${newCount} new words`;
    return null;
  }, [reviewSessions, savedWords]);

  // ─── Smart flashcard ordering ─────────────────────────────────
  const smartReviewOrder = useMemo(() => {
    return [...savedWords].sort((a, b) => {
      const aHistory = pronunciationHistory[a.word.toLowerCase()];
      const bHistory = pronunciationHistory[b.word.toLowerCase()];
      if (!a.lastReviewedDate && b.lastReviewedDate) return -1;
      if (a.lastReviewedDate && !b.lastReviewedDate) return 1;
      const aAccuracy = aHistory ? aHistory.perfects / aHistory.attempts : 0;
      const bAccuracy = bHistory ? bHistory.perfects / bHistory.attempts : 0;
      if (aAccuracy !== bAccuracy) return aAccuracy - bAccuracy;
      const aDate = a.lastReviewedDate ? new Date(a.lastReviewedDate).getTime() : 0;
      const bDate = b.lastReviewedDate ? new Date(b.lastReviewedDate).getTime() : 0;
      return aDate - bDate;
    });
  }, [savedWords, pronunciationHistory]);

  // ─── Animated shared values ───────────────────────────────────
  const flipProgress = useSharedValue(0);
  const cardTranslateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  // Countdown animation values
  const countdownScale = useSharedValue(1.2);
  const countdownOpacity = useSharedValue(0);
  const [countdownNumber, setCountdownNumber] = useState(3);

  const frontFaceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 0]),
  }));
  const backFaceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0, 1]),
  }));
  const cardTransitionStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cardTranslateX.value }],
    opacity: cardOpacity.value,
  }));
  const countdownAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
    opacity: countdownOpacity.value,
  }));

  // ─── Auto-start review on mount ──────────────────────────────
  const handleStartReview = useCallback(() => {
    if (savedWords.length === 0) return;
    const canPronounce = isPremium || useSettingsStore.getState().canUseFreeListenRepeat();
    setPronunciationEnabled(canPronounce);
    if (canPronounce && !isPremium) {
      useSettingsStore.getState().useFreeListenRepeat();
    }
    setReviewOrder([...smartReviewOrder]);
    setReviewIndex(0);
    showDefinitionRef.current = false;
    setShowDefinition(false);
    setDrillPerfects(0);
    setDrillTotal(0);
    wordResultsRef.current = new Map();
    sessionStartRef.current = Date.now();
    flipProgress.value = 0;
    cardTranslateX.value = 0;
    cardOpacity.value = 1;
    setLastWordReviewDate(new Date().toISOString());
  }, [savedWords, smartReviewOrder, isPremium, setLastWordReviewDate, flipProgress, cardTranslateX, cardOpacity]);

  // Start countdown and review — called from ready screen button
  const startCountdown = useCallback(() => {
    if (savedWords.length === 0) return;

    handleStartReview();
    setPhase('countdown');

    let step = 0;
    const beats = [3, 2, 1];

    const animateBeat = () => {
      if (step >= beats.length) {
        countdownOpacity.value = withTiming(0, { duration: 200 });
        setTimeout(() => setPhase('review'), 250);
        return;
      }

      setCountdownNumber(beats[step]);
      countdownScale.value = 1.2;
      countdownOpacity.value = 0;

      countdownScale.value = withTiming(1.0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      countdownOpacity.value = withTiming(1, { duration: 200 });

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setTimeout(() => {
        countdownOpacity.value = withTiming(0, { duration: 200 });
      }, 750);

      step++;
      setTimeout(animateBeat, 1000);
    };

    setTimeout(animateBeat, 400);
  }, [savedWords, handleStartReview, hapticFeedback, countdownScale, countdownOpacity]);

  // ─── Card interactions ────────────────────────────────────────

  const handleFlipCard = useCallback(() => {
    if (showDefinitionRef.current) return;
    showDefinitionRef.current = true;
    drill.stopDrill();
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDefinition(true);
  }, [hapticFeedback, drill]);

  const handleListenToWord = useCallback(() => {
    drill.listenToWord();
  }, [drill]);

  const handleRetryDrill = useCallback(() => {
    const word = reviewOrder[reviewIndex]?.word;
    if (!word) return;
    drill.dismissFeedback();
    setTimeout(() => drill.startDrill(word), 300);
  }, [drill, reviewOrder, reviewIndex]);

  const handleCardTap = useCallback(() => {
    if (pronunciationEnabled && drill.phase === 'result' && drill.feedback && drill.feedback.result !== 'perfect') {
      handleRetryDrill();
      return;
    }
    flipProgress.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    handleFlipCard();
  }, [pronunciationEnabled, drill, handleRetryDrill, handleFlipCard, flipProgress]);

  const flipTap = Gesture.Tap().onEnd(() => {
    'worklet';
    if (flipProgress.value > 0.5) return;
    runOnJS(handleCardTap)();
  });

  const speakerTap = Gesture.Tap().onEnd(() => {
    'worklet';
    runOnJS(handleListenToWord)();
  });

  // ─── Side effects after definition revealed ──────────────────
  useEffect(() => {
    if (!showDefinition || phase !== 'review') return;
    incrementWordsReviewed();
    const currentWord = reviewOrder[reviewIndex];
    if (currentWord) {
      const { savedWords: words } = useSettingsStore.getState();
      const idx = words.findIndex((w) => w.id === currentWord.id);
      if (idx >= 0) {
        const updated = [...words];
        updated[idx] = { ...updated[idx], lastReviewedDate: new Date().toISOString() };
        useSettingsStore.setState({ savedWords: updated });
      }

      // Record word result based on pronunciation feedback (only if user actually spoke)
      if (pronunciationEnabled && drill.feedback) {
        wordResultsRef.current.set(currentWord.word, drill.feedback.result as WordResult);
      }
    }
  }, [showDefinition, phase, incrementWordsReviewed, reviewOrder, reviewIndex, pronunciationEnabled, drill.feedback]);

  // Lazy-fetch definition
  useEffect(() => {
    if (!showDefinition || phase !== 'review') return;
    const currentWord = reviewOrder[reviewIndex];
    if (!currentWord || currentWord.definition) return;
    setDefinitionLoading(true);
    fetchDefinition(currentWord.word)
      .then((data) => {
        useSettingsStore.getState().enrichSavedWord(currentWord.word, {
          syllables: data.syllables,
          partOfSpeech: data.partOfSpeech,
          definition: data.definition,
        });
        setReviewOrder((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((w) => w.id === currentWord.id);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], syllables: data.syllables, partOfSpeech: data.partOfSpeech, definition: data.definition };
          }
          return updated;
        });
      })
      .catch(() => {})
      .finally(() => setDefinitionLoading(false));
  }, [showDefinition, phase, reviewOrder, reviewIndex]);

  // Auto-flip after pronunciation result (only on perfect)
  useEffect(() => {
    if (drill.phase !== 'result' || showDefinitionRef.current) return;
    if (drill.feedback) {
      setDrillTotal((t) => t + 1);
      if (drill.feedback.result === 'perfect') setDrillPerfects((p) => p + 1);
    }
    if (!drill.feedback || drill.feedback.result !== 'perfect') return;
    const timer = setTimeout(() => {
      if (!showDefinitionRef.current) {
        showDefinitionRef.current = true;
        flipProgress.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        setShowDefinition(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [drill.phase, drill.feedback, flipProgress]);

  // Auto-start drill when card appears
  useEffect(() => {
    if (phase !== 'review' || !pronunciationEnabled || showDefinitionRef.current) return;
    const word = reviewOrder[reviewIndex];
    if (!word) return;
    const timer = setTimeout(() => drill.startDrill(word.word), 400);
    return () => clearTimeout(timer);
  }, [phase, pronunciationEnabled, reviewIndex, reviewOrder]);

  // ─── Card navigation ─────────────────────────────────────────

  const handleNextCard = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    drill.stopDrill();
    drill.dismissFeedback();

    // Record result for current word if not already recorded (only if user actually spoke)
    const currentWord = reviewOrder[reviewIndex];
    if (currentWord && !wordResultsRef.current.has(currentWord.word)) {
      if (pronunciationEnabled && drill.feedback) {
        wordResultsRef.current.set(currentWord.word, drill.feedback.result as WordResult);
      }
    }

    if (reviewIndex >= reviewOrder.length - 1) {
      // Last card — show completion
      setPhase('complete');
      return;
    }

    // Slide out left
    cardOpacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
    cardTranslateX.value = withTiming(-30, { duration: 150, easing: Easing.in(Easing.ease) });

    setTimeout(() => {
      showDefinitionRef.current = false;
      setShowDefinition(false);
      flipProgress.value = 0;
      cardTranslateX.value = 30;
      cardOpacity.value = 0;
      setReviewIndex((i) => i + 1);
      requestAnimationFrame(() => {
        cardOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
        cardTranslateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
      });
    }, 160);
  }, [hapticFeedback, reviewIndex, reviewOrder, drill, flipProgress, cardTranslateX, cardOpacity, pronunciationEnabled]);

  const handlePrevCard = useCallback(() => {
    if (reviewIndex <= 0) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    drill.stopDrill();
    drill.dismissFeedback();

    cardOpacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
    cardTranslateX.value = withTiming(30, { duration: 150, easing: Easing.in(Easing.ease) });

    setTimeout(() => {
      showDefinitionRef.current = false;
      setShowDefinition(false);
      flipProgress.value = 0;
      cardTranslateX.value = -30;
      cardOpacity.value = 0;
      setReviewIndex((i) => i - 1);
      requestAnimationFrame(() => {
        cardOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
        cardTranslateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
      });
    }, 160);
  }, [hapticFeedback, reviewIndex, drill, flipProgress, cardTranslateX, cardOpacity]);

  const handleExitReview = useCallback(() => {
    drill.stopDrill();
    router.back();
  }, [drill, router]);

  // ─── Completion stats ─────────────────────────────────────────
  const completionAccuracy = useMemo(() => {
    if (drillTotal === 0) return null;
    return Math.round((drillPerfects / drillTotal) * 100);
  }, [drillPerfects, drillTotal]);

  const resultCounts = useMemo(() => {
    let perfect = 0;
    let close = 0;
    let missed = 0;
    wordResultsRef.current.forEach((result) => {
      if (result === 'perfect') perfect++;
      else if (result === 'close') close++;
      else missed++;
    });
    return { perfect, close, missed };
  }, [phase]); // Recalculate when phase changes to complete

  // ─── Completion delta (compare against prior pronunciation sessions) ─────
  const completionDelta = useMemo((): DeltaInfo | null => {
    if (phase !== 'complete' || completionAccuracy === null) return null;
    const pronSessions = reviewSessions.filter(s => (s.mode ?? 'pronunciation') === 'pronunciation');
    if (pronSessions.length === 0) return { type: 'first' };
    const lastAccuracy = pronSessions[0].accuracy;
    const bestAccuracy = Math.max(...pronSessions.map(s => s.accuracy));
    const diff = completionAccuracy - lastAccuracy;
    if (completionAccuracy > bestAccuracy) return { type: 'best' };
    if (diff > 0) return { type: 'up', delta: diff };
    if (diff < 0) return { type: 'down', delta: Math.abs(diff) };
    return { type: 'same' };
  }, [phase, completionAccuracy, reviewSessions]);

  // Session number (count of prior sessions + 1 for current)
  const sessionNumber = useMemo(() => {
    if (phase !== 'complete') return 0;
    return reviewSessions.length + 1;
  }, [phase, reviewSessions]);

  // ─── Persist session on action (not on phase change) ──────────
  const persistSession = useCallback(() => {
    const mode = drillTotal > 0 ? 'pronunciation' as const : 'flashcard' as const;
    addReviewSession({
      accuracy: completionAccuracy ?? 0,
      wordCount: reviewOrder.length,
      perfects: resultCounts.perfect,
      close: resultCounts.close,
      missed: resultCounts.missed,
      mode,
    });
  }, [addReviewSession, completionAccuracy, reviewOrder, resultCounts, drillTotal]);

  // ─── Empty state ──────────────────────────────────────────────
  if (savedWords.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.emptyState}>
          <Feather name="bookmark" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.primary }]}>
            No saved words yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Tap the ? icon while reading to look up words,{'\n'}then tap the heart to save them here.
          </Text>
        </View>
      </View>
    );
  }

  // ─── Ready Phase (launch pad) ─────────────────────────────────
  if (phase === 'ready') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.readyContainer}>
          <View style={styles.readyHero}>
            <Animated.Text
              entering={FadeIn.duration(400)}
              style={[styles.readyBigNumber, { color: colors.primary }]}
            >
              {smartReviewOrder.length}
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(100).duration(400)}
              style={[styles.readyWordLabel, { color: colors.muted }]}
            >
              words
            </Animated.Text>

            {readyInsight && (
              <Animated.Text
                entering={FadeIn.delay(250).duration(400)}
                style={[styles.readyInsight, { color: colors.secondary }]}
              >
                {readyInsight}
              </Animated.Text>
            )}
          </View>

          <View style={styles.readyStartButton}>
            <GlassButton title="Start Review" onPress={startCountdown} />
          </View>
        </View>
      </View>
    );
  }

  // ─── Countdown Phase ─────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.countdownContainer}>
          <Animated.View style={[styles.countdownNumberContainer, countdownAnimStyle]}>
            <Text style={[styles.countdownNumber, { color: colors.primary }]}>
              {countdownNumber}
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ─── Completion Phase ─────────────────────────────────────────
  if (phase === 'complete') {
    const isPronunciationMode = drillTotal > 0;

    // Delta line rendering
    const renderDelta = () => {
      if (!completionDelta) return null;
      let text = '';
      let color = colors.muted;
      switch (completionDelta.type) {
        case 'best':
          text = 'New best!';
          color = '#22C55E';
          break;
        case 'up':
          text = `\u2191 ${completionDelta.delta} from last`;
          color = '#22C55E';
          break;
        case 'down':
          text = `\u2193 ${completionDelta.delta} from last`;
          color = colors.muted;
          break;
        case 'same':
          text = 'Same as last';
          color = colors.muted;
          break;
        case 'first':
          text = 'First session!';
          color = colors.secondary;
          break;
      }
      return (
        <Animated.Text
          entering={FadeIn.delay(1200).duration(300)}
          style={[styles.completionDelta, { color }]}
        >
          {text}
        </Animated.Text>
      );
    };

    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.completionContainer}>
          <View style={styles.completionContent}>
            {isPronunciationMode ? (
              <>
                {completionAccuracy !== null && (
                  <NumberRoll
                    target={completionAccuracy}
                    duration={1000}
                    suffix="%"
                    style={styles.completionBigStat}
                  />
                )}
                {renderDelta()}
                <View style={styles.scorecardRows}>
                  <Animated.View entering={FadeIn.delay(1400).duration(300)} style={styles.scorecardRow}>
                    <Feather name="check" size={16} color="#22C55E" />
                    <Text style={[styles.scorecardLabel, { color: colors.secondary }]}>Perfect</Text>
                    <Text style={[styles.scorecardValue, { color: '#22C55E' }]}>{resultCounts.perfect}</Text>
                  </Animated.View>
                  <Animated.View entering={FadeIn.delay(1500).duration(300)} style={styles.scorecardRow}>
                    <Feather name="minus" size={16} color="#EAB308" />
                    <Text style={[styles.scorecardLabel, { color: colors.secondary }]}>Close</Text>
                    <Text style={[styles.scorecardValue, { color: '#EAB308' }]}>{resultCounts.close}</Text>
                  </Animated.View>
                  <Animated.View entering={FadeIn.delay(1600).duration(300)} style={styles.scorecardRow}>
                    <Feather name="x" size={16} color={colors.muted} />
                    <Text style={[styles.scorecardLabel, { color: colors.secondary }]}>Missed</Text>
                    <Text style={[styles.scorecardValue, { color: colors.muted }]}>{resultCounts.missed}</Text>
                  </Animated.View>
                </View>
              </>
            ) : (
              <>
                <Animated.View entering={FadeIn.duration(400)} style={styles.completionCheckContainer}>
                  <Feather name="check-circle" size={48} color={colors.secondary} />
                </Animated.View>
                <Animated.Text
                  entering={FadeIn.delay(200).duration(300)}
                  style={[styles.completionReviewedText, { color: colors.primary }]}
                >
                  {reviewOrder.length} words reviewed
                </Animated.Text>
              </>
            )}

            <Animated.Text
              entering={FadeIn.delay(1800).duration(300)}
              style={[styles.completionSession, { color: colors.muted }]}
            >
              Session {sessionNumber}
            </Animated.Text>

            <Animated.View entering={FadeIn.delay(2000).duration(400)} style={styles.completionActionsRow}>
              <View style={{ flex: 1 }}>
                <GlassButton
                  title="Try Again"
                  variant="outline"
                  onPress={() => {
                    persistSession();
                    handleStartReview();
                    setPhase('review');
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <GlassButton
                  title="Done"
                  onPress={() => {
                    persistSession();
                    router.back();
                  }}
                />
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }

  // ─── Review Phase (flashcards) ────────────────────────────────
  const currentWord = reviewOrder[reviewIndex];
  const isLastCard = reviewIndex >= reviewOrder.length - 1;
  const isFirstCard = reviewIndex === 0;

  if (!currentWord) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.primary }]}>No words to review</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.reviewContainer}>
        <Text style={[styles.reviewProgress, { color: colors.muted }]}>
          {reviewIndex + 1} / {reviewOrder.length}
        </Text>

        <GestureDetector gesture={flipTap}>
          <Animated.View style={[styles.flashcard, cardTransitionStyle]}>
            <GlassCard>
              <View style={styles.flashcardFixed}>
                {/* ─── FRONT FACE ─── */}
                <Animated.View style={[styles.flashcardFace, frontFaceStyle]} pointerEvents={showDefinition ? 'none' : 'auto'}>
                  <Text style={[styles.flashcardWord, { color: colors.primary }]}>
                    {currentWord.word}
                  </Text>

                  {pronunciationEnabled && drill.phase === 'recording' && (
                    <Animated.View entering={FadeIn.duration(200)} style={styles.drillStatusRow}>
                      <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
                      <Text style={[styles.drillStatusText, { color: colors.error }]}>
                        Your turn...
                      </Text>
                    </Animated.View>
                  )}

                  {pronunciationEnabled && drill.phase === 'processing' && (
                    <Animated.View entering={FadeIn.duration(200)} style={styles.drillStatusRow}>
                      <ActivityIndicator size="small" color={colors.muted} />
                      <Text style={[styles.drillStatusText, { color: colors.muted }]}>
                        Checking...
                      </Text>
                    </Animated.View>
                  )}

                  {pronunciationEnabled && drill.phase === 'result' && drill.error && (
                    <Animated.View style={[styles.drillStatusRow, drill.feedbackAnimStyle]}>
                      <Text style={[styles.drillStatusText, { color: colors.secondary }]}>
                        {drill.error}
                      </Text>
                    </Animated.View>
                  )}

                  {pronunciationEnabled && drill.phase === 'result' && drill.feedback && (
                    <Animated.View style={[styles.drillResultBlock, drill.feedbackAnimStyle]}>
                      <Text style={[
                        styles.drillResultText,
                        {
                          color: drill.feedback.result === 'perfect'
                            ? '#22C55E'
                            : drill.feedback.result === 'close'
                              ? '#EAB308'
                              : colors.secondary,
                        },
                      ]}>
                        {drill.feedback.result === 'perfect'
                          ? 'Perfect!'
                          : drill.feedback.result === 'close'
                            ? 'Close!'
                            : 'Try again'}
                      </Text>
                      {drill.feedback.result !== 'perfect' && (
                        <Text style={[styles.drillHeard, { color: colors.muted }]}>
                          Heard: &ldquo;{drill.feedback.transcribed}&rdquo;
                        </Text>
                      )}
                    </Animated.View>
                  )}

                  {pronunciationEnabled && (drill.phase === 'recording' || drill.phase === 'idle') && (
                    <Text style={[styles.flashcardHint, { color: colors.muted }]}>
                      {drill.phase === 'idle' ? 'Starting...' : 'or tap to reveal'}
                    </Text>
                  )}

                  {pronunciationEnabled && drill.phase === 'result' && drill.feedback && drill.feedback.result !== 'perfect' && (
                    <Text style={[styles.flashcardHint, { color: colors.muted }]}>
                      Tap to try again
                    </Text>
                  )}

                  {!pronunciationEnabled && (
                    <Text style={[styles.flashcardHint, { color: colors.muted }]}>
                      Tap to reveal
                    </Text>
                  )}

                  {pronunciationEnabled && (drill.phase === 'recording' || drill.phase === 'idle') && (
                    <GestureDetector gesture={speakerTap}>
                      <Animated.View style={styles.listenButtonCorner}>
                        <Feather name="volume-2" size={18} color={colors.muted} />
                      </Animated.View>
                    </GestureDetector>
                  )}
                </Animated.View>

                {/* ─── BACK FACE ─── */}
                <Animated.View style={[styles.flashcardFace, styles.flashcardFaceBack, backFaceStyle]} pointerEvents={showDefinition ? 'auto' : 'none'}>
                  <View style={styles.flashcardBackHeader}>
                    <Text style={[styles.flashcardBackWord, { color: colors.primary }]}>
                      {currentWord.word}
                    </Text>
                    <Pressable onPress={() => drill.listenToWord()} hitSlop={12} style={styles.backSpeakerButton}>
                      <Feather name="volume-2" size={18} color={colors.muted} />
                    </Pressable>
                    {currentWord.partOfSpeech && (
                      <View style={[styles.posBadge, { backgroundColor: colors.primary + '12' }]}>
                        <Text style={[styles.posBadgeText, { color: colors.primary }]}>
                          {currentWord.partOfSpeech}
                        </Text>
                      </View>
                    )}
                  </View>

                  {currentWord.syllables && (
                    <Text style={[styles.flashcardSyllables, { color: colors.muted }]}>
                      {currentWord.syllables}
                    </Text>
                  )}

                  {(currentWord.definition || currentWord.syllables || currentWord.partOfSpeech) ? (
                    <>
                      <View style={[styles.flashcardDivider, { backgroundColor: glass.border }]} />
                      {currentWord.definition && (
                        <Text style={[styles.flashcardBackDefinition, { color: colors.secondary }]}>
                          {currentWord.definition}
                        </Text>
                      )}
                    </>
                  ) : definitionLoading ? (
                    <View style={styles.flashcardLoadingContainer}>
                      <ActivityIndicator size="small" color={colors.muted} />
                    </View>
                  ) : (
                    <Text style={[styles.flashcardNoDefinition, { color: colors.muted }]}>
                      No definition saved
                    </Text>
                  )}

                  {drill.feedback && (
                    <View style={styles.pronunciationBadge}>
                      <Text style={[
                        styles.pronunciationBadgeText,
                        {
                          color: drill.feedback.result === 'perfect'
                            ? '#22C55E'
                            : drill.feedback.result === 'close'
                              ? '#EAB308'
                              : colors.muted,
                        },
                      ]}>
                        {drill.feedback.result === 'perfect'
                          ? 'Perfect'
                          : drill.feedback.result === 'close'
                            ? 'Close'
                            : 'Missed'}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </View>
            </GlassCard>
          </Animated.View>
        </GestureDetector>

        {/* Navigation row */}
        <View style={styles.flashcardNav}>
          <Pressable
            onPress={handlePrevCard}
            disabled={isFirstCard}
            style={[styles.navArrow, isFirstCard && styles.navArrowDisabled]}
            hitSlop={12}
          >
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </Pressable>

          <View style={styles.navMainButton}>
            <GlassButton
              title={isLastCard ? 'Finish' : 'Next Word'}
              onPress={handleNextCard}
            />
          </View>

          <Pressable
            onPress={handleNextCard}
            disabled={isLastCard}
            style={[styles.navArrow, isLastCard && styles.navArrowDisabled]}
            hitSlop={12}
          >
            <Feather name="chevron-right" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <Pressable onPress={handleExitReview} style={styles.reviewDismiss}>
          <Text style={[styles.reviewDismissText, { color: colors.muted }]}>
            Exit Review
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ─── Empty state ────────────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  // ─── Ready screen ──────────────────────────────────────────
  readyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: '12%',
  },
  readyHero: {
    alignItems: 'center',
    gap: 2,
  },
  readyBigNumber: {
    fontSize: 72,
    fontWeight: '700',
  },
  readyWordLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  readyInsight: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 12,
  },
  readyStartButton: {
    maxWidth: 240,
    width: '70%',
    marginTop: 32,
  },
  // ─── Countdown ─────────────────────────────────────────────
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumberContainer: {
    position: 'absolute',
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: '700',
  },
  // ─── Completion ────────────────────────────────────────────
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  completionContent: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  completionBigStat: {
    fontSize: 56,
    fontWeight: '700',
  },
  completionDelta: {
    fontSize: 15,
    fontWeight: '500',
  },
  completionCheckContainer: {
    marginBottom: 4,
  },
  completionReviewedText: {
    fontSize: 20,
    fontWeight: '600',
  },
  completionSession: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },
  completionActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 12,
  },
  scorecardRows: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  scorecardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  scorecardLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  scorecardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  // ─── Review mode ───────────────────────────────────────────
  reviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 24,
  },
  reviewProgress: {
    fontSize: 14,
    fontWeight: '500',
  },
  flashcard: {
    width: '100%',
  },
  flashcardFixed: {
    height: 260,
    position: 'relative',
  },
  flashcardFace: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  flashcardFaceBack: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 28,
  },
  flashcardWord: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flashcardHint: {
    fontSize: 14,
    fontWeight: '400',
  },
  flashcardBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  flashcardBackWord: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  posBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  posBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  flashcardSyllables: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 1,
    marginBottom: 4,
  },
  flashcardDivider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  flashcardBackDefinition: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  flashcardNoDefinition: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
    marginTop: 16,
  },
  flashcardLoadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  pronunciationBadge: {
    marginTop: 12,
  },
  pronunciationBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  flashcardNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  navArrow: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  navMainButton: {
    flex: 1,
  },
  reviewDismiss: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  reviewDismissText: {
    fontSize: 14,
    fontWeight: '500',
  },
  drillStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  drillStatusText: {
    fontSize: 15,
    fontWeight: '500',
  },
  drillResultBlock: {
    alignItems: 'center',
    gap: 4,
  },
  drillResultText: {
    fontSize: 20,
    fontWeight: '700',
  },
  drillHeard: {
    fontSize: 13,
    fontWeight: '400',
  },
  backSpeakerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  listenButtonCorner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
