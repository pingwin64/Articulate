import React, { useMemo } from 'react';
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
import { Radius, BackgroundThemes } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

// Helper to determine if a color is "dark" (for contrast decisions)
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

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
  const backgroundTheme = useSettingsStore((s) => s.backgroundTheme);
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const pressed = useSharedValue(0);

  const isSolid = variant === 'solid';

  // Compute if the current background is dark (for contrast)
  const isDarkBackground = useMemo(() => {
    const selectedBgTheme = BackgroundThemes.find((t) => t.key === backgroundTheme);
    if (!selectedBgTheme) return isDark;
    const bgColor = isDark ? selectedBgTheme.dark : selectedBgTheme.light;
    return isColorDark(bgColor);
  }, [backgroundTheme, isDark]);

  // Contrast-aware colors that blend with the background theme
  const buttonColors = useMemo(() => {
    if (isDarkBackground) {
      return {
        solidBg: 'rgba(255,255,255,0.14)',
        solidText: 'rgba(255,255,255,0.9)',
        outlineBorder: 'rgba(255,255,255,0.2)',
        outlineText: 'rgba(255,255,255,0.9)',
      };
    }
    return {
      solidBg: 'rgba(0,0,0,0.08)',
      solidText: colors.primary,
      outlineBorder: glass.border,
      outlineText: colors.primary,
    };
  }, [isDarkBackground, colors, glass]);

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
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        style={[
          styles.button,
          {
            backgroundColor: isSolid ? buttonColors.solidBg : 'transparent',
            borderWidth: isSolid ? 0 : 1,
            borderColor: buttonColors.outlineBorder,
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
              color: isSolid ? buttonColors.solidText : buttonColors.outlineText,
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
    paddingHorizontal: 24,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
