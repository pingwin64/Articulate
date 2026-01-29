import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

interface StreakDisplayProps {
  compact?: boolean;
}

export function StreakDisplay({ compact }: StreakDisplayProps) {
  const { colors } = useTheme();
  const { currentStreak, lastReadDate, hapticFeedback } = useSettingsStore();
  const scale = useSharedValue(1);
  const milestoneScale = useSharedValue(1);
  const milestoneOpacity = useSharedValue(0);

  // Check if streak is at risk (haven't read today)
  const isAtRisk = (() => {
    if (!lastReadDate) return false;
    const now = Date.now();
    const lastMs = new Date(lastReadDate).getTime();
    if (isNaN(lastMs)) return false;
    const elapsed = now - lastMs;
    const HOURS_24 = 24 * 60 * 60 * 1000;
    return elapsed >= HOURS_24;
  })();

  // Check if current streak is a milestone
  const isMilestone = STREAK_MILESTONES.includes(currentStreak);

  useEffect(() => {
    if (currentStreak > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [currentStreak, scale]);

  // Milestone celebration
  useEffect(() => {
    if (isMilestone && currentStreak > 0) {
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      milestoneScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 150 })
      );
      milestoneOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 1500 })
      );
    }
  }, [isMilestone, currentStreak, hapticFeedback, milestoneScale, milestoneOpacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isAtRisk ? 0.4 : 1,
  }));

  const milestoneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: milestoneScale.value }],
    opacity: milestoneOpacity.value,
  }));

  if (currentStreak === 0 && !compact) return null;

  const streakColor = isAtRisk
    ? colors.warning
    : isMilestone
      ? colors.success
      : colors.primary;

  const countColor = isAtRisk
    ? colors.warning
    : colors.secondary;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      {currentStreak > 0 && (
        <Animated.View style={iconStyle}>
          <Feather name="zap" size={compact ? 16 : 18} color={streakColor} />
        </Animated.View>
      )}
      {!compact && (
        <Text style={[styles.count, { color: countColor }]}>
          {currentStreak}
        </Text>
      )}
      {/* Milestone celebration overlay */}
      {isMilestone && (
        <Animated.Text style={[styles.milestoneText, milestoneStyle, { color: colors.success }]}>
          {'\u2728'}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compact: {
    gap: 2,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
  },
  milestoneText: {
    position: 'absolute',
    top: -10,
    right: -10,
    fontSize: 14,
  },
});
