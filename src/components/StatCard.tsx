import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color: colors.primary }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
