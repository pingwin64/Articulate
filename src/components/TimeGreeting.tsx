import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TimeGreeting() {
  const { colors } = useTheme();
  const greeting = useMemo(getGreeting, []);

  return (
    <Text style={[styles.text, { color: colors.secondary }]}>
      {greeting}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
