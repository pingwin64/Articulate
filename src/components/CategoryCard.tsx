import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from './GlassCard';
import type { Category } from '../lib/data/categories';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  locked?: boolean;
  index?: number;
}

export function CategoryCard({ category, onPress, locked, index = 0 }: CategoryCardProps) {
  const { colors, glass, isDark } = useTheme();

  const iconName = locked ? 'lock' : (category.icon as any);

  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(400)}>
      <GlassCard onPress={onPress}>
        <View style={[styles.content, locked && styles.lockedContent]}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                borderColor: glass.border,
              },
            ]}
          >
            <Feather
              name={iconName}
              size={20}
              color={locked ? colors.muted : colors.primary}
            />
          </View>
          <View style={styles.textGroup}>
            <Text style={[styles.name, { color: locked ? colors.muted : colors.primary }]}>
              {category.name}
            </Text>
            <Text style={[styles.count, { color: colors.muted }]}>
              ~{category.wordCount} words
            </Text>
          </View>
          {locked ? (
            <Feather name="lock" size={14} color={colors.muted} />
          ) : (
            <Feather name="chevron-right" size={18} color={colors.muted} />
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  count: {
    fontSize: 12,
  },
  lockedContent: {
    opacity: 0.5,
  },
});
