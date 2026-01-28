import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable, Text, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { Radius, Springs } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

interface GlassSegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function GlassSegmentedControl({
  options,
  selectedIndex,
  onSelect,
}: GlassSegmentedControlProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const containerWidth = useSharedValue(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    containerWidth.value = e.nativeEvent.layout.width;
  }, [containerWidth]);

  const segmentWidth = options.length > 0 ? 1 / options.length : 0;

  const pillStyle = useAnimatedStyle(() => {
    const w = containerWidth.value;
    const pillW = w * segmentWidth;
    return {
      width: pillW,
      transform: [
        {
          translateX: withSpring(selectedIndex * pillW, Springs.snappy),
        },
      ],
    };
  });

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          borderColor: glass.border,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
          },
          pillStyle,
        ]}
      />
      {options.map((option, index) => (
        <Pressable
          key={option}
          style={[styles.option, { flex: 1 }]}
          onPress={() => {
            if (hapticEnabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onSelect(index);
          }}
        >
          <Text
            style={[
              styles.optionText,
              {
                color: selectedIndex === index ? colors.primary : colors.secondary,
                fontWeight: selectedIndex === index ? '600' : '400',
              },
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
    height: 36,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 0,
    borderRadius: Radius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  option: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  optionText: {
    fontSize: 13,
  },
});
