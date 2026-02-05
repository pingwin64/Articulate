import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';

interface TickerSliderProps {
  value: number; // 0-1
  onValueChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function TickerSlider({
  value,
  onValueChange,
  leftLabel,
  rightLabel,
}: TickerSliderProps) {
  const { colors, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);
  const lastTickX = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isDragging = useRef(false);

  // Load tick sound on mount
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/tick.mp3'),
          { volume: 0.3 }
        );
        soundRef.current = sound;
      } catch (e) {
        // Sound not available - will fall back to haptic only
        console.log('Tick sound not loaded, using haptic only');
      }
    };
    loadSound();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playTick = useCallback(async () => {
    // Play sound if available
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } catch (e) {
        // Ignore playback errors
      }
    }
    // Always play haptic if enabled
    if (hapticEnabled) {
      Haptics.selectionAsync();
    }
  }, [hapticEnabled]);

  const handleValueChange = useCallback((newVal: number) => {
    onValueChange(newVal);
  }, [onValueChange]);

  const checkAndPlayTick = useCallback((currentX: number, width: number) => {
    // Tick every 5% of track width
    const tickThreshold = width * 0.05;
    const distanceFromLastTick = Math.abs(currentX - lastTickX.current);

    if (distanceFromLastTick >= tickThreshold) {
      playTick();
      lastTickX.current = currentX;
    }
  }, [playTick]);

  // Sync thumb position when value prop changes
  useEffect(() => {
    if (trackWidth.value > 0) {
      thumbX.value = value * trackWidth.value;
      lastTickX.current = thumbX.value;
    }
  }, [value, trackWidth.value]);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    trackWidth.value = width;
    thumbX.value = value * width;
    lastTickX.current = value * width;
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.current = true;
    })
    .onUpdate((e) => {
      const w = trackWidth.value;
      if (w <= 0) return;

      const clampedX = Math.max(0, Math.min(w, e.x));
      thumbX.value = clampedX;

      const ratio = clampedX / w;
      runOnJS(handleValueChange)(ratio);
      runOnJS(checkAndPlayTick)(clampedX, w);
    })
    .onEnd(() => {
      isDragging.current = false;
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const w = trackWidth.value;
    if (w <= 0) return;

    const clampedX = Math.max(0, Math.min(w, e.x));
    thumbX.value = clampedX;
    lastTickX.current = clampedX;

    const ratio = clampedX / w;
    runOnJS(handleValueChange)(ratio);
    runOnJS(playTick)();
  });

  const composed = Gesture.Exclusive(tapGesture, gesture);

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - 14 }],
  }));

  return (
    <View style={styles.container}>
      {(leftLabel || rightLabel) && (
        <View style={styles.labelsRow}>
          <Text style={[styles.label, { color: colors.secondary }]}>
            {leftLabel || ''}
          </Text>
          <Text style={[styles.label, { color: colors.secondary }]}>
            {rightLabel || ''}
          </Text>
        </View>
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
              { backgroundColor: colors.primary },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  trackOuter: {
    height: 56,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
