import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

function getGreeting(windDown: boolean): string {
  const hour = new Date().getHours();
  if (windDown) {
    if (hour < 12) return 'Quiet morning';
    if (hour < 17) return 'Quiet afternoon';
    return 'Wind down';
  }
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TimeGreeting() {
  const { colors, windDownMode } = useTheme();
  const greeting = useMemo(() => getGreeting(windDownMode), [windDownMode]);

  return (
    <Text style={[styles.text, { color: colors.primary }]}>
      {greeting}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
});
