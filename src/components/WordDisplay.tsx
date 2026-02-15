import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { FontFamilies, WordColors, WindDownColors, Springs } from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';

interface WordDisplayProps {
  word: string;
  wordKey: number;
}

function getFontFamily(fontKey: FontFamilyKey, bold: boolean): string {
  'worklet';
  const font = FontFamilies[fontKey];
  return bold ? font.bold : font.regular;
}

function getWordColor(colorKey: WordColorKey, primaryColor: string): string {
  'worklet';
  const entry = WordColors.find((c) => c.key === colorKey);
  return entry?.color ?? primaryColor;
}

export function WordDisplay({ word, wordKey }: WordDisplayProps) {
  const { colors, windDownMode } = useTheme();
  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const wordSize = useSettingsStore((s) => s.wordSize);
  const wordBold = useSettingsStore((s) => s.wordBold);
  const wordColor = useSettingsStore((s) => s.wordColor);
  const breathingAnimation = useSettingsStore((s) => s.breathingAnimation);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  // Check system reduce motion preference
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion).catch(() => {});
  }, []);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const breatheScale = useSharedValue(1);

  // Memoize color and font lookups to avoid per-frame recomputation
  const displayColor = useMemo(
    () => windDownMode ? WindDownColors.wordColor : getWordColor(wordColor, colors.primary),
    [wordColor, colors.primary, windDownMode]
  );

  const fontFam = useMemo(
    () => getFontFamily(fontFamily, wordBold),
    [fontFamily, wordBold]
  );

  // Respect both app setting and system accessibility preference
  // Wind-down forces breathing on regardless of user's setting
  const shouldAnimate = (breathingAnimation || windDownMode) && !reduceMotion && !systemReduceMotion;

  // Wind-down: deeper amplitude (1.012 vs 1.008) and slower rhythm (2000ms vs 1500ms half-cycle)
  const breatheAmplitude = windDownMode ? 1.012 : 1.008;
  const breatheHalfCycle = windDownMode ? 2000 : 1500;

  // Wind-down: slower entry spring for dreamy word appearance
  const entrySpring = useMemo(
    () => windDownMode ? { damping: 25, stiffness: 80 } : Springs.gentle,
    [windDownMode]
  );

  useEffect(() => {
    // Enter animation
    opacity.value = 0;
    scale.value = 0.85;
    breatheScale.value = 1;

    opacity.value = withDelay(
      50,
      withSpring(1, entrySpring)
    );
    scale.value = withDelay(
      50,
      withSpring(1, entrySpring)
    );

    // Start breathing after entry (only if enabled and motion not reduced)
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (shouldAnimate) {
      timer = setTimeout(() => {
        breatheScale.value = withRepeat(
          withSequence(
            withTiming(breatheAmplitude, {
              duration: breatheHalfCycle,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1.0, {
              duration: breatheHalfCycle,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        );
      }, 350);
    } else {
      // Reset breathing animation if disabled mid-cycle
      cancelAnimation(breatheScale);
      breatheScale.value = 1;
    }

    return () => {
      if (timer) clearTimeout(timer);
      // Cancel any running breathing animation on cleanup
      cancelAnimation(breatheScale);
      breatheScale.value = 1;
    };
  }, [wordKey, opacity, scale, breatheScale, shouldAnimate, breatheAmplitude, breatheHalfCycle, entrySpring]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * breatheScale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.Text
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        style={[
          styles.word,
          animatedStyle,
          {
            color: displayColor,
            fontSize: wordSize,
            fontFamily: fontFam === 'System' ? undefined : fontFam,
            fontWeight: wordBold ? '700' : '400',
          },
        ]}
      >
        {word}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  word: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
