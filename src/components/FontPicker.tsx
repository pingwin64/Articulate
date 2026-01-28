import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { FontFamilies, Radius, Springs } from '../design/theme';
import type { FontFamilyKey } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const fontKeys = Object.keys(FontFamilies) as FontFamilyKey[];

interface FontItemProps {
  fontKey: FontFamilyKey;
  selected: boolean;
  onSelect: () => void;
}

function FontItem({ fontKey, selected, onSelect }: FontItemProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const scale = useSharedValue(1);
  const font = FontFamilies[fontKey];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.05 : scale.value, Springs.snappy) }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        if (hapticEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onSelect();
      }}
      onPressIn={() => { scale.value = 0.95; }}
      onPressOut={() => { scale.value = 1; }}
      style={[
        styles.fontItem,
        {
          borderColor: selected
            ? colors.primary
            : glass.border,
          borderWidth: selected ? 1.5 : 0.5,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.fontPreview,
          {
            color: colors.primary,
            fontFamily: font.regular === 'System' ? undefined : font.regular,
          },
        ]}
      >
        Aa
      </Text>
      <Text style={[styles.fontLabel, { color: colors.secondary }]} numberOfLines={1}>
        {font.label}
      </Text>
    </AnimatedPressable>
  );
}

interface FontPickerProps {
  selected: FontFamilyKey;
  onSelect: (key: FontFamilyKey) => void;
}

export function FontPicker({ selected, onSelect }: FontPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {fontKeys.map((key) => (
        <FontItem
          key={key}
          fontKey={key}
          selected={selected === key}
          onSelect={() => onSelect(key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  fontItem: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  fontPreview: {
    fontSize: 22,
    fontWeight: '400',
  },
  fontLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
});
