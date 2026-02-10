import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import type { Badge, BadgeTier } from '../lib/data/badges';
import { TIER_COLORS, TIER_TINTS } from '../lib/data/badges';

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
  onPress?: () => void;
}

export function BadgeCard({ badge, unlocked, onPress }: BadgeCardProps) {
  const { colors, glass, isDark } = useTheme();

  const tierColor = badge.tier ? TIER_COLORS[badge.tier] : colors.primary;
  const tintBg = badge.tier
    ? isDark
      ? TIER_TINTS[badge.tier].dark
      : TIER_TINTS[badge.tier].light
    : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: unlocked ? tintBg : glass.fill,
          borderColor: unlocked ? tierColor + '40' : glass.border,
          opacity: unlocked ? 1 : 0.5,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: unlocked
              ? tierColor + '20'
              : isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.04)',
          },
        ]}
      >
        <Feather
          name={badge.icon}
          size={20}
          color={unlocked ? tierColor : colors.muted}
        />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.name,
            { color: unlocked ? colors.primary : colors.muted },
          ]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>
        <Text
          style={[styles.description, { color: colors.muted }]}
          numberOfLines={2}
        >
          {badge.description}
        </Text>
      </View>
      {unlocked && (
        <View style={[styles.checkCircle, { backgroundColor: tierColor }]}>
          <Feather name="check" size={12} color="#FFFFFF" />
        </View>
      )}
      {!unlocked && badge.tier && (
        <View style={styles.tierBadge}>
          <Text style={[styles.tierText, { color: tierColor }]}>
            {badge.tier.toUpperCase()}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Compact version for grid display
export function BadgeCardCompact({
  badge,
  unlocked,
  onPress,
}: BadgeCardProps) {
  const { colors, glass, isDark } = useTheme();

  const tierColor = badge.tier ? TIER_COLORS[badge.tier] : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.compactContainer,
        {
          backgroundColor: glass.fill,
          borderColor: unlocked ? tierColor + '40' : glass.border,
          opacity: unlocked ? 1 : 0.4,
        },
      ]}
    >
      <View
        style={[
          styles.compactIconCircle,
          {
            backgroundColor: unlocked
              ? tierColor + '20'
              : isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.04)',
          },
        ]}
      >
        <Feather
          name={badge.icon}
          size={18}
          color={unlocked ? tierColor : colors.muted}
        />
      </View>
      <Text
        style={[
          styles.compactName,
          { color: unlocked ? colors.primary : colors.muted },
        ]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
      {unlocked && (
        <View style={[styles.compactCheck, { backgroundColor: tierColor }]}>
          <Feather name="check" size={8} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Compact styles
  compactContainer: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    gap: 6,
    minWidth: 90,
    position: 'relative',
  },
  compactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  compactCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
