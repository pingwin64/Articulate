import React from 'react';
import { StyleSheet, Text, type ViewStyle, type StyleProp } from 'react-native';
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
  const pressed = useSharedValue(0);

  const isSolid = variant === 'solid';

  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const tap = Gesture.Tap()
    .enabled(!disabled)
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
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.96]) }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: isSolid ? colors.primary : 'transparent',
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
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
