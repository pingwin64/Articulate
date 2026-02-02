import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import {
  ALL_BADGES,
  getBadgesByCategory,
  TIER_COLORS,
  type Badge,
} from '../lib/data/badges';
import { Spacing } from '../design/theme';

// Circular progress indicator
function ProgressRing({
  progress,
  size = 24,
  strokeWidth = 3,
  color,
  bgColor,
}: {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

// Badge card for the grid
function BadgeGridCard({
  badge,
  unlocked,
  index,
  currentValue,
  targetValue,
}: {
  badge: Badge;
  unlocked: boolean;
  index: number;
  currentValue?: number;
  targetValue?: number;
}) {
  const { colors, isDark } = useTheme();
  const tierColor = badge.tier ? TIER_COLORS[badge.tier] : colors.primary;

  // Calculate progress (0-1)
  const progress = targetValue && currentValue !== undefined
    ? Math.min(1, currentValue / targetValue)
    : unlocked ? 1 : 0;

  // Colors based on unlock state
  const iconColor = unlocked ? tierColor : colors.muted;
  const progressColor = unlocked ? tierColor : colors.muted;
  const progressBgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  // Format progress text
  const getProgressText = () => {
    if (unlocked) return null;
    if (!targetValue || currentValue === undefined) return null;

    // Format large numbers
    const formatNum = (n: number) => {
      if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
      return String(n);
    };

    return `${formatNum(currentValue)}/${formatNum(targetValue)}`;
  };

  const progressText = getProgressText();

  return (
    <Animated.View
      entering={FadeIn.delay(index * 20).duration(250)}
      style={styles.badgeGridCardWrapper}
    >
      <View
        style={[
          styles.badgeGridCard,
          {
            backgroundColor: isDark
              ? unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'
              : unlocked ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.02)',
            borderColor: unlocked
              ? tierColor + '30'
              : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          },
        ]}
      >
        {/* Progress ring in corner - only show when locked */}
        {!unlocked && (
          <View style={styles.progressRingContainer}>
            <ProgressRing
              progress={progress}
              size={24}
              strokeWidth={3}
              color={progressColor}
              bgColor={progressBgColor}
            />
          </View>
        )}

        {/* Icon area */}
        <View
          style={[
            styles.badgeIconArea,
            {
              backgroundColor: unlocked
                ? tierColor + '15'
                : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            },
          ]}
        >
          <Feather
            name={badge.icon as any}
            size={36}
            color={iconColor}
            style={{ opacity: unlocked ? 1 : 0.5 }}
          />
        </View>

        {/* Text content */}
        <Text
          style={[
            styles.badgeGridName,
            {
              color: unlocked ? colors.primary : colors.muted,
              opacity: unlocked ? 1 : 0.7,
            },
          ]}
          numberOfLines={2}
        >
          {badge.name}
        </Text>

        {/* Progress text or description */}
        {progressText ? (
          <Text style={[styles.badgeProgressText, { color: colors.muted }]}>
            {progressText}
          </Text>
        ) : (
          <Text
            style={[
              styles.badgeGridDescription,
              { color: colors.muted, opacity: unlocked ? 0.8 : 0.5 }
            ]}
            numberOfLines={2}
          >
            {badge.description}
          </Text>
        )}

        {/* Tier indicator for category badges - only shown when unlocked */}
        {badge.tier && unlocked && (
          <View
            style={[
              styles.tierPill,
              {
                backgroundColor: tierColor + '20',
                borderColor: tierColor + '40',
                borderWidth: 1,
              }
            ]}
          >
            <Text
              style={[
                styles.tierPillText,
                { color: tierColor }
              ]}
            >
              {badge.tier.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function BadgesTab() {
  const { colors, isDark } = useTheme();
  const unlockedBadges = useSettingsStore((s) => s.unlockedBadges);
  const totalWordsRead = useSettingsStore((s) => s.totalWordsRead);
  const textsCompleted = useSettingsStore((s) => s.textsCompleted);
  const currentStreak = useSettingsStore((s) => s.currentStreak);
  const categoryReadCounts = useSettingsStore((s) => s.categoryReadCounts);
  const baselineWPM = useSettingsStore((s) => s.baselineWPM);

  const totalBadges = ALL_BADGES.length;
  const totalUnlocked = unlockedBadges.length;

  // Get badges by category
  const specialBadges = getBadgesByCategory('special');
  const streakBadges = getBadgesByCategory('streak');
  const wordBadges = getBadgesByCategory('words');
  const textBadges = getBadgesByCategory('texts');
  const categoryBadges = getBadgesByCategory('category');

  // Helper to get current/target values for a badge
  const getBadgeProgress = (badge: Badge): { current?: number; target?: number } => {
    if (!badge.threshold) return {};

    switch (badge.category) {
      case 'streak':
        return { current: currentStreak, target: badge.threshold };
      case 'words':
        return { current: totalWordsRead, target: badge.threshold };
      case 'texts':
        return { current: textsCompleted, target: badge.threshold };
      case 'category':
        if (badge.categoryKey) {
          return {
            current: categoryReadCounts[badge.categoryKey] ?? 0,
            target: badge.threshold
          };
        }
        return {};
      case 'special':
        // Special badges have unique conditions
        if (badge.id === 'speed-demon') {
          return { current: baselineWPM ?? 0, target: 500 };
        }
        return {};
      default:
        return {};
    }
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with total count */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Badges
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Feather name="award" size={22} color={colors.primary} />
          <Text style={[styles.headerCount, { color: colors.primary }]}>
            {totalUnlocked}/{totalBadges}
          </Text>
        </View>
      </Animated.View>

      {/* Progress bar */}
      <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${(totalUnlocked / totalBadges) * 100}%`,
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Section: Special */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
          SPECIAL
        </Text>
        <View style={styles.badgeGrid}>
          {specialBadges.map((badge, i) => {
            const { current, target } = getBadgeProgress(badge);
            return (
              <BadgeGridCard
                key={badge.id}
                badge={badge}
                unlocked={unlockedBadges.includes(badge.id)}
                index={i}
                currentValue={current}
                targetValue={target}
              />
            );
          })}
        </View>
      </View>

      {/* Section: Streaks */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
          STREAKS
        </Text>
        <View style={styles.badgeGrid}>
          {streakBadges.map((badge, i) => {
            const { current, target } = getBadgeProgress(badge);
            return (
              <BadgeGridCard
                key={badge.id}
                badge={badge}
                unlocked={unlockedBadges.includes(badge.id)}
                index={i}
                currentValue={current}
                targetValue={target}
              />
            );
          })}
        </View>
      </View>

      {/* Section: Milestones */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
          MILESTONES
        </Text>
        <View style={styles.badgeGrid}>
          {[...wordBadges, ...textBadges].map((badge, i) => {
            const { current, target } = getBadgeProgress(badge);
            return (
              <BadgeGridCard
                key={badge.id}
                badge={badge}
                unlocked={unlockedBadges.includes(badge.id)}
                index={i}
                currentValue={current}
                targetValue={target}
              />
            );
          })}
        </View>
      </View>

      {/* Section: Categories */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
          CATEGORY MASTERY
        </Text>
        <View style={styles.badgeGrid}>
          {categoryBadges.map((badge, i) => {
            const { current, target } = getBadgeProgress(badge);
            return (
              <BadgeGridCard
                key={badge.id}
                badge={badge}
                unlocked={unlockedBadges.includes(badge.id)}
                index={i}
                currentValue={current}
                targetValue={target}
              />
            );
          })}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function AchievementsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <BadgesTab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Progress
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  // Section
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  // Badge grid
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeGridCardWrapper: {
    width: '47%',
  },
  badgeGridCard: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    minHeight: 160,
    position: 'relative',
  },
  progressRingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  badgeIconArea: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  badgeGridName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 17,
  },
  badgeGridDescription: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 13,
  },
  badgeProgressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  tierPill: {
    position: 'absolute',
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierPillText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
