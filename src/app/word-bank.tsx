import React, { useCallback } from 'react';
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

  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.lockedState}>
          <GlassCard>
            <View style={styles.lockedCard}>
              <Feather name="lock" size={28} color={colors.muted} />
              <Text style={[styles.lockedTitle, { color: colors.primary }]}>
                Word Bank is a Pro feature
              </Text>
              <Text style={[styles.lockedSubtitle, { color: colors.muted }]}>
                Save and review your favorite words with definitions.
              </Text>
              <GlassButton
                title="Unlock Word Bank"
                onPress={() => setPaywallContext('locked_word_bank')}
              />
            </View>
          </GlassCard>
        </View>
        <Paywall
          visible={showPaywall}
          onDismiss={() => setPaywallContext(null)}
          context={paywallContext}
        />
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
        {/* Read My Words button */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.readButtonSection}>
          <GlassButton title="Read My Words" onPress={handleReadMyWords} />
          <Text style={[styles.wordCount, { color: colors.muted }]}>
            {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} saved
          </Text>
        </Animated.View>

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
  wordCount: {
    fontSize: 13,
    fontWeight: '400',
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
  lockedState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  lockedCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
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
});
