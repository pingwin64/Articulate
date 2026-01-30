import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { GlassCard } from '../GlassCard';
import { GlassButton } from '../GlassButton';
import { NumberRoll } from '../NumberRoll';
import { Spacing } from '../../design/theme';

const ASSESSMENT_TEXT = [
  'The', 'human', 'brain', 'processes', 'language', 'in', 'remarkable', 'ways.',
  'When', 'you', 'read', 'a', 'single', 'word', 'at', 'a', 'time,',
  'your', 'mind', 'focuses', 'entirely', 'on', 'its', 'meaning.',
  'This', 'technique', 'reduces', 'subvocalization', 'and', 'eliminates',
  'the', 'need', 'for', 'eye', 'movement', 'across', 'a', 'page.',
  'Research', 'shows', 'that', 'focused', 'reading', 'can', 'improve',
  'both', 'speed', 'and', 'comprehension.', 'With', 'daily', 'practice,',
  'most', 'readers', 'see', 'improvement', 'within', 'just', 'one', 'week.',
  'The', 'key', 'is', 'consistency.', 'Even', 'five', 'minutes', 'a', 'day',
  'builds', 'stronger', 'neural', 'pathways', 'for', 'reading.',
  'Your', 'journey', 'to', 'faster,', 'deeper', 'reading', 'starts', 'now.',
];

function getWPMLabel(wpm: number): string {
  if (wpm < 150) return 'Building Up';
  if (wpm < 250) return 'Average';
  if (wpm < 350) return 'Above Average';
  return 'Speed Reader';
}

export function Assessment({ onNext }: { onNext: () => void }) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const setBaselineWPM = useSettingsStore((s) => s.setBaselineWPM);

  const [phase, setPhase] = useState<'intro' | 'reading' | 'result'>('intro');
  const [wordIndex, setWordIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const startTimeRef = useRef(0);

  const wordOpacity = useSharedValue(0);
  const wordScale = useSharedValue(0.85);
  const resultScale = useSharedValue(0);
  const resultOpacity = useSharedValue(0);

  const currentWord = ASSESSMENT_TEXT[wordIndex] ?? '';
  const progress = ASSESSMENT_TEXT.length > 0 ? wordIndex / ASSESSMENT_TEXT.length : 0;

  const wordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
    opacity: wordOpacity.value,
  }));

  const resultAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
    opacity: resultOpacity.value,
  }));

  const handleStart = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setPhase('reading');
    startTimeRef.current = Date.now();
    setWordIndex(0);
    wordOpacity.value = withTiming(1, { duration: 200 });
    wordScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [hapticEnabled, wordOpacity, wordScale]);

  const handleTap = useCallback(() => {
    if (phase !== 'reading') return;

    const nextIndex = wordIndex + 1;

    if (nextIndex >= ASSESSMENT_TEXT.length) {
      // Calculate WPM
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedMin = elapsedMs / 60000;
      const calculatedWPM = Math.round(ASSESSMENT_TEXT.length / elapsedMin);

      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setWpm(calculatedWPM);
      setBaselineWPM(calculatedWPM);
      setPhase('result');

      // Animate result
      resultScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.1, { damping: 12, stiffness: 180 }),
          withSpring(1, { damping: 15, stiffness: 150 })
        )
      );
      resultOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
      return;
    }

    if (hapticEnabled) {
      Haptics.selectionAsync();
    }

    setWordIndex(nextIndex);
    wordOpacity.value = 0;
    wordOpacity.value = withTiming(1, { duration: 150 });
    wordScale.value = 0.85;
    wordScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [phase, wordIndex, hapticEnabled, setBaselineWPM, wordOpacity, wordScale, resultScale, resultOpacity]);

  if (phase === 'intro') {
    return (
      <View style={styles.page}>
        <View style={styles.center}>
          <Animated.Text
            entering={FadeIn.duration(400)}
            style={[styles.title, { color: colors.primary }]}
          >
            Let's find your speed.
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(200).duration(400)}
            style={[styles.subtitle, { color: colors.secondary }]}
          >
            Tap through this short passage at your natural reading pace. No rush.
          </Animated.Text>
        </View>
        <View style={styles.bottom}>
          <GlassButton title="Begin" onPress={handleStart} />
        </View>
      </View>
    );
  }

  if (phase === 'result') {
    const label = getWPMLabel(wpm);
    return (
      <View style={styles.page}>
        <View style={styles.center}>
          <Animated.View style={resultAnimStyle}>
            <View
              style={[
                styles.resultCircle,
                {
                  backgroundColor: glass.fill,
                  borderColor: glass.border,
                },
              ]}
            >
              <NumberRoll target={wpm} duration={1200} />
              <Text style={[styles.wpmUnit, { color: colors.muted }]}>WPM</Text>
            </View>
          </Animated.View>
          <Animated.Text
            entering={FadeIn.delay(800).duration(300)}
            style={[styles.resultLabel, { color: colors.secondary }]}
          >
            {label}
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(1000).duration(300)}
            style={[styles.resultHint, { color: colors.muted }]}
          >
            This is your baseline. We'll track your improvement from here.
          </Animated.Text>
        </View>
        <Animated.View entering={FadeIn.delay(1400).duration(300)} style={styles.bottom}>
          <GlassButton title="Continue" onPress={onNext} />
        </Animated.View>
      </View>
    );
  }

  // Reading phase
  return (
    <Pressable style={styles.page} onPress={handleTap}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.center}>
        <Animated.Text
          style={[styles.assessmentWord, { color: colors.primary }, wordStyle]}
        >
          {currentWord}
        </Animated.Text>
      </View>

      <View style={styles.counterRow}>
        <Text style={[styles.counter, { color: colors.muted }]}>
          {wordIndex + 1} / {ASSESSMENT_TEXT.length}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  bottom: {
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  assessmentWord: {
    fontSize: 40,
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(128,128,128,0.15)',
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  counterRow: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  counter: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  resultCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  wpmUnit: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 4,
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 8,
  },
  resultHint: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
});
