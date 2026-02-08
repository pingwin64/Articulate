import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { getBadgeById } from '../../lib/data/badges';
import type { FeatherIconName } from '../../types/icons';

interface AchievementShowcaseProps {
  reduceMotion: boolean;
}

export function AchievementShowcase({ reduceMotion }: AchievementShowcaseProps) {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const unlockedBadges = useSettingsStore((s) => s.unlockedBadges);

  const entering = reduceMotion ? undefined : FadeIn.delay(160).duration(400);

  // Get last 4 unlocked badges (most recent first — store pushes to end)
  const recentBadgeIds = unlockedBadges.slice(-4).reverse();
  const recentBadges = recentBadgeIds
    .map((id) => getBadgeById(id))
    .filter(Boolean);

  return (
    <Animated.View entering={entering}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: colors.secondary }]}>
          RECENT ACHIEVEMENTS
        </Text>
      </View>

      {recentBadges.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          Start reading to earn badges
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {recentBadges.map((badge) => {
            if (!badge) return null;
            const iconBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
            return (
              <Pressable
                key={badge.id}
                onPress={() => router.push('/achievements')}
                style={styles.badgeItem}
              >
                <View style={[styles.badgeCircle, { backgroundColor: iconBg }]}>
                  <Feather name={badge.icon} size={22} color={colors.primary} />
                </View>
                <Text
                  style={[styles.badgeName, { color: colors.secondary }]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
              </Pressable>
            );
          })}

          {/* See All */}
          <Pressable
            onPress={() => router.push('/achievements')}
            style={styles.badgeItem}
          >
            <View style={[styles.badgeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
              <Feather name="arrow-right" size={20} color={colors.muted} />
            </View>
            <Text style={[styles.badgeName, { color: colors.muted }]}>
              See All
            </Text>
          </Pressable>
        </ScrollView>
      )}
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
  scrollContent: {
    gap: 16,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 6,
    width: 68,
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
