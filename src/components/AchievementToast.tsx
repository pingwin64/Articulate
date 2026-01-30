import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { achievements } from '../lib/data/achievements';

interface AchievementToastProps {
  achievementId: string;
  onDismiss: () => void;
}

export function AchievementToast({ achievementId, onDismiss }: AchievementToastProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const achievement = achievements.find((a) => a.id === achievementId);
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Slide in
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto dismiss after 3s
    const timer = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(onDismiss, 350);
    }, 3000);

    return () => clearTimeout(timer);
  }, [hapticEnabled, translateY, opacity, onDismiss]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!achievement) return null;

  return (
    <Animated.View style={[styles.container, animStyle]} pointerEvents="none">
      <View
        style={[
          styles.card,
          {
            backgroundColor: glass.fill,
            borderColor: glass.border,
          },
        ]}
      >
        <BlurView
          intensity={glass.blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}
          >
            <Feather
              name={achievement.icon as any}
              size={18}
              color={colors.primary}
            />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.label, { color: colors.muted }]}>
              Achievement Unlocked
            </Text>
            <Text style={[styles.title, { color: colors.primary }]}>
              {achievement.title}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 1000,
  },
  card: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
