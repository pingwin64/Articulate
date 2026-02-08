import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Difficulty badge colors - consistent with text-select.tsx
const DIFFICULTY_COLORS = {
  beginner: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22C55E' },
  intermediate: { bg: 'rgba(234, 179, 8, 0.12)', text: '#EAB308' },
  advanced: { bg: 'rgba(168, 85, 247, 0.12)', text: '#A855F7' },
};
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import type { SavedWord } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { WordDisplay } from '../components/WordDisplay';
import { ArticulateProgress } from '../components/ArticulateProgress';
import { SentenceTrail } from '../components/SentenceTrail';
import { Paywall } from '../components/Paywall';
import { speakWord, stopSpeaking } from '../lib/tts';
import { fetchDefinition, type WordDefinition } from '../lib/definitions';
import {
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  cancelRecording,
  transcribeAudio,
  scoreWord,
  type PronunciationFeedback,
} from '../lib/pronunciation-service';

export default function ReadingScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey?: string;
    textId?: string;
    customTextId?: string;
    resumeIndex?: string;
    wordBankWords?: string;
  }>();

  const {
    sentenceRecap,
    hapticFeedback,
    autoPlay,
    autoPlayWPM,
    ttsSpeed,
    voiceGender,
    chunkSize,
    isPremium,
    setResumeData,
    hasOnboarded,
    customTexts,
    showPaywall,
    setPaywallContext,
    paywallContext,
  } = useSettingsStore();

  const savedWords = useSettingsStore((s) => s.savedWords);
  const addSavedWord = useSettingsStore((s) => s.addSavedWord);
  const removeSavedWord = useSettingsStore((s) => s.removeSavedWord);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Listen & Repeat mode
  const [listenRepeatActive, setListenRepeatActive] = useState(false);
  const [listenRepeatPhase, setListenRepeatPhase] = useState<'idle' | 'listening' | 'recording' | 'processing' | 'result'>('idle');
  const listenRepeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pronunciation state
  const [pronunciationState, setPronunciationState] = useState<'idle' | 'recording' | 'processing' | 'result'>('idle');
  const [pronunciationFeedback, setPronunciationFeedback] = useState<PronunciationFeedback | null>(null);
  const [pronunciationError, setPronunciationError] = useState<string | null>(null);
  const pronunciationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setHasUsedPronunciation = useSettingsStore((s) => s.setHasUsedPronunciation);

  // Pronunciation feedback animation
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);

  const feedbackAnimStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  const showFeedbackAnim = useCallback(() => {
    feedbackOpacity.value = withTiming(1, { duration: 200 });
    feedbackScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [feedbackOpacity, feedbackScale]);

  const hideFeedbackAnim = useCallback(() => {
    feedbackOpacity.value = withTiming(0, { duration: 200 });
    feedbackScale.value = withTiming(0.8, { duration: 200 });
  }, [feedbackOpacity, feedbackScale]);

  // Definition state
  const [showDefinition, setShowDefinition] = useState(false);
  const [definitionData, setDefinitionData] = useState<WordDefinition | null>(null);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [definitionError, setDefinitionError] = useState<string | null>(null);
  const definitionCache = useRef<Record<string, WordDefinition>>({});

  // Definition card animation
  const cardScale = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const openDefinitionCard = useCallback(() => {
    setShowDefinition(true);
    backdropOpacity.value = withTiming(1, { duration: 200 });
    cardScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    cardOpacity.value = withTiming(1, { duration: 150 });
  }, [backdropOpacity, cardScale, cardOpacity]);

  const closeDefinitionCard = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 150 });
    cardScale.value = withSpring(0.8, { damping: 20, stiffness: 300 });
    cardOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setShowDefinition)(false);
    });
  }, [backdropOpacity, cardScale, cardOpacity]);

  // Word bank reading mode
  const wordBankWords = params.wordBankWords
    ? JSON.parse(params.wordBankWords) as string[]
    : null;

  const customText = params.customTextId
    ? customTexts.find((t) => t.id === params.customTextId)
    : undefined;
  const category = params.categoryKey
    ? categories.find((c) => c.key === params.categoryKey)
    : undefined;
  const text = params.textId
    ? category?.texts.find((t) => t.id === params.textId)
    : category?.texts[0];
  const words = wordBankWords
    ? wordBankWords
    : customText
      ? customText.text.trim().split(/\s+/).filter(Boolean)
      : text?.words ?? [];
  const totalWords = words.length;

  const startIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const startTimeRef = useRef(Date.now());
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingRef = useRef(false); // Guard against multiple navigation calls

  const currentWord = words.slice(currentIndex, currentIndex + chunkSize).join(' ');
  const progress = totalWords > 0 ? currentIndex / totalWords : 0;

  // Memoize completed words array to prevent SentenceTrail re-renders
  const completedWords = useMemo(
    () => words.slice(0, currentIndex),
    [words, currentIndex]
  );

  // Derived state: showHint from currentIndex (show for first 3 taps)
  const showHint = currentIndex < 3;

  // Save resume state
  useEffect(() => {
    if (wordBankWords) return; // Don't save resume for word bank reading
    if (currentIndex > 0 && currentIndex < totalWords) {
      setResumeData({
        categoryKey: params.categoryKey ?? '',
        textId: params.textId,
        customTextId: params.customTextId,
        wordIndex: currentIndex,
        totalWords,
        startTime: startTimeRef.current,
      });
    }
  }, [currentIndex, totalWords, params.categoryKey, params.textId, params.customTextId, setResumeData, wordBankWords]);

  const advanceWord = useCallback(() => {
    // Guard against multiple navigation calls
    if (isNavigatingRef.current) return;

    if (currentIndex + chunkSize >= totalWords) {
      // Set guard immediately
      isNavigatingRef.current = true;

      setResumeData(null);
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

      router.replace({
        pathname: '/complete',
        params: {
          categoryKey: params.categoryKey ?? '',
          textId: params.textId ?? '',
          customTextId: params.customTextId ?? '',
          wordsRead: String(totalWords),
          timeSpent: String(elapsed),
        },
      });
      return;
    }

    if (hapticFeedback) {
      Haptics.selectionAsync();
    }

    setCurrentIndex((prev) => Math.min(prev + chunkSize, totalWords - 1));
  }, [currentIndex, totalWords, chunkSize, hapticFeedback, setResumeData, router, params.categoryKey, params.textId, params.customTextId]);

  // Auto-play (only enable after user has completed onboarding)
  useEffect(() => {
    if (autoPlay && hasOnboarded && currentIndex < totalWords) {
      const interval = 60000 / autoPlayWPM;
      autoPlayTimerRef.current = setTimeout(() => {
        advanceWord();
      }, interval);
      return () => {
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      };
    }
  }, [autoPlay, hasOnboarded, currentIndex, autoPlayWPM, totalWords, advanceWord]);

  // TTS: speak current word when enabled
  useEffect(() => {
    if (ttsEnabled && currentWord) {
      speakWord(currentWord, ttsSpeed, voiceGender);
    }
  }, [ttsEnabled, currentIndex, currentWord, ttsSpeed, voiceGender]);

  // TTS: cleanup on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Listen & Repeat: auto-trigger flow on word change
  useEffect(() => {
    if (!listenRepeatActive || !currentWord) return;

    const rawWord = words[currentIndex]?.replace(/[^\w'-]/g, '') ?? '';
    // Skip short words in Listen & Repeat
    if (rawWord.length < 3) {
      setListenRepeatPhase('idle');
      return;
    }

    // Phase 1: TTS speaks the word
    setListenRepeatPhase('listening');
    speakWord(currentWord, ttsSpeed, voiceGender);

    // Phase 2: After TTS + delay, auto-start recording
    listenRepeatTimerRef.current = setTimeout(async () => {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        setListenRepeatPhase('idle');
        return;
      }

      try {
        await startRecording();
        setListenRepeatPhase('recording');
        setPronunciationError(null);
        setPronunciationFeedback(null);

        // Auto-stop after 3 seconds
        recordingTimerRef.current = setTimeout(() => {
          handleStopRecording();
          setListenRepeatPhase('result');
        }, 3000);
      } catch {
        setListenRepeatPhase('idle');
      }
    }, 1500); // 1.5s delay after TTS starts

    return () => {
      if (listenRepeatTimerRef.current) clearTimeout(listenRepeatTimerRef.current);
    };
  }, [listenRepeatActive, currentIndex]);

  const handleListenRepeatToggle = useCallback(() => {
    if (listenRepeatActive) {
      // Turn off
      setListenRepeatActive(false);
      setListenRepeatPhase('idle');
      cancelRecording();
      stopSpeaking();
      if (listenRepeatTimerRef.current) clearTimeout(listenRepeatTimerRef.current);
      return;
    }

    // Check free/premium access
    if (!isPremium) {
      const store = useSettingsStore.getState();
      if (!store.canUseFreeListenRepeat()) {
        setPaywallContext('locked_pronunciation');
        return;
      }
      store.useFreeListenRepeat();
    }

    // Enable TTS if not already
    if (!ttsEnabled) {
      setTtsEnabled(true);
      setHasUsedTTS(true);
    }
    setListenRepeatActive(true);

    // Track session
    useSettingsStore.getState().incrementListenRepeatSessions();
    useSettingsStore.getState().incrementWeeklyChallengeProgress('listen_repeat', 1);
  }, [listenRepeatActive, isPremium, ttsEnabled, setPaywallContext]);

  const setHasUsedTTS = useSettingsStore((s) => s.setHasUsedTTS);

  const handleTtsToggle = () => {
    if (!isPremium) {
      setPaywallContext('locked_tts');
      return;
    }
    if (ttsEnabled) {
      stopSpeaking();
    } else {
      // Track that user has used TTS for badge
      setHasUsedTTS(true);
    }
    setTtsEnabled(!ttsEnabled);
  };

  // Get single current word (not chunk) for saving
  const singleWord = words[currentIndex]?.replace(/[^\w'-]/g, '').toLowerCase() ?? '';
  const isWordSaved = singleWord ? savedWords.some((w) => w.word === singleWord) : false;

  const handleToggleSaveWord = () => {
    if (!singleWord) return;
    if (!isPremium) {
      setPaywallContext('locked_word_bank');
      return;
    }
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isWordSaved) {
      const saved = savedWords.find((w) => w.word === singleWord);
      if (saved) removeSavedWord(saved.id);
    } else {
      // Try context-aware cache first, then fall back to word-only cache
      const cacheKey = `${singleWord}:${currentIndex}`;
      const cached = definitionCache.current[cacheKey] || definitionCache.current[singleWord];
      const newWord: SavedWord = {
        id: `${singleWord}-${Date.now()}`,
        word: singleWord,
        syllables: cached?.syllables,
        partOfSpeech: cached?.partOfSpeech,
        definition: cached?.definition,
        savedAt: new Date().toISOString(),
        sourceText: text?.title ?? customText?.title,
        sourceCategory: category?.name,
      };
      addSavedWord(newWord);
    }
  };

  // ─── Definition Popup ──────────────────────────────────────
  // Get surrounding words for context (5 words before and after)
  const getContextSentence = useCallback(() => {
    const start = Math.max(0, currentIndex - 5);
    const end = Math.min(words.length, currentIndex + 6);
    return words.slice(start, end).join(' ');
  }, [words, currentIndex]);

  const handleDefinitionTap = async () => {
    if (!isPremium) {
      setPaywallContext('locked_definition');
      return;
    }
    if (!singleWord) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Get context for this specific position
    const context = getContextSentence();
    const cacheKey = `${singleWord}:${currentIndex}`;

    // Check cache first (includes position for context-aware caching)
    if (definitionCache.current[cacheKey]) {
      setDefinitionData(definitionCache.current[cacheKey]);
      setDefinitionError(null);
      openDefinitionCard();
      return;
    }

    setDefinitionData(null);
    setDefinitionError(null);
    setDefinitionLoading(true);
    openDefinitionCard();

    try {
      const data = await fetchDefinition(singleWord, context);
      definitionCache.current[cacheKey] = data;
      setDefinitionData(data);
    } catch (err: unknown) {
      setDefinitionError(err instanceof Error ? err.message : 'Failed to fetch definition');
    } finally {
      setDefinitionLoading(false);
    }
  };

  const handleRetryDefinition = async () => {
    if (!singleWord) return;
    const context = getContextSentence();
    const cacheKey = `${singleWord}:${currentIndex}`;

    setDefinitionError(null);
    setDefinitionLoading(true);
    try {
      const data = await fetchDefinition(singleWord, context);
      definitionCache.current[cacheKey] = data;
      setDefinitionData(data);
    } catch (err: unknown) {
      setDefinitionError(err instanceof Error ? err.message : 'Failed to fetch definition');
    } finally {
      setDefinitionLoading(false);
    }
  };

  const handleSaveFromDefinition = () => {
    if (!singleWord || !definitionData) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isWordSaved) {
      const saved = savedWords.find((w) => w.word === singleWord);
      if (saved) removeSavedWord(saved.id);
    } else {
      const newWord: SavedWord = {
        id: `${singleWord}-${Date.now()}`,
        word: singleWord,
        syllables: definitionData.syllables,
        partOfSpeech: definitionData.partOfSpeech,
        definition: definitionData.definition,
        savedAt: new Date().toISOString(),
        sourceText: text?.title ?? customText?.title,
        sourceCategory: category?.name,
      };
      addSavedWord(newWord);
    }
  };

  // ─── Pronunciation ──────────────────────────────────────────
  const dismissPronunciationFeedback = useCallback(() => {
    hideFeedbackAnim();
    if (pronunciationTimerRef.current) clearTimeout(pronunciationTimerRef.current);
    setTimeout(() => {
      setPronunciationState('idle');
      setPronunciationFeedback(null);
      setPronunciationError(null);
    }, 250);
  }, [hideFeedbackAnim]);

  const handleStopRecording = useCallback(async () => {
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    try {
      const base64 = await stopRecording();

      // Guard: too short
      if (base64.length < 1400) {
        setPronunciationError('Recording too short. Try holding a bit longer.');
        setPronunciationState('result');
        showFeedbackAnim();
        pronunciationTimerRef.current = setTimeout(dismissPronunciationFeedback, 3000);
        return;
      }

      setPronunciationState('processing');

      const transcribed = await transcribeAudio(base64);

      if (!transcribed) {
        setPronunciationError('Could not hear anything. Try again.');
        setPronunciationState('result');
        showFeedbackAnim();
        pronunciationTimerRef.current = setTimeout(dismissPronunciationFeedback, 3000);
        return;
      }

      const feedback = scoreWord(transcribed, singleWord);
      setPronunciationFeedback(feedback);
      setPronunciationState('result');
      showFeedbackAnim();

      // Track attempt + per-word history
      const store = useSettingsStore.getState();
      store.totalPronunciationAttempts = (store.totalPronunciationAttempts || 0) + 1;
      const history = { ...store.pronunciationHistory };
      const wordKey = singleWord.toLowerCase();
      if (!history[wordKey]) {
        history[wordKey] = { attempts: 0, perfects: 0 };
      }
      history[wordKey].attempts += 1;

      // Haptics + track perfect pronunciations
      if (feedback.result === 'perfect') {
        if (hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        history[wordKey].perfects += 1;
        // +5 level progress per perfect, tracked for badges
        store.incrementPerfectPronunciations();
        // Weekly challenge progress
        store.incrementWeeklyChallengeProgress('pronunciation_perfect', 1);
      } else if (feedback.result === 'close') {
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
      // Persist pronunciation history
      useSettingsStore.setState({ pronunciationHistory: history, totalPronunciationAttempts: store.totalPronunciationAttempts });

      pronunciationTimerRef.current = setTimeout(dismissPronunciationFeedback, 2500);
    } catch (err: any) {
      setPronunciationError(err.message ?? 'Something went wrong.');
      setPronunciationState('result');
      showFeedbackAnim();
      pronunciationTimerRef.current = setTimeout(dismissPronunciationFeedback, 3000);
    }
  }, [singleWord, hapticFeedback, showFeedbackAnim, dismissPronunciationFeedback]);

  const handlePronunciationTap = useCallback(async () => {
    // Free user: allow 3/day, then show paywall
    if (!isPremium) {
      const { canUseFreePronunciation, useFreePronunciation } = useSettingsStore.getState();
      if (!canUseFreePronunciation()) {
        setPaywallContext('locked_pronunciation');
        return;
      }
      // Will count the use after successful recording start
    }

    // If already recording, stop
    if (pronunciationState === 'recording') {
      handleStopRecording();
      return;
    }

    // If showing result, dismiss and return
    if (pronunciationState === 'result') {
      dismissPronunciationFeedback();
      return;
    }

    // Skip pronunciation for very short words (Whisper unreliable on "a", "it", "the")
    const rawWord = words[currentIndex]?.replace(/[^\w'-]/g, '') ?? '';
    if (rawWord.length < 3) {
      setPronunciationError('Too short to score');
      setPronunciationState('result');
      showFeedbackAnim();
      pronunciationTimerRef.current = setTimeout(dismissPronunciationFeedback, 2000);
      return;
    }

    // Request mic permission
    const granted = await requestMicrophonePermission();
    if (!granted) {
      setPronunciationError('Microphone permission denied.');
      setPronunciationState('result');
      showFeedbackAnim();
      pronunciationTimerRef.current = setTimeout(dismissPronunciationFeedback, 3000);
      return;
    }

    // Stop TTS if active
    if (ttsEnabled) {
      stopSpeaking();
    }

    // Pause auto-play
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }

    // Start recording
    try {
      await startRecording();
      setHasUsedPronunciation(true);
      // Count free pronunciation use
      if (!isPremium) {
        useSettingsStore.getState().useFreePronunciation();
      }
      setPronunciationState('recording');
      setPronunciationError(null);
      setPronunciationFeedback(null);

      // Auto-stop after 4 seconds
      recordingTimerRef.current = setTimeout(() => {
        handleStopRecording();
      }, 4000);
    } catch (err: any) {
      setPronunciationError(err.message ?? 'Could not start recording.');
      setPronunciationState('result');
      showFeedbackAnim();
      pronunciationTimerRef.current = setTimeout(dismissPronunciationFeedback, 3000);
    }
  }, [isPremium, pronunciationState, ttsEnabled, setPaywallContext, handleStopRecording, dismissPronunciationFeedback, showFeedbackAnim, setHasUsedPronunciation]);

  // Cancel recording + dismiss feedback on word change
  useEffect(() => {
    if (pronunciationState === 'recording') {
      cancelRecording();
    }
    if (pronunciationTimerRef.current) clearTimeout(pronunciationTimerRef.current);
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    setPronunciationState('idle');
    setPronunciationFeedback(null);
    setPronunciationError(null);
    feedbackOpacity.value = 0;
    feedbackScale.value = 0.8;
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRecording();
      if (pronunciationTimerRef.current) clearTimeout(pronunciationTimerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    if (listenRepeatTimerRef.current) clearTimeout(listenRepeatTimerRef.current);
    setListenRepeatActive(false);
    cancelRecording();
    stopSpeaking();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (totalWords === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.headerButton}>
              <Feather name="x" size={20} color={colors.primary} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <View style={styles.headerButton} />
          </View>
          <View style={styles.emptyState}>
            <Feather name="alert-circle" size={48} color={colors.muted} />
            <Text style={[styles.emptyStateTitle, { color: colors.primary }]}>
              No text found
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.muted }]}>
              The text may have been removed or is unavailable.
            </Text>
            <Pressable onPress={handleClose} style={[styles.emptyStateButton, { borderColor: colors.muted }]}>
              <Text style={[styles.emptyStateButtonText, { color: colors.primary }]}>Close</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          {/* Simplified header: Close + Progress */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.headerButton} accessibilityLabel="Close reading" accessibilityRole="button">
              <Feather name="x" size={20} color={colors.primary} />
            </Pressable>

            <ArticulateProgress progress={progress} />

            {/* Empty spacer for layout balance */}
            <View style={styles.headerButton} />
          </View>

          {/* Word counter */}
          <View style={styles.counterRow}>
            <View style={styles.counterInner}>
              <Text style={[styles.counter, { color: colors.muted }]}>
                {Math.min(currentIndex + chunkSize, totalWords)} / {totalWords}
              </Text>
            </View>
            {(() => {
              const remaining = totalWords - currentIndex;
              const show = remaining === 15 || (remaining <= 3 && remaining >= 1);
              if (!show) return null;
              return (
                <Text style={[styles.goalGradient, { color: colors.success ?? colors.primary }]}>
                  {remaining} {remaining === 1 ? 'word' : 'words'} to go
                </Text>
              );
            })()}
          </View>

          {/* Main tap area */}
          <Pressable
            style={styles.tapArea}
            onPress={advanceWord}
            accessibilityLabel={`Current word: ${currentWord}. Tap to advance to next word. ${currentIndex + 1} of ${totalWords}.`}
            accessibilityRole="button"
          >
            <View style={styles.wordContainer}>
              <WordDisplay word={currentWord} wordKey={currentIndex} />
            </View>

            {/* Below-word content: absolutely positioned to prevent layout shift */}
            <View style={styles.belowWord} pointerEvents="box-none">
              {/* Listen & Repeat phase */}
              {listenRepeatActive && listenRepeatPhase === 'listening' && pronunciationState === 'idle' && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.pronunciationRow}>
                  <Feather name="volume-2" size={16} color={colors.primary} />
                  <Text style={[styles.pronunciationText, { color: colors.primary }]}>Listen...</Text>
                </Animated.View>
              )}
              {/* Pronunciation feedback */}
              {pronunciationState === 'recording' && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.pronunciationRow}>
                  <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.pronunciationText, { color: colors.error }]}>Listening...</Text>
                </Animated.View>
              )}
              {pronunciationState === 'processing' && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.pronunciationRow}>
                  <ActivityIndicator size="small" color={colors.muted} />
                  <Text style={[styles.pronunciationText, { color: colors.muted }]}>Checking...</Text>
                </Animated.View>
              )}
              {pronunciationState === 'result' && pronunciationError && (
                <Animated.View style={[styles.pronunciationRow, feedbackAnimStyle]}>
                  <Text style={[styles.pronunciationText, { color: colors.secondary }]}>{pronunciationError}</Text>
                </Animated.View>
              )}
              {pronunciationState === 'result' && pronunciationFeedback && (
                <Animated.View style={[styles.pronunciationResult, feedbackAnimStyle]}>
                  <Text style={[
                    styles.pronunciationResultText,
                    {
                      color: pronunciationFeedback.result === 'perfect'
                        ? (colors.success ?? '#22C55E')
                        : pronunciationFeedback.result === 'close'
                          ? '#EAB308'
                          : colors.secondary,
                    },
                  ]}>
                    {pronunciationFeedback.result === 'perfect' ? 'Perfect!' : pronunciationFeedback.result === 'close' ? 'Close!' : 'Try again'}
                  </Text>
                  {pronunciationFeedback.result !== 'perfect' && (
                    <Text style={[styles.pronunciationHeard, { color: colors.muted }]}>
                      Heard: "{pronunciationFeedback.transcribed}"
                    </Text>
                  )}
                </Animated.View>
              )}
              {pronunciationState === 'idle' && (
                <>
                  <SentenceTrail words={completedWords} visible={hasOnboarded && sentenceRecap} />
                  {showHint && (
                    <Animated.Text
                      entering={FadeIn.duration(300)}
                      exiting={FadeOut.duration(300)}
                      style={[styles.hint, { color: colors.muted }]}
                    >
                      Tap to continue
                    </Animated.Text>
                  )}
                </>
              )}
            </View>
          </Pressable>
        </SafeAreaView>

        {/* Definition Card Popup */}
        {showDefinition && (
          <View style={styles.definitionOverlay}>
            {/* Animated backdrop */}
            <Animated.View style={[styles.definitionBackdrop, backdropAnimStyle]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeDefinitionCard} />
            </Animated.View>

            {/* Animated card */}
            <Animated.View
              style={[
                styles.definitionCard,
                cardAnimStyle,
                {
                  backgroundColor: isDark ? 'rgba(28,28,30,0.98)' : 'rgba(255,255,255,0.98)',
                  borderColor: glass.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.4 : 0.15,
                  shadowRadius: 24,
                },
              ]}
            >
              {/* Close button */}
              <Pressable onPress={closeDefinitionCard} style={styles.definitionClose} hitSlop={12}>
                <Feather name="x" size={18} color={colors.muted} />
              </Pressable>

              {/* Loading state */}
              {definitionLoading && (
                <View style={styles.definitionCenter}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.definitionLoadingText, { color: colors.muted }]}>
                    Looking up "{singleWord}"...
                  </Text>
                </View>
              )}

              {/* Error state */}
              {definitionError && !definitionLoading && (
                <View style={styles.definitionCenter}>
                  <Feather name="alert-circle" size={32} color={colors.muted} />
                  <Text style={[styles.definitionErrorText, { color: colors.secondary }]}>
                    {definitionError}
                  </Text>
                  <Pressable
                    onPress={handleRetryDefinition}
                    style={[styles.retryButton, { backgroundColor: colors.primary + '15' }]}
                  >
                    <Text style={[styles.retryButtonText, { color: colors.primary }]}>Try Again</Text>
                  </Pressable>
                </View>
              )}

              {/* Definition content */}
              {definitionData && !definitionLoading && (
                <View style={styles.definitionContent}>
                  {/* Word header */}
                  <View style={styles.definitionHeader}>
                    <Text style={[styles.definitionWord, { color: colors.primary }]}>
                      {definitionData.word}
                    </Text>
                    <View style={[styles.posBadge, { backgroundColor: colors.primary + '12' }]}>
                      <Text style={[styles.posBadgeText, { color: colors.primary }]}>
                        {definitionData.partOfSpeech}
                      </Text>
                    </View>
                  </View>

                  {/* Syllables */}
                  <Text style={[styles.definitionSyllables, { color: colors.muted }]}>
                    {definitionData.syllables}
                  </Text>

                  {/* Divider */}
                  <View style={[styles.definitionDivider, { backgroundColor: glass.border }]} />

                  {/* Definition text */}
                  <Text style={[styles.definitionText, { color: colors.secondary }]}>
                    {definitionData.definition}
                  </Text>

                  {/* Save to word bank - minimal inline */}
                  <Pressable
                    onPress={handleSaveFromDefinition}
                    style={styles.definitionSaveRow}
                    hitSlop={12}
                  >
                    <Ionicons
                      name={isWordSaved ? 'heart' : 'heart-outline'}
                      size={16}
                      color={isWordSaved ? colors.error : colors.muted}
                    />
                    <Text
                      style={[
                        styles.definitionSaveText,
                        { color: isWordSaved ? colors.error : colors.muted },
                      ]}
                    >
                      {isWordSaved ? 'Saved' : 'Save to Word Bank'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </View>
        )}

        <Paywall
          visible={showPaywall}
          onDismiss={() => setPaywallContext(null)}
          context={paywallContext}
        />
      </View>

      {/* Native bottom toolbar: must be top-level sibling for Stack to render it */}
      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.Button
          icon={ttsEnabled ? 'speaker.wave.2.fill' : 'speaker.slash'}
          selected={ttsEnabled}
          onPress={handleTtsToggle}
        />
        <Stack.Toolbar.Button
          icon="questionmark.circle"
          onPress={handleDefinitionTap}
        />
        <Stack.Toolbar.Button
          icon={pronunciationState === 'recording' ? 'mic.fill' : 'mic'}
          tintColor={pronunciationState === 'recording' ? colors.error : undefined}
          onPress={handlePronunciationTap}
        />
        <Stack.Toolbar.Button
          icon={listenRepeatActive ? 'repeat.1' : 'repeat'}
          selected={listenRepeatActive}
          tintColor={listenRepeatActive ? colors.primary : undefined}
          onPress={handleListenRepeatToggle}
        />
        <Stack.Toolbar.Button
          icon={isWordSaved ? 'heart.fill' : 'heart'}
          tintColor={isWordSaved ? colors.error : colors.primary}
          onPress={handleToggleSaveWord}
        />
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button
          icon="person.circle"
          onPress={() => router.push('/settings')}
        />
      </Stack.Toolbar>
    </>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    width: 44, // Apple HIG minimum touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterRow: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  counterInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counter: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tapArea: {
    flex: 1,
    justifyContent: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  belowWord: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: 60,
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 16,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  goalGradient: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 8,
  },
  // Definition overlay
  definitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  definitionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  definitionCard: {
    width: '88%',
    maxWidth: 360,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    padding: 24,
    paddingTop: 28,
  },
  definitionClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 44, // Apple HIG minimum touch target
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  definitionCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  definitionLoadingText: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
  definitionContent: {
    gap: 4,
  },
  definitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  definitionWord: {
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
  definitionSyllables: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 1,
    marginBottom: 4,
  },
  definitionDivider: {
    height: 1,
    marginVertical: 16,
  },
  definitionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  definitionErrorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
    marginTop: 4,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  definitionSaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 4,
  },
  definitionSaveText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Pronunciation
  pronunciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pronunciationText: {
    fontSize: 15,
    fontWeight: '500',
  },
  pronunciationResult: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 4,
  },
  pronunciationResultText: {
    fontSize: 20,
    fontWeight: '700',
  },
  pronunciationHeard: {
    fontSize: 13,
    fontWeight: '400',
  },
});
