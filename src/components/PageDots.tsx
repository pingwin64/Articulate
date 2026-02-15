import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Springs } from '../design/theme';

interface PageDotsProps {
  total: number;
  current: number;
}

function Dot({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const width = useSharedValue(active ? 24 : 8);
  const opacity = useSharedValue(active ? 1 : 0.3);

  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, Springs.snappy);
    opacity.value = withSpring(active ? 1 : 0.3, Springs.snappy);
  }, [active, width, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
    backgroundColor: colors.primary,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function PageDots({ total, current }: PageDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
