import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, AppState } from 'react-native';
import { useTheme } from '../hooks/useTheme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TimeGreeting() {
  const { colors } = useTheme();
  const [greeting, setGreeting] = useState(getGreeting);

  const refresh = useCallback(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    // Also refresh every 60 seconds in case user stays on screen
    const interval = setInterval(refresh, 60000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [refresh]);

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
