import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from './GlassCard';
import { categories } from '../lib/data/categories';
import type { ResumeData } from '../lib/store/settings';

interface ResumeCardProps {
  data: ResumeData;
  onPress: () => void;
}

export function ResumeCard({ data, onPress }: ResumeCardProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);

  const category = categories.find((c) => c.key === data.categoryKey);

  useEffect(() => {
    translateY.value = withDelay(100, withSpring(0, { damping: 15, stiffness: 120 }));
    opacity.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 120 }));
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard onPress={onPress} accentBorder>
        <View style={styles.content}>
          <Text style={[styles.category, { color: colors.primary }]}>
            {category?.name ?? 'Reading'}
          </Text>
          <Text style={[styles.progress, { color: colors.secondary }]}>
            Word {data.wordIndex + 1} of {data.totalWords}
          </Text>
          <Text style={[styles.cta, { color: colors.muted }]}>
            Pick up where you left off
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
