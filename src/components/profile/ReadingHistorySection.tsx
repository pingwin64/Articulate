import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { GlassCard } from '../GlassCard';
import type { ReadingHistoryEntry } from '../../lib/store/settings';
import type { FeatherIconName } from '../../types/icons';

const CATEGORY_ICON_MAP: Record<string, FeatherIconName> = {
  story: 'book-open',
  essay: 'file-text',
  speech: 'mic',
  philosophy: 'compass',
  science: 'zap',
  fiction: 'bookmark',
  poetry: 'feather',
  history: 'clock',
  wisdom: 'wind',
  custom: 'edit-3',
};

function getCategoryIcon(categoryKey: string): FeatherIconName {
  return CATEGORY_ICON_MAP[categoryKey] ?? 'edit-3';
}

interface ReadingHistorySectionProps {
  reduceMotion: boolean;
}

export function ReadingHistorySection({ reduceMotion }: ReadingHistorySectionProps) {
  const { colors, glass, isDark } = useTheme();
  const readingHistory = useSettingsStore((s) => s.readingHistory);

  if (readingHistory.length === 0) return null;

  const entering = reduceMotion ? undefined : FadeIn.delay(320).duration(400);
  const visibleEntries = readingHistory.slice(0, 5);

  return (
    <Animated.View entering={entering}>
      <View style={styles.headerRow}>
        <Feather name="clock" size={14} color={colors.secondary} />
        <Text style={[styles.headerText, { color: colors.secondary }]}>
          READING HISTORY
        </Text>
      </View>
      <GlassCard>
        {visibleEntries.map((entry, index) => {
          const date = new Date(entry.completedAt);
          const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const isLast = index === visibleEntries.length - 1;
          const icon = getCategoryIcon(entry.categoryKey);
          const iconBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

          return (
            <View
              key={entry.id}
              style={[
                styles.row,
                !isLast && { borderBottomWidth: 0.5, borderBottomColor: glass.border },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Feather name={icon} size={16} color={colors.secondary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
                  {entry.title}
                </Text>
                <Text style={[styles.meta, { color: colors.muted }]}>
                  {entry.wordsRead} words · {entry.wpm} WPM · {dateStr}
                </Text>
              </View>
              <Feather name="check-circle" size={16} color={colors.success} />
            </View>
          );
        })}
        {readingHistory.length > 5 && (
          <Text style={[styles.more, { color: colors.secondary }]}>
            +{readingHistory.length - 5} more completed
          </Text>
        )}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
    fontWeight: '400',
  },
  more: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 8,
  },
});
