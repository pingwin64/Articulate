import React, { forwardRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DefinitionShareCardProps {
  word: string;
  partOfSpeech?: string;
  syllables?: string;
  definition: string;
  etymology?: string;
}

// Instagram Story format: 9:16 aspect ratio
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const SCALE = 0.3;

export const DefinitionShareCard = forwardRef<View, DefinitionShareCardProps>(
  ({ word, partOfSpeech, syllables, definition, etymology }, ref) => {
    const hasSyllableBreaks = syllables && /[·\-]/.test(syllables);

    return (
      <View
        ref={ref}
        style={[styles.container, { width: CARD_WIDTH * SCALE, height: CARD_HEIGHT * SCALE }]}
        collapsable={false}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={['#0A0A1A', '#111827', '#0F172A', '#1E1B4B']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />

        {/* Decorative glow circle — top right */}
        <View style={styles.glowTopRight} />
        {/* Decorative glow circle — bottom left */}
        <View style={styles.glowBottomLeft} />

        {/* Content */}
        <View style={styles.content}>
          {/* Top spacer — balances the bottom branding */}
          <View />

          {/* Center section — word hero */}
          <View style={styles.heroSection}>
            {/* Big word */}
            <Text
              style={styles.word}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {word}
            </Text>

            {/* Part of speech + syllables row */}
            <View style={styles.metaRow}>
              {partOfSpeech ? (
                <View style={styles.posPill}>
                  <Text style={styles.posText}>{partOfSpeech}</Text>
                </View>
              ) : null}
              {hasSyllableBreaks ? (
                <Text style={styles.syllables}>{syllables}</Text>
              ) : null}
            </View>

            {/* Divider line */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDiamond} />
              <View style={styles.dividerLine} />
            </View>

            {/* Definition */}
            <Text style={styles.definition} numberOfLines={6}>
              {definition}
            </Text>

            {/* Etymology */}
            {etymology ? (
              <Text style={styles.etymology} numberOfLines={3}>
                {etymology}
              </Text>
            ) : null}
          </View>

          {/* Bottom section — branding */}
          <View style={styles.bottomSection}>
            {/* Logo mark — three bars */}
            <View style={styles.logoMark}>
              <View style={styles.logoBar} />
              <View style={[styles.logoBar, styles.logoBarShort]} />
              <View style={styles.logoBar} />
            </View>
            <Text style={styles.brandName}>articulate</Text>
            <Text style={styles.tagline}>One word at a time.</Text>
          </View>
        </View>
      </View>
    );
  }
);

DefinitionShareCard.displayName = 'DefinitionShareCard';

const S = SCALE; // shorthand

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  // Decorative glows
  glowTopRight: {
    position: 'absolute',
    top: -120 * S,
    right: -80 * S,
    width: 500 * S,
    height: 500 * S,
    borderRadius: 250 * S,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -100 * S,
    left: -100 * S,
    width: 400 * S,
    height: 400 * S,
    borderRadius: 200 * S,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 80 * S,
    paddingTop: 120 * S,
    paddingBottom: 100 * S,
    justifyContent: 'space-between',
  },
  // ─── Hero ─────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    gap: 16 * S,
  },
  word: {
    fontSize: 140 * S,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -3 * S,
    textAlign: 'center',
    textTransform: 'capitalize',
    lineHeight: 160 * S,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16 * S,
    marginTop: 8 * S,
  },
  posPill: {
    paddingHorizontal: 24 * S,
    paddingVertical: 10 * S,
    borderRadius: 24 * S,
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  posText: {
    fontSize: 26 * S,
    fontWeight: '600',
    color: '#A5B4FC',
    textTransform: 'lowercase',
  },
  syllables: {
    fontSize: 28 * S,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 3 * S,
  },
  // ─── Divider ──────────────────────────────────
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * S,
    marginVertical: 24 * S,
    width: '60%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerDiamond: {
    width: 8 * S,
    height: 8 * S,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '45deg' }],
  },
  // ─── Definition ───────────────────────────────
  definition: {
    fontSize: 34 * S,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.65)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 52 * S,
    paddingHorizontal: 20 * S,
  },
  etymology: {
    fontSize: 26 * S,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 40 * S,
    marginTop: 16 * S,
  },
  // ─── Bottom ───────────────────────────────────
  bottomSection: {
    alignItems: 'center',
    gap: 10 * S,
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4 * S,
    height: 32 * S,
    marginBottom: 8 * S,
  },
  logoBar: {
    width: 5 * S,
    height: 26 * S,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3 * S,
  },
  logoBarShort: {
    height: 18 * S,
  },
  brandName: {
    fontSize: 36 * S,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 10 * S,
    textTransform: 'lowercase',
  },
  tagline: {
    fontSize: 20 * S,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 2 * S,
  },
});
