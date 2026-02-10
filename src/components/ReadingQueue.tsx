import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { getReadingQueue, type QueueItem } from '../lib/readingQueue';
import { Spacing } from '../design/theme';

function QueueCard({ item, index }: { item: QueueItem; index: number }) {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const setSelectedCategoryKey = useSettingsStore((s) => s.setSelectedCategoryKey);

  const wordCount = item.text.words.length;
  const estimatedMin = Math.max(1, Math.round(wordCount / 200));

  const handlePress = () => {
    setSelectedCategoryKey(item.category.key);
    router.push({
      pathname: '/reading',
      params: {
        categoryKey: item.category.key,
        textId: item.text.id,
      },
    });
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 60).duration(300)}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.card,
          {
            backgroundColor: glass.fill,
            borderColor: glass.border,
          },
        ]}
      >
        <View
          style={[
            styles.cardIcon,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
            },
          ]}
        >
          <Feather name={item.category.icon} size={18} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.primary }]} numberOfLines={2}>
          {item.text.title}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardMetaText, { color: colors.muted }]}>
            ~{wordCount}w · {estimatedMin}m
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ReadingQueue() {
  const { colors } = useTheme();
  const categoryReadCounts = useSettingsStore((s) => s.categoryReadCounts);
  const readingHistory = useSettingsStore((s) => s.readingHistory);
  const isPremium = useSettingsStore((s) => s.isPremium);

  const queue = useMemo(
    () => getReadingQueue(5),
    // Re-compute when reading history or category counts change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryReadCounts, readingHistory.length, isPremium]
  );

  if (queue.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.secondary }]}>
          UP NEXT
        </Text>
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          All caught up! Explore custom texts or revisit your favorites.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.secondary }]}>
        UP NEXT
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {queue.map((item, i) => (
          <QueueCard key={item.text.id} item={item} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  scrollContent: {
    gap: 10,
    paddingRight: Spacing.lg,
  },
  card: {
    width: 160,
    padding: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    gap: 8,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMetaText: {
    fontSize: 11,
    fontWeight: '400',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
