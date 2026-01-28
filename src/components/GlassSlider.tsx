import React from 'react';
import { StyleSheet, View, Text, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Springs } from '../design/theme';

interface GlassSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function GlassSlider({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  leftLabel,
  rightLabel,
}: GlassSliderProps) {
  const { colors, isDark } = useTheme();
  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);

  const normalize = (v: number) =>
    Math.max(0, Math.min(1, (v - minimumValue) / (maximumValue - minimumValue)));

  const denormalize = (ratio: number) => {
    const raw = minimumValue + ratio * (maximumValue - minimumValue);
    return Math.round(raw / step) * step;
  };

  const fraction = normalize(value);

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width;
    thumbX.value = fraction * e.nativeEvent.layout.width;
  };

  const gesture = Gesture.Pan()
    .onStart(() => {})
    .onUpdate((e) => {
      const w = trackWidth.value;
      if (w <= 0) return;
      const clampedX = Math.max(0, Math.min(w, e.x));
      thumbX.value = clampedX;
      const ratio = clampedX / w;
      const newVal = denormalize(ratio);
      runOnJS(onValueChange)(newVal);
    })
    .onEnd(() => {});

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const w = trackWidth.value;
    if (w <= 0) return;
    const clampedX = Math.max(0, Math.min(w, e.x));
    thumbX.value = withSpring(clampedX, Springs.snappy);
    const ratio = clampedX / w;
    const newVal = denormalize(ratio);
    runOnJS(onValueChange)(newVal);
  });

  const composed = Gesture.Race(gesture, tapGesture);

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - 10 }],
  }));

  return (
    <View style={styles.container}>
      {leftLabel && (
        <Text style={[styles.label, { color: colors.muted }]}>{leftLabel}</Text>
      )}
      <GestureDetector gesture={composed}>
        <View style={styles.trackOuter} onLayout={onLayout}>
          <View
            style={[
              styles.track,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            <Animated.View
              style={[
                styles.fill,
                { backgroundColor: colors.primary },
                fillStyle,
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: colors.primary,
              },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
      {rightLabel && (
        <Text style={[styles.label, { color: colors.muted }]}>{rightLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  trackOuter: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
