import React, { forwardRef } from 'react';
import {
  StyleSheet,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { Radius } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  accentBorder?: boolean;
}

export const GlassCard = forwardRef<View, GlassCardProps>(function GlassCard({ children, style, onPress, disabled, accentBorder }, ref) {
  const { colors, glass, isDark, isLiquidGlass } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const pressed = useSharedValue(0);

  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const tap = Gesture.Tap()
    .enabled(!disabled && !!onPress)
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: 80 });
    })
    .onFinalize(() => {
      pressed.value = withTiming(0, { duration: 150 });
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
  }));

  const cardContent = isLiquidGlass ? (
    <View style={styles.inner}>
      <GlassView
        style={StyleSheet.absoluteFill}
        glassEffectStyle="regular"
        colorScheme={isDark ? 'dark' : 'light'}
      />
      <View style={styles.content}>{children}</View>
    </View>
  ) : (
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
        colors={isDark
          ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']
          : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.highlight}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );

  const containerStyle: ViewStyle = {
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    borderColor: accentBorder
      ? isDark
        ? 'rgba(255,255,255,0.25)'
        : 'rgba(0,0,0,0.15)'
      : glass.border,
    boxShadow: `0 4px 12px rgba(0, 0, 0, ${glass.shadowOpacity})`,
    overflow: 'hidden',
  };

  if (onPress) {
    return (
      <GestureDetector gesture={tap}>
        <Animated.View ref={ref} style={[containerStyle, animatedStyle, style]}>
          {cardContent}
        </Animated.View>
      </GestureDetector>
    );
  }

  return <View ref={ref} style={[containerStyle, style]}>{cardContent}</View>;
});

const styles = StyleSheet.create({
  inner: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
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
