import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import type { QuizQuestion as QuizQuestionType } from '../../lib/data/quizzes';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
}

export function QuizQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuizQuestionProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleSelect = (index: number) => {
    if (answered) return;

    setSelectedIndex(index);
    setAnswered(true);

    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    // Auto-advance after a short delay
    setTimeout(() => onAnswer(isCorrect), 800);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      <Text style={[styles.questionNumber, { color: colors.muted }]}>
        Question {questionNumber} of {totalQuestions}
      </Text>
      <Animated.View style={shakeStyle}>
        <Text style={[styles.questionText, { color: colors.primary }]}>
          {question.question}
        </Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === question.correctIndex;
          const showCorrect = answered && isCorrectOption;
          const showIncorrect = answered && isSelected && !isCorrectOption;

          let optionBg = glass.fill;
          let optionBorder = glass.border;

          if (showCorrect) {
            optionBg = isDark ? 'rgba(40,167,69,0.2)' : 'rgba(40,167,69,0.1)';
            optionBorder = colors.success;
          } else if (showIncorrect) {
            optionBg = isDark ? 'rgba(220,53,69,0.2)' : 'rgba(220,53,69,0.1)';
            optionBorder = colors.error;
          }

          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(index)}
              disabled={answered}
              style={[
                styles.option,
                {
                  backgroundColor: optionBg,
                  borderColor: optionBorder,
                  borderWidth: showCorrect || showIncorrect ? 1.5 : 0.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: showCorrect
                      ? colors.success
                      : showIncorrect
                        ? colors.error
                        : colors.primary,
                  },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  questionNumber: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  optionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
