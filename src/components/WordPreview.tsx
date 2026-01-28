import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { FontFamilies, WordColors } from '../design/theme';

export function WordPreview() {
  const { colors } = useTheme();
  const { fontFamily, wordSize, wordBold, wordColor } = useSettingsStore();

  const font = FontFamilies[fontFamily];
  const colorEntry = WordColors.find((c) => c.key === wordColor);
  const displayColor = colorEntry?.color ?? colors.primary;
  const fontFam = wordBold ? font.bold : font.regular;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.word,
          {
            color: displayColor,
            fontSize: wordSize,
            fontFamily: fontFam === 'System' ? undefined : fontFam,
            fontWeight: wordBold ? '700' : '400',
          },
        ]}
      >
        serenity
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  word: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
