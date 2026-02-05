import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';

interface GoalScrollPickerProps {
  value: number;
  onValueChange: (value: number) => void;
  options?: number[];
}

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 3;

export function GoalScrollPicker({
  value,
  onValueChange,
  options = [50, 100, 150, 200, 250, 300],
}: GoalScrollPickerProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const scrollRef = useRef<ScrollView>(null);
  const lastIndex = useRef(-1);

  const selectedIndex = options.indexOf(value);
  const initialOffset = selectedIndex >= 0 ? selectedIndex * ITEM_HEIGHT : 0;

  useEffect(() => {
    // Scroll to initial value
    if (scrollRef.current && selectedIndex >= 0) {
      scrollRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(options.length - 1, index));

    if (clampedIndex !== lastIndex.current) {
      lastIndex.current = clampedIndex;
      if (hapticEnabled) {
        Haptics.selectionAsync();
      }
    }
  }, [options.length, hapticEnabled]);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(options.length - 1, index));
    const newValue = options[clampedIndex];

    if (newValue !== value) {
      onValueChange(newValue);
    }

    // Snap to position
    scrollRef.current?.scrollTo({ y: clampedIndex * ITEM_HEIGHT, animated: true });
  }, [options, value, onValueChange]);

  return (
    <View style={styles.container}>
      {/* Selection indicator */}
      <View
        style={[
          styles.selectionIndicator,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderColor: glass.border,
          }
        ]}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingVertical: ITEM_HEIGHT }, // One item padding top/bottom
        ]}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {options.map((opt, idx) => {
          const isSelected = opt === value;
          return (
            <View key={opt} style={styles.item}>
              <Text
                style={[
                  styles.itemText,
                  {
                    color: isSelected ? colors.primary : colors.muted,
                    fontWeight: isSelected ? '600' : '400',
                    opacity: isSelected ? 1 : 0.5,
                  },
                ]}
              >
                {opt}
              </Text>
              <Text
                style={[
                  styles.itemLabel,
                  {
                    color: isSelected ? colors.secondary : colors.muted,
                    opacity: isSelected ? 1 : 0.4,
                  },
                ]}
              >
                words
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
    alignItems: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  item: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 28,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
});
