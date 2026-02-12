import React, { forwardRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WeeklySummaryShareCardProps {
  weekLabel: string;
  wordsRead: number;
  textsRead: number;
  streak: number;
  topCategory?: string;
  daysActive: number;
  readingDays: boolean[]; // 7 booleans Mon-Sun
}

// Instagram Story format: 9:16 aspect ratio
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const SCALE = 0.3;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const WeeklySummaryShareCard = forwardRef<View, WeeklySummaryShareCardProps>(
  ({ weekLabel, wordsRead, textsRead, streak, topCategory, daysActive, readingDays }, ref) => {
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

        {/* Decorative glows */}
        <View style={styles.glowTopRight} />
        <View style={styles.glowBottomLeft} />

        {/* Content */}
        <View style={styles.content}>
          {/* Top section — label */}
          <View style={styles.topSection}>
            <View style={styles.weekPill}>
              <View style={styles.pillDot} />
              <Text style={styles.weekPillText}>{weekLabel.toUpperCase()}</Text>
            </View>
          </View>

          {/* Center section — stats hero */}
          <View style={styles.heroSection}>
            {/* Big words number */}
            <Text style={styles.bigNumber}>{wordsRead.toLocaleString()}</Text>
            <Text style={styles.wordsLabel}>words read</Text>

            {/* Stats cards row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{textsRead}</Text>
                <Text style={styles.statLabel}>texts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>day streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{daysActive}/7</Text>
                <Text style={styles.statLabel}>days</Text>
              </View>
            </View>

            {/* 7-day consistency dots */}
            <View style={styles.dotsContainer}>
              <View style={styles.dotsRow}>
                {DAY_LABELS.map((label, i) => (
                  <View key={i} style={styles.dotColumn}>
                    <View
                      style={[
                        styles.dot,
                        readingDays[i] ? styles.dotActive : styles.dotInactive,
                      ]}
                    />
                    <Text style={styles.dotLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top category */}
            {topCategory ? (
              <View style={styles.topCategoryContainer}>
                <Text style={styles.topCategoryLabel}>Top category</Text>
                <Text style={styles.topCategoryValue}>{topCategory}</Text>
              </View>
            ) : null}
          </View>

          {/* Bottom section — branding */}
          <View style={styles.bottomSection}>
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

WeeklySummaryShareCard.displayName = 'WeeklySummaryShareCard';

const S = SCALE;

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
  // ─── Top ──────────────────────────────────────
  topSection: {
    alignItems: 'flex-start',
  },
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10 * S,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 24 * S,
    paddingVertical: 12 * S,
    borderRadius: 40 * S,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillDot: {
    width: 10 * S,
    height: 10 * S,
    borderRadius: 5 * S,
    backgroundColor: '#818CF8',
  },
  weekPillText: {
    fontSize: 22 * S,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 4 * S,
  },
  // ─── Hero ─────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    gap: 16 * S,
  },
  bigNumber: {
    fontSize: 180 * S,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -6 * S,
    lineHeight: 200 * S,
  },
  wordsLabel: {
    fontSize: 40 * S,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: -12 * S,
    letterSpacing: 4 * S,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16 * S,
    marginTop: 40 * S,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20 * S,
    paddingVertical: 20 * S,
    paddingHorizontal: 28 * S,
    minWidth: 120 * S,
  },
  statValue: {
    fontSize: 36 * S,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 20 * S,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4 * S,
  },
  // ─── Dots ─────────────────────────────────────
  dotsContainer: {
    marginTop: 32 * S,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20 * S,
    paddingVertical: 24 * S,
    paddingHorizontal: 32 * S,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16 * S,
  },
  dotColumn: {
    alignItems: 'center',
    gap: 10 * S,
  },
  dot: {
    width: 28 * S,
    height: 28 * S,
    borderRadius: 14 * S,
  },
  dotActive: {
    backgroundColor: '#818CF8',
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dotLabel: {
    fontSize: 18 * S,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  // ─── Top category ─────────────────────────────
  topCategoryContainer: {
    marginTop: 20 * S,
    alignItems: 'center',
    gap: 4 * S,
  },
  topCategoryLabel: {
    fontSize: 20 * S,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 2 * S,
    textTransform: 'uppercase',
  },
  topCategoryValue: {
    fontSize: 30 * S,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'capitalize',
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
