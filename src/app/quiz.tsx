import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { QuizQuestionCard } from '../components/quiz/QuizQuestion';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { getQuizForText } from '../lib/data/quizzes';
import { generateQuizFromText } from '../lib/quiz-generator';
import type { QuizQuestion } from '../lib/data/quizzes';
import { Spacing } from '../design/theme';

export default function QuizScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryKey?: string;
    textId?: string;
    customTextId?: string;
  }>();

  const { customTexts, updateComprehension } = useSettingsStore();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);

    if (params.customTextId) {
      // Custom text — use OpenAI
      const ct = customTexts.find((t) => t.id === params.customTextId);
      if (!ct) {
        setError('Text not found.');
        setLoading(false);
        return;
      }
      try {
        const generated = await generateQuizFromText(ct.text);
        setQuestions(generated);
      } catch {
        setError('Failed to generate quiz. Check your API key and try again.');
      }
    } else if (params.categoryKey && params.textId) {
      // Built-in text — use curated questions
      const curated = getQuizForText(params.categoryKey, params.textId);
      if (curated.length === 0) {
        setError('No quiz available for this text.');
      } else {
        setQuestions(curated);
      }
    } else {
      setError('No quiz available.');
    }
    setLoading(false);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);

    if (currentQ >= questions.length - 1) {
      const finalScore = correct ? score + 1 : score;
      updateComprehension(finalScore, questions.length);
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondary }]}>
            Generating quiz...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.centered}>
          <Feather name="alert-circle" size={48} color={colors.muted} />
          <Text style={[styles.errorText, { color: colors.primary }]}>
            {error}
          </Text>
          <GlassButton title="Go Back" onPress={handleClose} />
        </SafeAreaView>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.centered}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.resultContent}>
            <View
              style={[
                styles.scoreCircle,
                {
                  backgroundColor: glass.fill,
                  borderColor: glass.border,
                },
              ]}
            >
              <Text style={[styles.scoreText, { color: colors.primary }]}>
                {pct}%
              </Text>
            </View>
            <Text style={[styles.resultTitle, { color: colors.primary }]}>
              {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job!' : 'Keep reading!'}
            </Text>
            <Text style={[styles.resultSubtitle, { color: colors.secondary }]}>
              You got {score} of {questions.length} correct
            </Text>
          </Animated.View>
          <View style={styles.ctaContainer}>
            <GlassButton title="Done" onPress={handleClose} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <Feather name="x" size={20} color={colors.primary} />
          </Pressable>
          <View style={styles.flex} />
          <View style={styles.headerButton} />
        </View>

        <QuizQuestionCard
          question={questions[currentQ]}
          questionNumber={currentQ + 1}
          totalQuestions={questions.length}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 16,
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
  loadingText: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 12,
    paddingHorizontal: 24,
  },
  resultContent: {
    alignItems: 'center',
    gap: 12,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  resultSubtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    width: '100%',
  },
});
