import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import type { SavedWord } from '../lib/store/settings';
import { usePronunciationDrill } from '../hooks/usePronunciationDrill';
import { useRecording } from '../hooks/useRecording';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { GlassSegmentedControl } from '../components/GlassSegmentedControl';
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
  const pronunciationHistory = useSettingsStore((s) => s.pronunciationHistory);
  const setLastWordReviewDate = useSettingsStore((s) => s.setLastWordReviewDate);
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed);
  const voiceGender = useSettingsStore((s) => s.voiceGender);

  // E2: Words that need practice — low accuracy or never practiced
  const needsPractice = useMemo(() => {
    return savedWords.filter((w) => {
      const history = pronunciationHistory[w.word.toLowerCase()];
      if (!history) return true; // Never practiced
      return history.perfects / history.attempts < 0.5; // Low accuracy
    });
  }, [savedWords, pronunciationHistory]);

  // E4: Pronunciation accuracy stats
  const accuracyStats = useMemo(() => {
    let totalAttempts = 0;
    let totalPerfects = 0;
    for (const w of savedWords) {
      const history = pronunciationHistory[w.word.toLowerCase()];
      if (history) {
        totalAttempts += history.attempts;
        totalPerfects += history.perfects;
      }
    }
    if (totalAttempts === 0) return null;
    return Math.round((totalPerfects / totalAttempts) * 100);
  }, [savedWords, pronunciationHistory]);

  // E3: Smart flashcard ordering — prioritize never-reviewed, low accuracy, least recent
  const smartReviewOrder = useMemo(() => {
    return [...savedWords].sort((a, b) => {
      const aHistory = pronunciationHistory[a.word.toLowerCase()];
      const bHistory = pronunciationHistory[b.word.toLowerCase()];
      // Never reviewed first
      if (!a.lastReviewedDate && b.lastReviewedDate) return -1;
      if (a.lastReviewedDate && !b.lastReviewedDate) return 1;
      // Low accuracy second
      const aAccuracy = aHistory ? aHistory.perfects / aHistory.attempts : 0;
      const bAccuracy = bHistory ? bHistory.perfects / bHistory.attempts : 0;
      if (aAccuracy !== bAccuracy) return aAccuracy - bAccuracy;
      // Least recently reviewed third
      const aDate = a.lastReviewedDate ? new Date(a.lastReviewedDate).getTime() : 0;
      const bDate = b.lastReviewedDate ? new Date(b.lastReviewedDate).getTime() : 0;
      return aDate - bDate;
    });
  }, [savedWords, pronunciationHistory]);

  // Review mode state
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewTab, setReviewTab] = useState(0); // 0 = Flashcards, 1 = Pronunciation
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  // Pronunciation drill — summary tracking
  const [drillPerfects, setDrillPerfects] = useState(0);
  const [drillTotal, setDrillTotal] = useState(0);
  const [drillComplete, setDrillComplete] = useState(false);

  // Recording + pronunciation drill hooks
  const recorder = useRecording();
  const drill = usePronunciationDrill({ ttsSpeed, voiceGender, hapticFeedback, recorder });

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
    setReviewTab(0);
    setDrillPerfects(0);
    setDrillTotal(0);
    setDrillComplete(false);
    setReviewMode(true);
    setLastWordReviewDate(new Date().toISOString());
  }, [savedWords, hapticFeedback, setLastWordReviewDate]);

  const handleFlipCard = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDefinition(true);
    incrementWordsReviewed();
    // E3: Track lastReviewedDate on the current word
    const currentWord = smartReviewOrder[reviewIndex];
    if (currentWord) {
      const { savedWords: words } = useSettingsStore.getState();
      const idx = words.findIndex((w) => w.id === currentWord.id);
      if (idx >= 0) {
        const updated = [...words];
        updated[idx] = { ...updated[idx], lastReviewedDate: new Date().toISOString() };
        useSettingsStore.setState({ savedWords: updated });
      }
    }
  }, [hapticFeedback, incrementWordsReviewed, smartReviewOrder, reviewIndex]);

  const handleNextCard = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (reviewIndex < smartReviewOrder.length - 1) {
      setReviewIndex((i) => i + 1);
      setShowDefinition(false);
    } else {
      setReviewMode(false);
    }
  }, [hapticFeedback, reviewIndex, smartReviewOrder.length]);

  // E1: Handle switching to pronunciation tab — check premium/free access
  const handleTabChange = useCallback((index: number) => {
    if (index === 1 && !isPremium) {
      const store = useSettingsStore.getState();
      if (!store.canUseFreeListenRepeat()) {
        setPaywallContext('locked_pronunciation');
        return;
      }
      store.useFreeListenRepeat();
    }
    setReviewTab(index);
    if (index === 1) {
      // Reset drill state when switching to pronunciation
      setDrillPerfects(0);
      setDrillTotal(0);
      setDrillComplete(false);
      setReviewIndex(0);
    }
  }, [isPremium, setPaywallContext]);

  // E1: Auto-start drill when entering pronunciation mode or changing word
  useEffect(() => {
    if (!reviewMode || reviewTab !== 1 || drillComplete) return;
    const word = smartReviewOrder[reviewIndex];
    if (!word) return;
    // Small delay to let UI settle
    const timer = setTimeout(() => {
      drill.startDrill(word.word);
    }, 400);
    return () => clearTimeout(timer);
  }, [reviewMode, reviewTab, reviewIndex, drillComplete]);

  // E1: Track drill results and advance
  const handleDrillNext = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Count result
    const wasPerfect = drill.feedback?.result === 'perfect';
    setDrillTotal((t) => t + 1);
    if (wasPerfect) setDrillPerfects((p) => p + 1);

    // Track lastReviewedDate
    const currentWord = smartReviewOrder[reviewIndex];
    if (currentWord) {
      const { savedWords: words } = useSettingsStore.getState();
      const idx = words.findIndex((w) => w.id === currentWord.id);
      if (idx >= 0) {
        const updated = [...words];
        updated[idx] = { ...updated[idx], lastReviewedDate: new Date().toISOString() };
        useSettingsStore.setState({ savedWords: updated });
      }
    }

    drill.dismissFeedback();

    if (reviewIndex < smartReviewOrder.length - 1) {
      setReviewIndex((i) => i + 1);
    } else {
      // Drill complete
      setDrillComplete(true);
      setDrillTotal((t) => t + (wasPerfect ? 0 : 0)); // already tracked above
    }
  }, [hapticFeedback, drill, smartReviewOrder, reviewIndex]);

  // E1: Retry current word
  const handleDrillRetry = useCallback(() => {
    const word = smartReviewOrder[reviewIndex];
    if (!word) return;
    drill.startDrill(word.word);
  }, [drill, smartReviewOrder, reviewIndex]);

  // Stop drill on exit
  const handleExitReview = useCallback(() => {
    drill.stopDrill();
    setReviewMode(false);
  }, [drill]);

  // Free user limit check
  const isAtFreeLimit = !isPremium && savedWords.length >= FREE_WORD_LIMIT;

  // ─── Review Mode ──────────────────────────────────────────────
  if (reviewMode && smartReviewOrder.length > 0) {
    const currentWord = smartReviewOrder[reviewIndex];

    // E1: Drill complete summary
    if (reviewTab === 1 && drillComplete) {
      return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.reviewContainer}>
            <Feather name="check-circle" size={48} color={colors.primary} />
            <Text style={[styles.drillSummaryTitle, { color: colors.primary }]}>
              Drill Complete
            </Text>
            <Text style={[styles.drillSummaryStats, { color: colors.secondary }]}>
              {drillPerfects} / {drillTotal} perfect
            </Text>
            <View style={styles.reviewActions}>
              <GlassButton title="Done" onPress={handleExitReview} />
              <Pressable onPress={() => {
                setReviewIndex(0);
                setDrillPerfects(0);
                setDrillTotal(0);
                setDrillComplete(false);
              }} style={styles.reviewDismiss}>
                <Text style={[styles.reviewDismissText, { color: colors.muted }]}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.reviewContainer}>
          {/* Segmented control: Flashcards | Pronunciation */}
          <View style={styles.segmentedWrapper}>
            <GlassSegmentedControl
              options={['Flashcards', 'Pronunciation']}
              selectedIndex={reviewTab}
              onSelect={handleTabChange}
            />
          </View>

          <Text style={[styles.reviewProgress, { color: colors.muted }]}>
            {reviewIndex + 1} / {smartReviewOrder.length}
          </Text>

          {reviewTab === 0 ? (
            /* ─── Flashcard Mode ─── */
            <>
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
                    title={reviewIndex < smartReviewOrder.length - 1 ? 'Next Word' : 'Done'}
                    onPress={handleNextCard}
                  />
                ) : (
                  <GlassButton title="Show Definition" onPress={handleFlipCard} />
                )}
              </View>
            </>
          ) : (
            /* ─── Pronunciation Drill Mode ─── */
            <>
              <Pressable
                onPress={drill.phase === 'result' ? handleDrillNext : undefined}
                style={styles.flashcard}
              >
                <GlassCard>
                  <View style={styles.flashcardContent}>
                    <Text style={[styles.flashcardWord, { color: colors.primary }]}>
                      {currentWord.word}
                    </Text>

                    {/* Listening phase — TTS playing */}
                    {drill.phase === 'listening' && (
                      <Animated.View entering={FadeIn.duration(200)} style={styles.drillStatusRow}>
                        <Feather name="volume-2" size={16} color={colors.primary} />
                        <Text style={[styles.drillStatusText, { color: colors.primary }]}>
                          Listen...
                        </Text>
                      </Animated.View>
                    )}

                    {/* Recording phase — mic active */}
                    {drill.phase === 'recording' && (
                      <Animated.View entering={FadeIn.duration(200)} style={styles.drillStatusRow}>
                        <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
                        <Text style={[styles.drillStatusText, { color: colors.error }]}>
                          Listening...
                        </Text>
                      </Animated.View>
                    )}

                    {/* Processing phase */}
                    {drill.phase === 'processing' && (
                      <Animated.View entering={FadeIn.duration(200)} style={styles.drillStatusRow}>
                        <ActivityIndicator size="small" color={colors.muted} />
                        <Text style={[styles.drillStatusText, { color: colors.muted }]}>
                          Checking...
                        </Text>
                      </Animated.View>
                    )}

                    {/* Result phase — error */}
                    {drill.phase === 'result' && drill.error && (
                      <Animated.View style={[styles.drillStatusRow, drill.feedbackAnimStyle]}>
                        <Text style={[styles.drillStatusText, { color: colors.secondary }]}>
                          {drill.error}
                        </Text>
                      </Animated.View>
                    )}

                    {/* Result phase — feedback */}
                    {drill.phase === 'result' && drill.feedback && (
                      <Animated.View style={[styles.drillResultBlock, drill.feedbackAnimStyle]}>
                        <Text style={[
                          styles.drillResultText,
                          {
                            color: drill.feedback.result === 'perfect'
                              ? '#22C55E'
                              : drill.feedback.result === 'close'
                                ? '#EAB308'
                                : colors.secondary,
                          },
                        ]}>
                          {drill.feedback.result === 'perfect'
                            ? 'Perfect!'
                            : drill.feedback.result === 'close'
                              ? 'Close!'
                              : 'Try again'}
                        </Text>
                        {drill.feedback.result !== 'perfect' && (
                          <Text style={[styles.drillHeard, { color: colors.muted }]}>
                            Heard: "{drill.feedback.transcribed}"
                          </Text>
                        )}
                      </Animated.View>
                    )}

                    {/* Idle — waiting to start */}
                    {drill.phase === 'idle' && (
                      <Text style={[styles.flashcardHint, { color: colors.muted }]}>
                        Starting...
                      </Text>
                    )}

                    {/* Tap hint when result is showing */}
                    {drill.phase === 'result' && (
                      <Animated.Text
                        entering={FadeIn.delay(500).duration(200)}
                        style={[styles.flashcardHint, { color: colors.muted, marginTop: 8 }]}
                      >
                        Tap to continue
                      </Animated.Text>
                    )}
                  </View>
                </GlassCard>
              </Pressable>

              <View style={styles.reviewActions}>
                {drill.phase === 'result' && (
                  <View style={styles.drillActions}>
                    {drill.feedback?.result !== 'perfect' && (
                      <View style={styles.buttonHalf}>
                        <GlassButton title="Retry" onPress={handleDrillRetry} variant="outline" />
                      </View>
                    )}
                    <View style={drill.feedback?.result !== 'perfect' ? styles.buttonHalf : styles.buttonFull}>
                      <GlassButton
                        title={reviewIndex < smartReviewOrder.length - 1 ? 'Next' : 'Finish'}
                        onPress={handleDrillNext}
                      />
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          <Pressable onPress={handleExitReview} style={styles.reviewDismiss}>
            <Text style={[styles.reviewDismissText, { color: colors.muted }]}>
              Exit Review
            </Text>
          </Pressable>
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
            {accuracyStats !== null
              ? `${savedWords.length} words · ${accuracyStats}% accuracy`
              : `${savedWords.length}${!isPremium ? ` / ${FREE_WORD_LIMIT}` : ''} ${savedWords.length === 1 ? 'word' : 'words'} saved`}
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

        {/* Needs Practice section — words with low pronunciation accuracy */}
        {needsPractice.length >= 3 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.needsPracticeSection}>
            <Text style={[styles.needsPracticeTitle, { color: colors.secondary }]}>
              Needs Practice ({needsPractice.length})
            </Text>
            <View style={styles.needsPracticeRow}>
              {needsPractice.slice(0, 3).map((w) => (
                <Pressable
                  key={w.id}
                  onPress={() => {
                    // Navigate to reading with just this word for practice
                    if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: '/reading',
                      params: { wordBankWords: JSON.stringify([w.word]) },
                    });
                  }}
                  style={[styles.needsPracticeChip, { backgroundColor: colors.surface, borderColor: colors.stroke }]}
                >
                  <Feather name="mic" size={10} color={colors.muted} />
                  <Text style={[styles.needsPracticeChipText, { color: colors.primary }]}>{w.word}</Text>
                </Pressable>
              ))}
            </View>
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
  buttonFull: {
    width: '100%',
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
  segmentedWrapper: {
    width: '100%',
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
  // Pronunciation drill styles
  drillStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  drillStatusText: {
    fontSize: 15,
    fontWeight: '500',
  },
  drillResultBlock: {
    alignItems: 'center',
    gap: 4,
  },
  drillResultText: {
    fontSize: 20,
    fontWeight: '700',
  },
  drillHeard: {
    fontSize: 13,
    fontWeight: '400',
  },
  drillActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  drillSummaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  drillSummaryStats: {
    fontSize: 17,
    fontWeight: '500',
  },
  // Needs Practice section
  needsPracticeSection: {
    marginBottom: Spacing.md,
    gap: 8,
  },
  needsPracticeTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  needsPracticeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  needsPracticeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  needsPracticeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
