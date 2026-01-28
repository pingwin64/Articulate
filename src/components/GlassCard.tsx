import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { Radius, Springs } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  accentBorder?: boolean;
}

export function GlassCard({ children, style, onPress, disabled, accentBorder }: GlassCardProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.97, Springs.snappy);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, Springs.default);
    }
  };

  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const cardContent = (
    <View style={styles.inner}>
      <BlurView
        intensity={glass.blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: glass.fill },
        ]}
      />
      <LinearGradient
        colors={
          isDark
            ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']
            : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']
        }
        style={styles.highlight}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );

  const containerStyle: ViewStyle = {
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: accentBorder
      ? isDark
        ? 'rgba(255,255,255,0.25)'
        : 'rgba(0,0,0,0.15)'
      : glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: glass.shadowOpacity,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[containerStyle, animatedStyle, style]}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  return <View style={[containerStyle, style]}>{cardContent}</View>;
}

const styles = StyleSheet.create({
  inner: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    padding: 16,
  },
});
