import React, { useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as ContextMenu from 'zeego/context-menu';
import { Feather } from '@expo/vector-icons';
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
    hasOnboarded,
  } = useSettingsStore();

  const category = categories.find((c) => c.key === params.categoryKey);
  const words = category?.words ?? [];
  const totalWords = words.length;

  const startIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const startTimeRef = useRef(Date.now());
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentWord = words[currentIndex] ?? '';
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
        wordIndex: currentIndex,
        totalWords,
        startTime: startTimeRef.current,
      });
    }
  }, [currentIndex, totalWords, params.categoryKey, setResumeData]);

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

    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, totalWords, hapticFeedback, setResumeData, router, params.categoryKey]);

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

  const handleSpeak = () => {
    const rate = ttsSpeed === 'slow' ? 0.4 : ttsSpeed === 'fast' ? 0.7 : 0.5;
    Speech.speak(currentWord, { rate });
  };

  const handleCopyWord = async () => {
    await Clipboard.setStringAsync(currentWord);
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

          <Pressable onPress={() => router.push('/settings')} style={styles.headerButton}>
            <Feather name="settings" size={20} color={colors.primary} />
          </Pressable>
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
            <ContextMenu.Root>
              <ContextMenu.Trigger>
                <WordDisplay word={currentWord} wordKey={currentIndex} />
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item key="speak" onSelect={handleSpeak}>
                  <ContextMenu.ItemTitle>Speak Word</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon ios={{ name: 'speaker.wave.2' }} />
                </ContextMenu.Item>
                <ContextMenu.Item key="copy" onSelect={handleCopyWord}>
                  <ContextMenu.ItemTitle>Copy Word</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon ios={{ name: 'doc.on.doc' }} />
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
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
  closeIcon: {
    fontSize: 18,
    fontWeight: '300',
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
});
