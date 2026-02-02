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
import { FontFamilies, WordColors, Springs } from '../design/theme';
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
  const { colors } = useTheme();
  const { fontFamily, wordSize, wordBold, wordColor, breathingAnimation, reduceMotion } = useSettingsStore();

  // Check system reduce motion preference
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion);
  }, []);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const breatheScale = useSharedValue(1);

  // Memoize color and font lookups to avoid per-frame recomputation
  const displayColor = useMemo(
    () => getWordColor(wordColor, colors.primary),
    [wordColor, colors.primary]
  );

  const fontFam = useMemo(
    () => getFontFamily(fontFamily, wordBold),
    [fontFamily, wordBold]
  );

  // Respect both app setting and system accessibility preference
  const shouldAnimate = breathingAnimation && !reduceMotion && !systemReduceMotion;

  useEffect(() => {
    // Enter animation
    opacity.value = 0;
    scale.value = 0.85;
    breatheScale.value = 1;

    opacity.value = withDelay(
      50,
      withSpring(1, Springs.gentle)
    );
    scale.value = withDelay(
      50,
      withSpring(1, Springs.gentle)
    );

    // Start breathing after entry (only if enabled and motion not reduced)
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (shouldAnimate) {
      timer = setTimeout(() => {
        breatheScale.value = withRepeat(
          withSequence(
            withTiming(1.008, {
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1.0, {
              duration: 1500,
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
  }, [wordKey, opacity, scale, breatheScale, shouldAnimate]);

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
