import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { Radius } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

interface GlassSegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderOption?: (option: string, index: number, isSelected: boolean) => React.ReactNode;
}

export function GlassSegmentedControl({
  options,
  selectedIndex,
  onSelect,
  renderOption,
}: GlassSegmentedControlProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        return (
          <Pressable
            key={option}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
                  : 'transparent',
                borderColor: isSelected ? glass.border : 'transparent',
              },
            ]}
            onPress={() => {
              if (hapticEnabled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onSelect(index);
            }}
          >
            {renderOption ? (
              renderOption(option, index, isSelected)
            ) : (
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? colors.primary : colors.secondary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {option}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    borderWidth: 0.5,
  },
  optionText: {
    fontSize: 13,
  },
});
