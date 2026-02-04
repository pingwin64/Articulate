import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore, getTierName } from '../lib/store/settings';
import { categories, TextEntry, getAvailableTexts } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { Feather } from '@expo/vector-icons';
import { Spacing } from '../design/theme';

// Level titles for chips
const LEVEL_TITLES: Record<number, string> = {
  1: 'Wanderer', 2: 'Seeker', 3: 'Reader', 4: 'Scholar', 5: 'Adept',
  6: 'Explorer', 7: 'Sage', 8: 'Luminary', 9: 'Virtuoso', 10: 'Master',
  11: 'Grandmaster', 12: 'Archon', 13: 'Ascendant', 14: 'Paragon', 15: 'Transcendent',
};

function getLevelTitle(level: number): string {
  if (level > 15) return `Lvl ${level}`;
  return LEVEL_TITLES[level] ?? `Lvl ${level}`;
}

// Level chip component
function LevelChip({
  level,
  isSelected,
  isCurrent,
  onPress,
}: {
  level: number;
  isSelected: boolean;
  isCurrent: boolean;
  onPress: () => void;
}) {
  const { colors, glass, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.levelChip,
        {
          backgroundColor: isSelected
            ? isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
            : glass.fill,
          borderColor: isSelected
            ? isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
            : glass.border,
        },
      ]}
    >
      <Text
        style={[
          styles.levelChipText,
          { color: isSelected ? colors.primary : colors.muted },
        ]}
      >
        Lvl {level}
      </Text>
      {isCurrent && (
        <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />
      )}
    </Pressable>
  );
}

export default function TextSelectScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryKey: string }>();
  const selectedCategoryKey = useSettingsStore((s) => s.selectedCategoryKey);
  const setSelectedCategoryKey = useSettingsStore((s) => s.setSelectedCategoryKey);
  const categoryReadCounts = useSettingsStore((s) => s.categoryReadCounts);
  const readingLevel = useSettingsStore((s) => s.readingLevel);
  const isPremium = useSettingsStore((s) => s.isPremium);
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(readingLevel);

  // Generate array of accessible levels (1 to current level)
  const accessibleLevels = useMemo(() => {
    const levels: number[] = [];
    for (let i = readingLevel; i >= 1; i--) {
      levels.push(i);
    }
    return levels;
  }, [readingLevel]);

  const handleLevelSelect = (level: number) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedLevel(level);
  };

  // FormSheet workaround: params may be empty, fall back to store
  const categoryKey = params.categoryKey || selectedCategoryKey || undefined;

  const category = categories.find((c) => c.key === categoryKey);
  const userReadsInCategory = categoryKey ? (categoryReadCounts[categoryKey] ?? 0) : 0;

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

      {/* Level chips - access previous levels */}
      {accessibleLevels.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.levelChipScroll}
          contentContainerStyle={styles.levelChipContainer}
        >
          {accessibleLevels.map((level) => (
            <LevelChip
              key={level}
              level={level}
              isSelected={selectedLevel === level}
              isCurrent={level === readingLevel}
              onPress={() => handleLevelSelect(level)}
            />
          ))}
        </ScrollView>
      )}

      {lockedMessage && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.lockedToast}>
          <Feather name="lock" size={14} color={colors.muted} />
          <Text style={[styles.lockedToastText, { color: colors.secondary }]}>
            {lockedMessage}
          </Text>
        </Animated.View>
      )}
      <View style={styles.list}>
        {category.texts.map((entry, i) => {
          const unlocked = isTextUnlocked(entry);
          const readsNeeded = (entry.requiredReads ?? 0) - userReadsInCategory;

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
                      >
                        {entry.title}
                      </Text>
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
  // Level chips
  levelChipScroll: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  levelChipContainer: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
