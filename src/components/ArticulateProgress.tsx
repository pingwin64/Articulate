import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';

const LETTERS = ['a', 'r', 't', 'i', 'c', 'u', 'l', 'a', 't', 'e'];
const TOTAL_LETTERS = LETTERS.length;

interface ArticulateProgressProps {
  progress: number; // 0 to 1
}

function ProgressLetter({
  letter,
  filled,
}: {
  letter: string;
  filled: boolean;
}) {
  const { colors } = useTheme();
  const colorProgress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    colorProgress.value = withSpring(filled ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [filled, colorProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + colorProgress.value * 0.7,
  }));

  return (
    <Animated.Text
      style={[
        styles.letter,
        animatedStyle,
        { color: colors.primary },
      ]}
    >
      {letter}
    </Animated.Text>
  );
}

export function ArticulateProgress({ progress }: ArticulateProgressProps) {
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  // Goal-gradient effect: letters fill faster in final stretch
  const adjustedProgress = Math.pow(progress, 0.85);
  const filledCount = Math.floor(adjustedProgress * TOTAL_LETTERS);

  // Haptic at milestones (every 2 letters)
  useEffect(() => {
    if (filledCount > 0 && filledCount % 2 === 0 && hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [filledCount, hapticEnabled]);

  return (
    <View style={styles.container}>
      {LETTERS.map((letter, index) => (
        <ProgressLetter
          key={`${letter}-${index}`}
          letter={letter}
          filled={index < filledCount}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 8,
  },
  letter: {
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
});
