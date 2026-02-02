import React, { useEffect, useCallback, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { WordDisplay } from '../components/WordDisplay';
import { ArticulateProgress } from '../components/ArticulateProgress';
import { SentenceTrail } from '../components/SentenceTrail';
import { Paywall } from '../components/Paywall';
import { speakWord, stopSpeaking } from '../lib/tts';

export default function ReadingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey?: string;
    textId?: string;
    customTextId?: string;
    resumeIndex?: string;
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

  const [ttsEnabled, setTtsEnabled] = useState(false);

  const customText = params.customTextId
    ? customTexts.find((t) => t.id === params.customTextId)
    : undefined;
  const category = params.categoryKey
    ? categories.find((c) => c.key === params.categoryKey)
    : undefined;
  const text = params.textId
    ? category?.texts.find((t) => t.id === params.textId)
    : category?.texts[0];
  const words = customText
    ? customText.text.trim().split(/\s+/).filter(Boolean)
    : text?.words ?? [];
  const totalWords = words.length;

  const startIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const startTimeRef = useRef(Date.now());
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentWord = words.slice(currentIndex, currentIndex + chunkSize).join(' ');
  const progress = totalWords > 0 ? currentIndex / totalWords : 0;

  // Derived state: completedWords from currentIndex
  const completedWords = words.slice(0, currentIndex);

  // Derived state: showHint from currentIndex (show for first 3 taps)
  const showHint = currentIndex < 3;

  // Save resume state
  useEffect(() => {
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
  }, [currentIndex, totalWords, params.categoryKey, params.textId, params.customTextId, setResumeData]);

  const advanceWord = useCallback(() => {
    if (currentIndex + chunkSize >= totalWords) {
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
  }, [currentIndex, totalWords, chunkSize, hapticFeedback, setResumeData, router, params.categoryKey, params.customTextId]);

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

  const handleClose = () => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
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

            <View style={styles.headerButton} />
          </View>

          {/* Word counter */}
          <View style={styles.counterRow}>
            <Text style={[styles.counter, { color: colors.muted }]}>
              {Math.min(currentIndex + chunkSize, totalWords)} / {totalWords}
            </Text>
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
            <View style={styles.belowWord}>
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
            </View>
          </Pressable>
        </SafeAreaView>

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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterRow: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  counter: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
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
});
