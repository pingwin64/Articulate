import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DailyGoalRingProps {
  size?: number;
}

export function DailyGoalRing({ size = 64 }: DailyGoalRingProps) {
  const { colors } = useTheme();
  const { dailyGoal, textsReadToday, hapticFeedback, resetDailyProgressIfNeeded } = useSettingsStore();

  const celebrationScale = useSharedValue(1);
  const celebrationOpacity = useSharedValue(0);
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    resetDailyProgressIfNeeded();
  }, [resetDailyProgressIfNeeded]);

  const isComplete = textsReadToday >= dailyGoal;
  const progress = dailyGoal > 0 ? Math.min(textsReadToday / dailyGoal, 1) : 0;

  // Animate progress changes smoothly
  useEffect(() => {
    animatedProgress.value = withSpring(progress, { damping: 20, stiffness: 80 });
  }, [progress, animatedProgress]);

  // Celebration animation when goal is met
  useEffect(() => {
    if (isComplete && textsReadToday > 0) {
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      celebrationScale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 150 })
      );
      celebrationOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 800 })
      );
    }
  }, [isComplete, textsReadToday, hapticFeedback, celebrationScale, celebrationOpacity]);

  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    opacity: celebrationOpacity.value,
  }));

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const ringColor = isComplete
    ? colors.success
    : colors.primary;

  const trackColor = colors.surface;

  const animatedStrokeProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ringContainer, { width: size, height: size }, ringAnimStyle]}>
        <Svg width={size} height={size}>
          {/* Track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedStrokeProps}
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
        {/* Center text */}
        <View style={[styles.centerContent, StyleSheet.absoluteFill]}>
          <Text style={[styles.progressText, { color: colors.primary }]}>
            {textsReadToday}
          </Text>
          <Text style={[styles.goalText, { color: colors.muted }]}>
            /{dailyGoal}
          </Text>
        </View>
      </Animated.View>

      {/* Label */}
      <Text style={[styles.label, { color: isComplete ? colors.success : colors.secondary }]}>
        {isComplete ? 'Goal reached!' : 'today'}
      </Text>

      {/* Celebration overlay */}
      <Animated.View style={[styles.celebration, celebrationStyle]} pointerEvents="none">
        <Text style={styles.celebrationEmoji}>
          {'\u2728'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalText: {
    fontSize: 12,
    fontWeight: '400',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  celebration: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  celebrationEmoji: {
    fontSize: 16,
  },
});
