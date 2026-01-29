import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { Feather } from '@expo/vector-icons';
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
    <ContextMenu.Root>
      <ContextMenu.Trigger>
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
            {locked ? (
              <Feather name="lock" size={16} color={colors.muted} />
            ) : (
              <Text style={[styles.chevron, { color: colors.muted }]}>
                {'\u203A'}
              </Text>
            )}
          </View>
        </GlassCard>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        {locked ? (
          <ContextMenu.Item key="unlock" onSelect={() => {}}>
            <ContextMenu.ItemTitle>Unlock Premium</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'lock.open' }} />
          </ContextMenu.Item>
        ) : (
          <>
            <ContextMenu.Item key="start" onSelect={onPress}>
              <ContextMenu.ItemTitle>Start Reading</ContextMenu.ItemTitle>
              <ContextMenu.ItemIcon ios={{ name: 'book' }} />
            </ContextMenu.Item>
            <ContextMenu.Item key="info" disabled>
              <ContextMenu.ItemTitle>~{category.wordCount} words</ContextMenu.ItemTitle>
              <ContextMenu.ItemIcon ios={{ name: 'info.circle' }} />
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
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
