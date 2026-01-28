import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface SentenceTrailProps {
  words: string[];
  visible: boolean;
}

export function SentenceTrail({ words, visible }: SentenceTrailProps) {
  const { colors } = useTheme();

  if (!visible || words.length === 0) return null;

  // Show last ~10 words
  const recentWords = words.slice(-10);
  const text = recentWords.join(' ');

  return (
    <View style={styles.container}>
      <Text
        style={[styles.text, { color: colors.muted }]}
        numberOfLines={2}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40,
    paddingTop: 24,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});
