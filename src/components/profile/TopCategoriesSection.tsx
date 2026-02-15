import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { GlassCard } from '../GlassCard';
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

const CATEGORY_LABEL_MAP: Record<string, string> = {
  story: 'Story',
  essay: 'Essay',
  speech: 'Speech',
  philosophy: 'Philosophy',
  science: 'Science',
  fiction: 'Fiction',
  poetry: 'Poetry',
  history: 'History',
  wisdom: 'Wisdom',
  custom: 'Custom',
};

interface TopCategoriesSectionProps {
  reduceMotion: boolean;
}

export function TopCategoriesSection({ reduceMotion }: TopCategoriesSectionProps) {
  const { colors, isDark } = useTheme();
  const categoryReadCounts = useSettingsStore((s) => s.categoryReadCounts);

  const topCategories = useMemo(() => {
    const entries = Object.entries(categoryReadCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return entries.map(([key, count]) => ({
      key,
      label: CATEGORY_LABEL_MAP[key] ?? key,
      icon: CATEGORY_ICON_MAP[key] ?? ('book-open' as FeatherIconName),
      count,
    }));
  }, [categoryReadCounts]);

  if (topCategories.length === 0) return null;

  const entering = reduceMotion ? undefined : FadeIn.delay(360).duration(400);
  const iconBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

  return (
    <Animated.View entering={entering}>
      <View style={styles.headerRow}>
        <Feather name="star" size={14} color={colors.secondary} />
        <Text style={[styles.headerText, { color: colors.secondary }]}>
          YOUR SPECIALTIES
        </Text>
      </View>
      <GlassCard>
        <View style={styles.row}>
          {topCategories.map((cat) => (
            <View key={cat.key} style={styles.item}>
              <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Feather name={cat.icon} size={18} color={colors.secondary} />
              </View>
              <Text style={[styles.count, { color: colors.primary }]}>{cat.count}</Text>
              <Text style={[styles.label, { color: colors.muted }]}>{cat.label}</Text>
            </View>
          ))}
        </View>
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
    justifyContent: 'space-evenly',
    paddingVertical: 12,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
