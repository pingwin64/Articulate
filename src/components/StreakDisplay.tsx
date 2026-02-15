import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, AccessibilityInfo } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';

interface StreakDisplayProps {
  compact?: boolean;
}

export function StreakDisplay({ compact }: StreakDisplayProps) {
  const { colors } = useTheme();
  const currentStreak = useSettingsStore((s) => s.currentStreak);
  const lastReadDate = useSettingsStore((s) => s.lastReadDate);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const scale = useSharedValue(1);

  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion).catch(() => {});
  }, []);

  const shouldAnimate = !reduceMotion && !systemReduceMotion;

  const today = new Date().toDateString();
  const isAtRisk = lastReadDate !== null && lastReadDate !== today;

  useEffect(() => {
    if (currentStreak > 0 && shouldAnimate) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
    return () => {
      cancelAnimation(scale);
      scale.value = 1;
    };
  }, [currentStreak, scale, shouldAnimate]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isAtRisk ? 0.4 : 1,
  }));

  if (currentStreak === 0 && !compact) return null;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Animated.Text style={[styles.flame, flameStyle, { color: colors.primary }]}>
        {currentStreak > 0 ? '\u2022' : ''}
      </Animated.Text>
      {!compact && (
        <Text style={[styles.count, { color: colors.secondary }]}>
          {currentStreak}
        </Text>
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
  flame: {
    fontSize: 18,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
  },
});
