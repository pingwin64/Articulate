import React, { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Linking } from 'react-native';
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

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`;
  return `${s}s`;
}

export default function ReadingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey?: string;
    customTextId?: string;
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
    customTexts,
    lifetimeWordsRead,
  } = useSettingsStore();

  // Resolve words from either category or custom text
  const { words, title } = useMemo(() => {
    if (params.customTextId) {
      const customText = customTexts.find((ct) => ct.id === params.customTextId);
      if (customText) {
        return {
          words: customText.text.split(/\s+/).filter(Boolean),
          title: customText.title,
        };
      }
      return { words: [], title: 'My Text' };
    }
    const category = categories.find((c) => c.key === params.categoryKey);
    return {
      words: category?.words ?? [],
      title: category?.name ?? 'Reading',
    };
  }, [params.categoryKey, params.customTextId, customTexts]);

  const totalWords = words.length;

  const startIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const startTimeRef = useRef(Date.now());
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Elapsed time display
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentWord = words[currentIndex] ?? '';
  const progress = totalWords > 0 ? currentIndex / totalWords : 0;

  const completedWords = words.slice(0, currentIndex);
  const showHint = currentIndex < 3;

  // Track words read in this session for milestone detection
  const wordsReadThisSession = currentIndex - startIndex;
  const lifetimeAtStart = useRef(lifetimeWordsRead);

  // Save resume state
  useEffect(() => {
    if (currentIndex > 0 && currentIndex < totalWords) {
      setResumeData({
        categoryKey: params.categoryKey ?? '',
        customTextId: params.customTextId,
        wordIndex: currentIndex,
        totalWords,
        startTime: startTimeRef.current,
      });
    }
  }, [currentIndex, totalWords, params.categoryKey, params.customTextId, setResumeData]);

  // Milestone detection: every 100th lifetime word
  useEffect(() => {
    const currentLifetime = lifetimeAtStart.current + wordsReadThisSession;
    if (
      wordsReadThisSession > 0 &&
      currentLifetime > 0 &&
      currentLifetime % 100 === 0 &&
      hapticFeedback
    ) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [wordsReadThisSession, hapticFeedback]);

  const advanceWord = useCallback(() => {
    if (currentIndex >= totalWords - 1) {
      setResumeData(null);
      const elapsedSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      router.replace({
        pathname: '/complete',
        params: {
          categoryKey: params.categoryKey ?? '',
          customTextId: params.customTextId ?? '',
          wordsRead: String(totalWords),
          timeSpent: String(elapsedSec),
          title: title,
        },
      });
      return;
    }

    if (hapticFeedback) {
      Haptics.selectionAsync();
    }

    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, totalWords, hapticFeedback, setResumeData, router, params.categoryKey, params.customTextId, title]);

  const goBackWord = useCallback(() => {
    if (currentIndex <= 0) return;

    if (hapticFeedback) {
      Haptics.selectionAsync();
    }

    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex, hapticFeedback]);

  // Auto-play
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

  const handleDefineWord = () => {
    // Clean the word (remove punctuation for lookup)
    const cleanWord = currentWord.replace(/[^a-zA-Z'-]/g, '');
    if (cleanWord) {
      Linking.openURL(`https://en.wiktionary.org/wiki/${encodeURIComponent(cleanWord.toLowerCase())}`);
    }
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

        {/* Word counter and timer */}
        <View style={styles.counterRow}>
          <Text style={[styles.counter, { color: colors.muted }]}>
            {currentIndex + 1} / {totalWords}
          </Text>
          <Text style={[styles.timer, { color: colors.muted }]}>
            {formatElapsed(elapsed)}
          </Text>
        </View>

        {/* Main tap area with left/right zones */}
        <View style={styles.tapArea}>
          {/* Left zone: go back */}
          <Pressable style={styles.backZone} onPress={goBackWord}>
            {currentIndex > 0 && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.backIndicator}>
                <Feather name="chevron-left" size={20} color={colors.muted} />
              </Animated.View>
            )}
          </Pressable>

          {/* Center + right zone: advance */}
          <Pressable style={styles.forwardZone} onPress={advanceWord}>
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
                  <ContextMenu.Item key="define" onSelect={handleDefineWord}>
                    <ContextMenu.ItemTitle>Define</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon ios={{ name: 'text.book.closed' }} />
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
            </View>

            {/* Below-word content */}
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
        </View>
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 4,
    gap: 16,
  },
  counter: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  timer: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  tapArea: {
    flex: 1,
    flexDirection: 'row',
  },
  backZone: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIndicator: {
    opacity: 0.5,
  },
  forwardZone: {
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
