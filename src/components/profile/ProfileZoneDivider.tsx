import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export function ProfileZoneDivider() {
  const { colors, glass } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: glass.border }]} />
      <Text style={[styles.label, { color: colors.muted }]}>SETTINGS</Text>
      <View style={[styles.line, { backgroundColor: glass.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});
