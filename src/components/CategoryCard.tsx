import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from './GlassCard';
import type { Category } from '../lib/data/categories';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  locked?: boolean;
}

export function CategoryCard({ category, onPress, locked }: CategoryCardProps) {
  const { colors } = useTheme();

  return (
    <GlassCard onPress={onPress}>
      <View style={[styles.content, locked && styles.lockedContent]}>
        <View style={styles.textGroup}>
          <Text style={[styles.name, { color: locked ? colors.muted : colors.primary }]}>
            {category.name}
          </Text>
          <Text style={[styles.count, { color: colors.muted }]}>
            ~{category.wordCount} words
          </Text>
        </View>
        <Text style={[styles.chevron, { color: colors.muted }]}>
          {locked ? '\uD83D\uDD12' : '\u203A'}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textGroup: {
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  count: {
    fontSize: 13,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  lockedContent: {
    opacity: 0.5,
  },
});
