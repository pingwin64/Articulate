import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface QuizProgressProps {
  total: number;
  current: number;
  answers: (boolean | null)[];
}

export function QuizProgress({ total, current, answers }: QuizProgressProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => {
        const answer = answers[i];
        const isCurrent = i === current;

        let dotColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
        if (answer === true) {
          dotColor = colors.success;
        } else if (answer === false) {
          dotColor = colors.error;
        } else if (isCurrent) {
          dotColor = colors.primary;
        }

        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: dotColor,
                width: isCurrent ? 24 : 8,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
