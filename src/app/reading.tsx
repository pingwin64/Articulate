import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { WordDisplay } from '../components/WordDisplay';
import { ArticulateProgress } from '../components/ArticulateProgress';
import { SentenceTrail } from '../components/SentenceTrail';

export default function ReadingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey: string;
    resumeIndex?: string;
  }>();

  const {
    sentenceRecap,
    hapticFeedback,
    ttsSpeed,
    autoPlay,
    autoPlayWPM,
    setResumeData,
  } = useSettingsStore();

  const category = categories.find((c) => c.key === params.categoryKey);
  const words = category?.words ?? [];
  const totalWords = words.length;

  const startIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [completedWords, setCompletedWords] = useState<string[]>(
    words.slice(0, startIndex)
  );
  const [tapCount, setTapCount] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const startTimeRef = useRef(Date.now());
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentWord = words[currentIndex] ?? '';
  const progress = totalWords > 0 ? currentIndex / totalWords : 0;

  // Save resume state
  useEffect(() => {
    if (currentIndex > 0 && currentIndex < totalWords) {
      setResumeData({
        categoryKey: params.categoryKey ?? '',
        wordIndex: currentIndex,
        totalWords,
        startTime: startTimeRef.current,
      });
    }
  }, [currentIndex, totalWords, params.categoryKey, setResumeData]);

  // Hide tap hint after 3 taps
  useEffect(() => {
    if (tapCount >= 3) {
      setShowHint(false);
    }
  }, [tapCount]);

  const advanceWord = useCallback(() => {
    if (currentIndex >= totalWords - 1) {
      setResumeData(null);
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      router.replace({
        pathname: '/complete',
        params: {
          categoryKey: params.categoryKey ?? '',
          wordsRead: String(totalWords),
          timeSpent: String(elapsed),
        },
      });
      return;
    }

    if (hapticFeedback) {
      Haptics.selectionAsync();
    }

    setCompletedWords((prev) => [...prev, currentWord]);
    setCurrentIndex((prev) => prev + 1);
    setTapCount((prev) => prev + 1);
  }, [currentIndex, totalWords, currentWord, hapticFeedback, setResumeData, router, params.categoryKey]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && currentIndex < totalWords) {
      const interval = 60000 / autoPlayWPM;
      autoPlayTimerRef.current = setTimeout(() => {
        advanceWord();
      }, interval);
      return () => {
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      };
    }
  }, [autoPlay, currentIndex, autoPlayWPM, totalWords, advanceWord]);

  const handleSpeak = () => {
    const rate = ttsSpeed === 'slow' ? 0.4 : ttsSpeed === 'fast' ? 0.7 : 0.5;
    Speech.speak(currentWord, { rate });
  };

  const handleClose = () => {
    Speech.stop();
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <Text style={[styles.closeIcon, { color: colors.primary }]}>
              {'\u2715'}
            </Text>
          </Pressable>

          <ArticulateProgress progress={progress} />

          <View style={styles.headerRight}>
            <Pressable onPress={handleSpeak} style={styles.headerButton}>
              <Text style={[styles.speakerIcon, { color: colors.primary }]}>
                {'\u266A'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Word counter */}
        <View style={styles.counterRow}>
          <Text style={[styles.counter, { color: colors.muted }]}>
            {currentIndex + 1} / {totalWords}
          </Text>
        </View>

        {/* Main tap area */}
        <Pressable style={styles.tapArea} onPress={advanceWord}>
          <View style={styles.wordContainer}>
            <WordDisplay word={currentWord} wordKey={currentIndex} />
          </View>

          {/* Sentence trail */}
          <SentenceTrail words={completedWords} visible={sentenceRecap} />

          {/* Tap hint */}
          {showHint && (
            <Animated.Text
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={[styles.hint, { color: colors.muted }]}
            >
              Tap to continue
            </Animated.Text>
          )}
        </Pressable>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '300',
  },
  speakerIcon: {
    fontSize: 18,
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
    paddingHorizontal: 32,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 40,
    fontStyle: 'italic',
  },
});
