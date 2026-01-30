import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { FontFamilies, WordColors } from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';

interface WordDisplayProps {
  word: string;
  wordKey: number;
}

function getFontFamily(fontKey: FontFamilyKey, bold: boolean): string {
  const font = FontFamilies[fontKey];
  return bold ? font.bold : font.regular;
}

function getWordColor(colorKey: WordColorKey, primaryColor: string): string {
  const entry = WordColors.find((c) => c.key === colorKey);
  return entry?.color ?? primaryColor;
}

export function WordDisplay({ word, wordKey }: WordDisplayProps) {
  const { colors } = useTheme();
  const { fontFamily, wordSize, wordBold, wordColor, breathingAnimation, reduceMotion } = useSettingsStore();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const breatheScale = useSharedValue(1);

  useEffect(() => {
    // Enter animation
    opacity.value = 0;
    scale.value = 0.85;
    breatheScale.value = 1;

    if (reduceMotion) {
      // Simple fade without spring for reduced motion
      opacity.value = withTiming(1, { duration: 100 });
      scale.value = 1;
    } else {
      opacity.value = withDelay(
        50,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      scale.value = withDelay(
        50,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
    }

    // Start breathing after entry (only if enabled and not reduce motion)
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (breathingAnimation && !reduceMotion) {
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
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [wordKey, opacity, scale, breatheScale, breathingAnimation, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * breatheScale.value },
    ],
  }));

  const displayColor = getWordColor(wordColor, colors.primary);
  const fontFam = getFontFamily(fontFamily, wordBold);

  // Allow 2 lines for multi-word chunks (2+ words)
  const isMultiWord = word.includes(' ');

  return (
    <View style={styles.container} accessible accessibilityRole="text">
      <Animated.Text
        numberOfLines={isMultiWord ? 2 : 1}
        adjustsFontSizeToFit={true}
        accessibilityLabel={word}
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
