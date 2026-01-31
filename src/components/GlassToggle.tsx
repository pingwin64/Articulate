import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { Springs } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

interface GlassToggleProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export function GlassToggle({ value, onValueChange }: GlassToggleProps) {
  const { colors, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const trackStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      value ? 1 : 0,
      [0, 1],
      [
        isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
      ]
    );
    return { backgroundColor: bgColor };
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(value ? 20 : 0, Springs.snappy),
      },
    ],
    backgroundColor: value ? colors.primary : isDark ? '#666' : '#CCC',
  }));

  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderCurve: 'continuous',
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: 'continuous',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
});
