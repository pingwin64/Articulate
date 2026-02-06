import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from './GlassCard';
import type { Category } from '../lib/data/categories';

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  locked?: boolean;
  index?: number;
  showPreview?: boolean; // Show preview snippet for locked categories
}

export const CategoryCard = forwardRef<View, CategoryCardProps>(function CategoryCard({ category, onPress, locked, index = 0, showPreview = true }, ref) {
  const { colors, glass, isDark } = useTheme();

  const iconName = locked ? 'lock' as const : category.icon;
  const totalWords = category.texts.reduce((sum, t) => sum + t.words.length, 0);
  const textCount = category.texts.length;

  // Preview snippet for locked categories - show first text title
  const previewText = useMemo(() => {
    if (!locked || !showPreview || category.texts.length === 0) return null;
    const firstText = category.texts[0];
    return `Includes "${firstText.title}"${category.texts.length > 1 ? ` + ${category.texts.length - 1} more` : ''}`;
  }, [locked, showPreview, category.texts]);

  return (
    <Animated.View ref={ref} entering={FadeIn.delay(index * 80).duration(400)}>
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
              {textCount} {textCount === 1 ? 'text' : 'texts'} · ~{totalWords} words
            </Text>
            {previewText && (
              <Text style={[styles.preview, { color: colors.muted }]} numberOfLines={1}>
                {previewText}
              </Text>
            )}
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
});

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
  preview: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  lockedContent: {
    opacity: 0.5,
  },
});
