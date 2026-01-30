import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import type { Achievement } from '../lib/data/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'small' | 'large';
}

export function AchievementBadge({
  achievement,
  unlocked,
  size = 'small',
}: AchievementBadgeProps) {
  const { colors, isDark } = useTheme();

  const iconSize = size === 'large' ? 28 : 20;
  const circleSize = size === 'large' ? 64 : 48;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: unlocked
              ? isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.05)'
              : isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            borderColor: unlocked
              ? isDark
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(0,0,0,0.1)'
              : 'transparent',
          },
        ]}
      >
        {unlocked ? (
          <Feather
            name={achievement.icon as any}
            size={iconSize}
            color={colors.primary}
          />
        ) : (
          <Feather name="lock" size={iconSize - 4} color={colors.muted} />
        )}
      </View>
      <Text
        style={[
          styles.title,
          {
            color: unlocked ? colors.primary : colors.muted,
            fontSize: size === 'large' ? 14 : 11,
          },
        ]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>
      {size === 'large' && (
        <Text
          style={[styles.description, { color: colors.muted }]}
          numberOfLines={2}
        >
          {achievement.description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
