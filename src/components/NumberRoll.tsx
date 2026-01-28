import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface NumberRollProps {
  target: number;
  duration?: number;
  suffix?: string;
  style?: any;
  delay?: number;
}

export function NumberRoll({
  target,
  duration = 1000,
  suffix = '',
  style,
  delay = 0,
}: NumberRollProps) {
  const { colors } = useTheme();
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      animatedValue.value = withTiming(target, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay, duration, animatedValue]);

  useDerivedValue(() => {
    const rounded = Math.round(animatedValue.value);
    runOnJS(setDisplayValue)(rounded);
    return rounded;
  }, [animatedValue]);

  return (
    <Text style={[styles.text, { color: colors.primary }, style]}>
      {displayValue}
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
});
