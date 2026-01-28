import React from 'react';
import { StyleSheet, Text, Pressable, type ViewStyle, type StyleProp } from 'react-native';
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

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function GlassButton({
  title,
  onPress,
  variant = 'solid',
  style,
  disabled,
}: GlassButtonProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isSolid = variant === 'solid';

  return (
    <AnimatedPressable
      onPress={() => {
        if (hapticEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.96, Springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Springs.default);
      }}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: isSolid
            ? colors.primary
            : 'transparent',
          borderWidth: isSolid ? 0 : 1,
          borderColor: glass.border,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isSolid
              ? isDark
                ? '#000'
                : '#FFF'
              : colors.primary,
          },
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
