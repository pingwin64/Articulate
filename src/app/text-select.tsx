import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories, TextEntry, TextDifficulty } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { Feather } from '@expo/vector-icons';
import { Spacing } from '../design/theme';

type DifficultyFilter = 'all' | TextDifficulty;

// Difficulty badge colors - subtle glass aesthetic
const DIFFICULTY_COLORS = {
  beginner: {
    bg: 'rgba(34, 197, 94, 0.12)',
    text: '#22C55E',
  },
  intermediate: {
    bg: 'rgba(234, 179, 8, 0.12)',
    text: '#EAB308',
  },
  advanced: {
    bg: 'rgba(168, 85, 247, 0.12)',
    text: '#A855F7',
  },
};

export default function TextSelectScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryKey: string }>();
  const selectedCategoryKey = useSettingsStore((s) => s.selectedCategoryKey);
  const setSelectedCategoryKey = useSettingsStore((s) => s.setSelectedCategoryKey);
  const categoryReadCounts = useSettingsStore((s) => s.categoryReadCounts);
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

  // FormSheet workaround: params may be empty, fall back to store
  const categoryKey = params.categoryKey || selectedCategoryKey || undefined;

  const category = categories.find((c) => c.key === categoryKey);
  const userReadsInCategory = categoryKey ? (categoryReadCounts[categoryKey] ?? 0) : 0;

  // Filter texts by difficulty
  const filteredTexts = useMemo(() => {
    if (!category) return [];
    if (difficultyFilter === 'all') return category.texts;
    return category.texts.filter((t) => t.textDifficulty === difficultyFilter);
  }, [category, difficultyFilter]);

  // Count texts by difficulty for filter badges
  const difficultyCounts = useMemo(() => {
    if (!category) return { beginner: 0, intermediate: 0, advanced: 0 };
    return {
      beginner: category.texts.filter((t) => t.textDifficulty === 'beginner').length,
      intermediate: category.texts.filter((t) => t.textDifficulty === 'intermediate').length,
      advanced: category.texts.filter((t) => t.textDifficulty === 'advanced').length,
    };
  }, [category]);

  const handleFilterChange = (filter: DifficultyFilter) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDifficultyFilter(filter);
  };

  // Check if a text is unlocked based on requiredReads
  const isTextUnlocked = (entry: TextEntry): boolean => {
    const required = entry.requiredReads ?? 0;
    return userReadsInCategory >= required;
  };

  // Clear store fallback on unmount (e.g. swipe dismiss)
  React.useEffect(() => {
    return () => { setSelectedCategoryKey(null); };
  }, [setSelectedCategoryKey]);

  const handleTextSelect = (entry: TextEntry) => {
    if (!category) return;

    // Check if locked
    if (!isTextUnlocked(entry)) {
      const readsNeeded = (entry.requiredReads ?? 0) - userReadsInCategory;
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      setLockedMessage(`Complete ${readsNeeded} more ${readsNeeded === 1 ? 'reading' : 'readings'} to unlock`);
      setTimeout(() => setLockedMessage(null), 2000);
      return;
    }

    // Clear the store value after use
    setSelectedCategoryKey(null);
    router.dismiss();
    // Use setTimeout to ensure the dismiss completes before pushing
    setTimeout(() => {
      router.push(`/reading?categoryKey=${encodeURIComponent(category.key)}&textId=${encodeURIComponent(entry.id)}`);
    }, 0);
  };

  if (!category) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 40 }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={[styles.title, { color: colors.primary }]}>Category not found</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.primary }]}>
        {category.name}
      </Text>
      <Text style={[styles.subtitle, { color: colors.secondary }]}>
        Choose a text to read
      </Text>

      {/* Difficulty Filter Tabs */}
      <View style={styles.filterContainer}>
        <Pressable
          onPress={() => handleFilterChange('all')}
          style={[
            styles.filterChip,
            { backgroundColor: difficultyFilter === 'all' ? glass.fill : 'transparent' },
            difficultyFilter === 'all' && { borderColor: glass.border, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.filterChipText, { color: difficultyFilter === 'all' ? colors.primary : colors.muted }]}>
            All
          </Text>
          {category && category.texts.length > 0 && (
            <Text style={[styles.filterCount, { color: difficultyFilter === 'all' ? colors.primary : colors.muted }]}>
              {category.texts.length}
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => handleFilterChange('beginner')}
          style={[
            styles.filterChip,
            { backgroundColor: difficultyFilter === 'beginner' ? DIFFICULTY_COLORS.beginner.bg : 'transparent' },
            difficultyFilter === 'beginner' && { borderColor: DIFFICULTY_COLORS.beginner.text + '40', borderWidth: 1 },
          ]}
        >
          <Text style={[styles.filterChipText, { color: difficultyFilter === 'beginner' ? DIFFICULTY_COLORS.beginner.text : colors.muted }]}>
            Beginner
          </Text>
          {difficultyCounts.beginner > 0 && (
            <Text style={[styles.filterCount, { color: difficultyFilter === 'beginner' ? DIFFICULTY_COLORS.beginner.text : colors.muted }]}>
              {difficultyCounts.beginner}
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => handleFilterChange('intermediate')}
          style={[
            styles.filterChip,
            { backgroundColor: difficultyFilter === 'intermediate' ? DIFFICULTY_COLORS.intermediate.bg : 'transparent' },
            difficultyFilter === 'intermediate' && { borderColor: DIFFICULTY_COLORS.intermediate.text + '40', borderWidth: 1 },
          ]}
        >
          <Text style={[styles.filterChipText, { color: difficultyFilter === 'intermediate' ? DIFFICULTY_COLORS.intermediate.text : colors.muted }]}>
            Intermediate
          </Text>
          {difficultyCounts.intermediate > 0 && (
            <Text style={[styles.filterCount, { color: difficultyFilter === 'intermediate' ? DIFFICULTY_COLORS.intermediate.text : colors.muted }]}>
              {difficultyCounts.intermediate}
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => handleFilterChange('advanced')}
          style={[
            styles.filterChip,
            { backgroundColor: difficultyFilter === 'advanced' ? DIFFICULTY_COLORS.advanced.bg : 'transparent' },
            difficultyFilter === 'advanced' && { borderColor: DIFFICULTY_COLORS.advanced.text + '40', borderWidth: 1 },
          ]}
        >
          <Text style={[styles.filterChipText, { color: difficultyFilter === 'advanced' ? DIFFICULTY_COLORS.advanced.text : colors.muted }]}>
            Advanced
          </Text>
          {difficultyCounts.advanced > 0 && (
            <Text style={[styles.filterCount, { color: difficultyFilter === 'advanced' ? DIFFICULTY_COLORS.advanced.text : colors.muted }]}>
              {difficultyCounts.advanced}
            </Text>
          )}
        </Pressable>
      </View>

      {lockedMessage && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.lockedToast}>
          <Feather name="lock" size={14} color={colors.muted} />
          <Text style={[styles.lockedToastText, { color: colors.secondary }]}>
            {lockedMessage}
          </Text>
        </Animated.View>
      )}
      <View style={styles.list}>
        {filteredTexts.map((entry, i) => {
          const unlocked = isTextUnlocked(entry);
          const readsNeeded = (entry.requiredReads ?? 0) - userReadsInCategory;
          const difficultyColor = entry.textDifficulty ? DIFFICULTY_COLORS[entry.textDifficulty] : null;

          return (
            <Animated.View
              key={entry.id}
              entering={FadeIn.delay(Math.min(i, 5) * 60).duration(300)}
            >
              <GlassCard
                onPress={() => handleTextSelect(entry)}
                style={!unlocked ? styles.lockedCard : undefined}
              >
                <View style={styles.row}>
                  <View style={styles.info}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.name,
                          { color: unlocked ? colors.primary : colors.muted },
                        ]}
                        numberOfLines={1}
                      >
                        {entry.title}
                      </Text>
                      {entry.textDifficulty && difficultyColor && (
                        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor.bg }]}>
                          <Text style={[styles.difficultyBadgeText, { color: difficultyColor.text }]}>
                            {entry.textDifficulty.charAt(0).toUpperCase() + entry.textDifficulty.slice(1)}
                          </Text>
                        </View>
                      )}
                      {!unlocked && (
                        <Feather
                          name="lock"
                          size={14}
                          color={colors.muted}
                          style={styles.lockIcon}
                        />
                      )}
                    </View>
                    {entry.author && (
                      <Text
                        style={[
                          styles.author,
                          { color: unlocked ? colors.secondary : colors.muted },
                        ]}
                      >
                        {entry.author}
                      </Text>
                    )}
                    {unlocked ? (
                      <Text style={[styles.words, { color: colors.muted }]}>
                        ~{entry.words.length} words
                      </Text>
                    ) : (
                      <Text style={[styles.unlockHint, { color: colors.muted }]}>
                        Read {readsNeeded} more to unlock
                      </Text>
                    )}
                  </View>
                  {unlocked && (
                    <Feather name="chevron-right" size={18} color={colors.muted} />
                  )}
                </View>
              </GlassCard>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: Spacing.sm,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  lockIcon: {
    marginTop: 1,
  },
  author: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  words: {
    fontSize: 12,
    fontWeight: '400',
  },
  unlockHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  lockedCard: {
    opacity: 0.6,
  },
  lockedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 8,
  },
  lockedToastText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Filter tabs
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Difficulty badge on text rows
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
