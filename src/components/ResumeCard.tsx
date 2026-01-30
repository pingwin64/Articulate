import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from './GlassCard';
import { categories } from '../lib/data/categories';
import { useSettingsStore } from '../lib/store/settings';
import type { ResumeData } from '../lib/store/settings';

interface ResumeCardProps {
  data: ResumeData;
  onPress: () => void;
  onDismiss?: () => void;
}

export function ResumeCard({ data, onPress, onDismiss }: ResumeCardProps) {
  const { colors } = useTheme();
  const { customTexts } = useSettingsStore();
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const dismissTranslateX = useSharedValue(0);
  const dismissOpacity = useSharedValue(1);

  // Resolve name from category or custom text
  const displayName = (() => {
    if (data.customTextId) {
      const ct = customTexts.find((t) => t.id === data.customTextId);
      return ct?.title ?? 'My Text';
    }
    const category = categories.find((c) => c.key === data.categoryKey);
    return category?.name ?? 'Reading';
  })();

  useEffect(() => {
    translateY.value = withDelay(100, withSpring(0, { damping: 15, stiffness: 120 }));
    opacity.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 120 }));
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: dismissTranslateX.value },
    ],
    opacity: opacity.value * dismissOpacity.value,
  }));

  // Swipe to dismiss gesture
  const swipeDismiss = onDismiss
    ? Gesture.Pan()
        .activeOffsetX([-20, 20])
        .onUpdate((event) => {
          dismissTranslateX.value = event.translationX;
        })
        .onEnd((event) => {
          if (Math.abs(event.translationX) > 100) {
            // Dismiss
            const direction = event.translationX > 0 ? 400 : -400;
            dismissTranslateX.value = withTiming(direction, { duration: 200 });
            dismissOpacity.value = withTiming(0, { duration: 200 });
            setTimeout(() => runOnJS(onDismiss!)(), 250);
          } else {
            dismissTranslateX.value = withSpring(0, { damping: 15, stiffness: 150 });
          }
        })
    : undefined;

  const cardContent = (
    <GlassCard onPress={onPress} accentBorder>
        <View style={styles.content}>
          <Text style={[styles.category, { color: colors.primary }]}>
            {displayName}
          </Text>
          <Text style={[styles.progress, { color: colors.secondary }]}>
            Word {data.wordIndex + 1} of {data.totalWords}
          </Text>
          <Text style={[styles.cta, { color: colors.muted }]}>
            You're almost there — pick up where you left off
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((data.wordIndex + 1) / data.totalWords) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>
      </GlassCard>
  );

  if (swipeDismiss) {
    return (
      <GestureDetector gesture={swipeDismiss}>
        <Animated.View style={animatedStyle}>
          {cardContent}
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      {cardContent}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 6,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  progress: {
    fontSize: 14,
  },
  cta: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(128,128,128,0.15)',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
