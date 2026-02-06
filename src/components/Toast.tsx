import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useToastStore } from '../lib/store/toast';
import { Springs } from '../design/theme';

const DURATION = 2000;

export function Toast() {
  const { colors, glass } = useTheme();
  const message = useToastStore((s) => s.message);
  const icon = useToastStore((s) => s.icon);
  const clearToast = useToastStore((s) => s.clearToast);

  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (message) {
      translateY.value = withSpring(0, Springs.snappy);
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 }, () => {
          translateY.value = 80;
          runOnJS(clearToast)();
        });
      }, DURATION);

      return () => clearTimeout(timer);
    }
  }, [message, translateY, opacity, clearToast]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        animStyle,
        {
          backgroundColor: glass.fill,
          borderColor: glass.border,
        },
      ]}
    >
      {icon && <Feather name={icon} size={16} color={colors.primary} />}
      <Text style={[styles.text, { color: colors.primary }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    minHeight: 44,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
});
