import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Paywall } from '../components/Paywall';
import { Spacing } from '../design/theme';

const FREE_WORD_LIMIT = 10;

export default function WordBankScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const savedWords = useSettingsStore((s) => s.savedWords);
  const removeSavedWord = useSettingsStore((s) => s.removeSavedWord);
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const isPremium = useSettingsStore((s) => s.isPremium);
  const showPaywall = useSettingsStore((s) => s.showPaywall);
  const setPaywallContext = useSettingsStore((s) => s.setPaywallContext);
  const paywallContext = useSettingsStore((s) => s.paywallContext);
  const incrementWordsReviewed = useSettingsStore((s) => s.incrementWordsReviewed);

  // Flashcard review mode
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  const handleRemoveWord = useCallback((id: string, word: string) => {
    Alert.alert('Remove Word', `Remove "${word}" from your word bank?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          removeSavedWord(id);
        },
      },
    ]);
  }, [removeSavedWord, hapticFeedback]);

  const handleReadMyWords = useCallback(() => {
    if (savedWords.length === 0) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const wordArray = savedWords.map((w) => w.word);
    router.push({
      pathname: '/reading',
      params: { wordBankWords: JSON.stringify(wordArray) },
    });
  }, [savedWords, hapticFeedback, router]);

  const handleStartReview = useCallback(() => {
    if (savedWords.length === 0) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setReviewIndex(0);
    setShowDefinition(false);
    setReviewMode(true);
  }, [savedWords, hapticFeedback]);

  const handleFlipCard = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDefinition(true);
    incrementWordsReviewed();
  }, [hapticFeedback, incrementWordsReviewed]);

  const handleNextCard = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (reviewIndex < savedWords.length - 1) {
      setReviewIndex((i) => i + 1);
      setShowDefinition(false);
    } else {
      setReviewMode(false);
    }
  }, [hapticFeedback, reviewIndex, savedWords.length]);

  // Free user limit check
  const isAtFreeLimit = !isPremium && savedWords.length >= FREE_WORD_LIMIT;

  // Flashcard review mode
  if (reviewMode && savedWords.length > 0) {
    const currentWord = savedWords[reviewIndex];
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.reviewContainer}>
          <Text style={[styles.reviewProgress, { color: colors.muted }]}>
            {reviewIndex + 1} / {savedWords.length}
          </Text>

          <Pressable onPress={showDefinition ? handleNextCard : handleFlipCard} style={styles.flashcard}>
            <GlassCard>
              <View style={styles.flashcardContent}>
                <Text style={[styles.flashcardWord, { color: colors.primary }]}>
                  {currentWord.word}
                </Text>
                {showDefinition ? (
                  <Animated.View entering={FadeIn.duration(200)} style={styles.flashcardAnswer}>
                    {currentWord.syllables && (
                      <Text style={[styles.flashcardMeta, { color: colors.muted }]}>
                        {currentWord.syllables}
                        {currentWord.partOfSpeech ? ` · ${currentWord.partOfSpeech}` : ''}
                      </Text>
                    )}
                    {currentWord.definition && (
                      <Text style={[styles.flashcardDefinition, { color: colors.secondary }]}>
                        {currentWord.definition}
                      </Text>
                    )}
                  </Animated.View>
                ) : (
                  <Text style={[styles.flashcardHint, { color: colors.muted }]}>
                    Tap to reveal
                  </Text>
                )}
              </View>
            </GlassCard>
          </Pressable>

          <View style={styles.reviewActions}>
            {showDefinition ? (
              <GlassButton
                title={reviewIndex < savedWords.length - 1 ? 'Next Word' : 'Done'}
                onPress={handleNextCard}
              />
            ) : (
              <GlassButton title="Show Definition" onPress={handleFlipCard} />
            )}
            <Pressable onPress={() => setReviewMode(false)} style={styles.reviewDismiss}>
              <Text style={[styles.reviewDismissText, { color: colors.muted }]}>
                Exit Review
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (savedWords.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.emptyState}>
          <Feather name="bookmark" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.primary }]}>
            No saved words yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Tap the ? icon while reading to look up words,{'\n'}then tap the heart to save them here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Action buttons */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.readButtonSection}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <GlassButton title="Read My Words" onPress={handleReadMyWords} />
            </View>
            <View style={styles.buttonHalf}>
              <GlassButton title="Review" onPress={handleStartReview} variant="outline" />
            </View>
          </View>
          <Text style={[styles.wordCount, { color: colors.muted }]}>
            {savedWords.length}{!isPremium ? ` / ${FREE_WORD_LIMIT}` : ''} {savedWords.length === 1 ? 'word' : 'words'} saved
          </Text>
        </Animated.View>

        {/* Free user limit banner */}
        {isAtFreeLimit && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.limitBanner}>
            <Text style={[styles.limitText, { color: colors.secondary }]}>
              Your word bank is full. Unlock unlimited with Pro.
            </Text>
            <Pressable onPress={() => setPaywallContext('locked_word_bank')}>
              <Text style={[styles.limitCta, { color: colors.primary }]}>
                Upgrade
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Word list */}
        <View style={styles.wordList}>
          {savedWords.map((sw, i) => (
            <Animated.View key={sw.id} entering={FadeIn.delay(i * 60).duration(300)}>
              <GlassCard>
                <View style={styles.wordCardContent}>
                  <View style={styles.wordCardText}>
                    <Text style={[styles.wordTitle, { color: colors.primary }]}>
                      {sw.word}
                    </Text>
                    {(sw.syllables || sw.partOfSpeech) && (
                      <Text style={[styles.wordMeta, { color: colors.muted }]}>
                        {sw.syllables}{sw.syllables && sw.partOfSpeech ? ' · ' : ''}{sw.partOfSpeech}
                      </Text>
                    )}
                    {sw.definition && (
                      <Text style={[styles.wordDefinition, { color: colors.secondary }]} numberOfLines={2}>
                        {sw.definition}
                      </Text>
                    )}
                    {sw.sourceText && (
                      <Text style={[styles.wordSource, { color: colors.muted }]} numberOfLines={1}>
                        from {sw.sourceText}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => handleRemoveWord(sw.id, sw.word)}
                    style={styles.removeButton}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${sw.word}`}
                    accessibilityRole="button"
                  >
                    <Feather name="x" size={16} color={colors.muted} />
                  </Pressable>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Paywall
        visible={showPaywall}
        onDismiss={() => setPaywallContext(null)}
        context={paywallContext}
      />
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  readButtonSection: {
    gap: 8,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  buttonHalf: {
    flex: 1,
  },
  wordCount: {
    fontSize: 13,
    fontWeight: '400',
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  limitText: {
    fontSize: 13,
    flex: 1,
  },
  limitCta: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  wordList: {
    gap: 10,
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  wordCardText: {
    flex: 1,
    gap: 3,
  },
  wordTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  wordMeta: {
    fontSize: 13,
    fontWeight: '400',
  },
  wordDefinition: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  wordSource: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  removeButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Review mode styles
  reviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 24,
  },
  reviewProgress: {
    fontSize: 14,
    fontWeight: '500',
  },
  flashcard: {
    width: '100%',
  },
  flashcardContent: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
    minHeight: 180,
    justifyContent: 'center',
  },
  flashcardWord: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flashcardMeta: {
    fontSize: 14,
    fontWeight: '400',
  },
  flashcardDefinition: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  flashcardHint: {
    fontSize: 14,
    fontWeight: '400',
  },
  flashcardAnswer: {
    alignItems: 'center',
    gap: 8,
  },
  reviewActions: {
    width: '100%',
    gap: 12,
  },
  reviewDismiss: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  reviewDismissText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
