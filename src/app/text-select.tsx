import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories, TextEntry } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { Feather } from '@expo/vector-icons';
import { Spacing } from '../design/theme';

export default function TextSelectScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryKey: string }>();
  const selectedCategoryKey = useSettingsStore((s) => s.selectedCategoryKey);
  const setSelectedCategoryKey = useSettingsStore((s) => s.setSelectedCategoryKey);
  const categoryReadCounts = useSettingsStore((s) => s.categoryReadCounts);
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

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
});
