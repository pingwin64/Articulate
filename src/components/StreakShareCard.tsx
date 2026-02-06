import React, { forwardRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface StreakShareCardProps {
  streak: number;
  message: string;
}

// Designed for social sharing - 4:5 aspect ratio (optimal for Instagram)
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

// Scale factor for rendering (we'll capture at full size)
const SCALE = 0.3;

export const StreakShareCard = forwardRef<View, StreakShareCardProps>(
  ({ streak, message }, ref) => {
    return (
      <View
        ref={ref}
        style={[styles.container, { width: CARD_WIDTH * SCALE, height: CARD_HEIGHT * SCALE }]}
        collapsable={false}
      >
        <LinearGradient
          colors={['#1A1A2E', '#16213E', '#0F3460']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.content}>
          {/* Lightning icon */}
          <View style={styles.iconContainer}>
            <Feather name="zap" size={48 * SCALE} color="#FFD700" />
          </View>

          {/* Big streak number */}
          <Text style={styles.streakNumber}>{streak}</Text>

          {/* "day streak" label */}
          <Text style={styles.streakLabel}>day streak</Text>

          {/* Motivational message */}
          <Text style={styles.message}>"{message}"</Text>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Branding */}
          <Text style={styles.brandName}>articulate</Text>
          <Text style={styles.tagline}>One word at a time.</Text>
        </View>
      </View>
    );
  }
);

StreakShareCard.displayName = 'StreakShareCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: 24 * SCALE,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60 * SCALE,
    paddingVertical: 80 * SCALE,
  },
  iconContainer: {
    marginBottom: 20 * SCALE,
  },
  streakNumber: {
    fontSize: 180 * SCALE,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -4 * SCALE,
    lineHeight: 200 * SCALE,
  },
  streakLabel: {
    fontSize: 48 * SCALE,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -10 * SCALE,
    letterSpacing: 2 * SCALE,
  },
  message: {
    fontSize: 32 * SCALE,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40 * SCALE,
    lineHeight: 44 * SCALE,
  },
  spacer: {
    flex: 1,
    minHeight: 60 * SCALE,
  },
  brandName: {
    fontSize: 40 * SCALE,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 8 * SCALE,
    textTransform: 'lowercase',
  },
  tagline: {
    fontSize: 20 * SCALE,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8 * SCALE,
    letterSpacing: 1 * SCALE,
  },
});
