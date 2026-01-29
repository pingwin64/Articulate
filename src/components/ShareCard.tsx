import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const QUOTES = [
  'A reader lives a thousand lives.',
  'Reading is dreaming with open eyes.',
  'Every word brings you closer to mastery.',
  'The more you read, the more you know.',
  'Consistency builds greatness.',
  'You just invested in yourself.',
  'Small steps, big progress.',
  'Your mind thanks you.',
];

interface ShareCardProps {
  wordsRead: number;
  timeDisplay: string;
  wpm: number;
  streak: number;
  title: string;
  isPersonalBest: boolean;
  quoteIndex: number;
}

export const ShareCard = React.forwardRef<View, ShareCardProps>(
  ({ wordsRead, timeDisplay, wpm, streak, title, isPersonalBest, quoteIndex }, ref) => {
    const quote = QUOTES[quoteIndex % QUOTES.length];

    return (
      <View
        ref={ref}
        style={styles.card}
        collapsable={false}
      >
        {/* Dark gradient background */}
        <View style={styles.bgLayer} />
        <View style={styles.bgOverlay} />

        {/* Content */}
        <View style={styles.content}>
          {/* Checkmark */}
          <View style={styles.checkContainer}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkmark}>{'\u2713'}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.heading}>
            {isPersonalBest ? 'New Personal Best!' : 'Well Done'}
          </Text>
          <Text style={styles.subtitle}>"{title}"</Text>

          {/* Stats Row */}
          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{wordsRead}</Text>
              <Text style={styles.statLabel}>WORDS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{timeDisplay}</Text>
              <Text style={styles.statLabel}>TIME</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{wpm}</Text>
              <Text style={styles.statLabel}>WPM</Text>
            </View>
          </View>

          {/* Streak */}
          {streak > 0 && (
            <View style={styles.streakRow}>
              <Text style={styles.streakIcon}>{'\u26A1'}</Text>
              <Text style={styles.streakText}>{streak} day streak</Text>
            </View>
          )}

          {/* Quote */}
          <Text style={styles.quote}>"{quote}"</Text>

          {/* Branding */}
          <View style={styles.brandingRow}>
            <Text style={styles.brandName}>Articulate</Text>
            <Text style={styles.brandTagline}>Read word by word</Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 640,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A14',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  checkContainer: {
    marginBottom: 8,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  heading: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  statDivider: {
    width: 0.5,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakIcon: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  quote: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  brandingRow: {
    alignItems: 'center',
    marginTop: 16,
    gap: 2,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.3,
  },
});
