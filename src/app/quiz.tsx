import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { getQuizForCategory } from '../lib/data/quizzes';
import { QuizQuestionCard } from '../components/quiz/QuizQuestion';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { NumberRoll } from '../components/NumberRoll';
import { Spacing } from '../design/theme';

export default function QuizScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey: string;
    customTextId?: string;
    wordsRead: string;
    timeSpent: string;
    title?: string;
  }>();

  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const updateComprehension = useSettingsStore((s) => s.updateComprehension);

  const quiz = getQuizForCategory(params.categoryKey ?? '');
  const questions = quiz?.questions ?? [];
  const totalQuestions = questions.length;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    new Array(totalQuestions).fill(null)
  );
  const [finished, setFinished] = useState(false);

  const correctCount = answers.filter((a) => a === true).length;

  const handleAnswer = useCallback(
    (correct: boolean) => {
      const newAnswers = [...answers];
      newAnswers[currentQ] = correct;
      setAnswers(newAnswers);

      if (currentQ < totalQuestions - 1) {
        setCurrentQ((prev) => prev + 1);
      } else {
        // Quiz complete
        const score = newAnswers.filter((a) => a === true).length;
        updateComprehension(score, totalQuestions);
        setFinished(true);

        if (hapticEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    },
    [currentQ, totalQuestions, answers, hapticEnabled, updateComprehension]
  );

  const handleContinue = () => {
    router.replace({
      pathname: '/complete',
      params: {
        categoryKey: params.categoryKey ?? '',
        customTextId: params.customTextId ?? '',
        wordsRead: params.wordsRead,
        timeSpent: params.timeSpent,
        title: params.title ?? '',
        comprehensionScore: String(correctCount),
        comprehensionTotal: String(totalQuestions),
      },
    });
  };

  const handleSkip = () => {
    router.replace({
      pathname: '/complete',
      params: {
        categoryKey: params.categoryKey ?? '',
        customTextId: params.customTextId ?? '',
        wordsRead: params.wordsRead,
        timeSpent: params.timeSpent,
        title: params.title ?? '',
      },
    });
  };

  // Quiz finished state
  if (finished) {
    const pct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          <View style={styles.resultCenter}>
            <Animated.View entering={FadeIn.duration(400)}>
              <View
                style={[
                  styles.scoreCircle,
                  {
                    backgroundColor: glass.fill,
                    borderColor: pct >= 80 ? colors.success : pct >= 60 ? colors.warning : glass.border,
                  },
                ]}
              >
                <Text style={[styles.scoreText, { color: colors.primary }]}>
                  {correctCount}/{totalQuestions}
                </Text>
              </View>
            </Animated.View>
            <Animated.Text
              entering={FadeIn.delay(300).duration(300)}
              style={[styles.scoreLabel, { color: colors.secondary }]}
            >
              {pct >= 80
                ? 'Excellent comprehension!'
                : pct >= 60
                  ? 'Good understanding'
                  : 'Keep practicing!'}
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(500).duration(300)}
              style={[styles.scorePct, { color: colors.muted }]}
            >
              {pct}% correct
            </Animated.Text>
          </View>
          <Animated.View entering={FadeIn.delay(700).duration(300)} style={styles.ctaArea}>
            <GlassButton title="Continue" onPress={handleContinue} />
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // No quiz available
  if (totalQuestions === 0) {
    handleSkip();
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <QuizProgress total={totalQuestions} current={currentQ} answers={answers} />
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.muted }]}>Skip</Text>
          </Pressable>
        </View>

        {/* Question */}
        <QuizQuestionCard
          key={currentQ}
          question={questions[currentQ]}
          questionNumber={currentQ + 1}
          totalQuestions={totalQuestions}
          onAnswer={handleAnswer}
        />
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    width: 50,
  },
  skipButton: {
    width: 50,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '400',
  },
  resultCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  scorePct: {
    fontSize: 14,
  },
  ctaArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
