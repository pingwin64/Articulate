import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { captureAndShare } from '../lib/share';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore, STREAK_MILESTONES } from '../lib/store/settings';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { NumberRoll } from './NumberRoll';
import { StreakShareCard } from './StreakShareCard';
import { Spacing, HitTargets } from '../design/theme';

interface StreakCelebrationPopupProps {
  visible: boolean;
  streak: number;
  onDismiss: () => void;
}

function getStreakPercentile(streak: number): number {
  if (streak >= 365) return 1;
  if (streak >= 100) return 2;
  if (streak >= 50) return 5;
  if (streak >= 30) return 10;
  if (streak >= 21) return 15;
  if (streak >= 14) return 20;
  if (streak >= 7) return 30;
  if (streak >= 5) return 40;
  if (streak >= 3) return 50;
  return 60;
}

function getNextMilestone(streak: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (m > streak) return m;
  }
  return null;
}

function getCtaCopy(streak: number): string {
  if (streak >= 50) return 'Unstoppable!';
  if (streak >= 14) return 'Feeling the momentum';
  return 'Keep it going!';
}

const PARTICLE_DOTS = [
  { x: 0.2, y: 0.35, size: 4, delay: 0, duration: 2000 },
  { x: 0.8, y: 0.30, size: 3, delay: 200, duration: 2200 },
  { x: 0.5, y: 0.25, size: 5, delay: 100, duration: 1800 },
  { x: 0.3, y: 0.45, size: 3, delay: 300, duration: 2400 },
  { x: 0.7, y: 0.40, size: 4, delay: 150, duration: 2100 },
];

function ParticleDot({
  config,
  screenWidth,
  reduceMotion,
}: {
  config: typeof PARTICLE_DOTS[number];
  screenWidth: number;
  reduceMotion: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.3;
      return;
    }

    const baseDelay = 400 + config.delay;

    // Fade in, drift up slightly, fade out
    opacity.value = withDelay(
      baseDelay,
      withSequence(
        withTiming(0.5, { duration: 600 }),
        withTiming(0.5, { duration: config.duration - 1200 }),
        withTiming(0, { duration: 600 })
      )
    );

    translateY.value = withDelay(
      baseDelay,
      withTiming(-20, { duration: config.duration })
    );

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
  }, [config, reduceMotion, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: config.x * screenWidth,
          top: `${config.y * 100}%`,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: 'rgba(255,215,0,0.6)',
        },
        animatedStyle,
      ]}
    />
  );
}

// Get motivational message based on streak
function getStreakMessage(streak: number): string {
  if (streak >= 365) return 'One year of reading!';
  if (streak >= 100) return 'Legendary dedication';
  if (streak >= 50) return 'Unstoppable!';
  if (streak >= 14) return 'Keep the momentum going';
  return 'Building the habit!';
}

export function StreakCelebrationPopup({
  visible,
  streak,
  onDismiss,
}: StreakCelebrationPopupProps) {
  const { colors, glass } = useTheme();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const { width: screenWidth } = useWindowDimensions();

  const shareCardRef = useRef<View>(null);

  const percentile = getStreakPercentile(streak);
  const nextMilestone = getNextMilestone(streak);
  const ctaCopy = getCtaCopy(streak);

  const nextMilestoneText = nextMilestone
    ? `${nextMilestone - streak} more day${nextMilestone - streak === 1 ? '' : 's'} to reach ${nextMilestone}!`
    : "You've achieved legendary status!";

  // Haptic on modal appear
  useEffect(() => {
    if (visible && hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible, hapticFeedback]);

  const handleCtaPress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss();
  };

  const handleShare = async () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await captureAndShare(
      shareCardRef,
      `I just hit a ${streak}-day reading streak on Articulate!\n\nImprove your reading skills one word at a time.`,
      'Share your streak'
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          {/* Close button */}
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={HitTargets.hitSlop}
          >
            <Feather name="x" size={24} color={colors.secondary} />
          </Pressable>

          {/* Subtle celebration particles */}
          <View style={styles.confettiContainer} pointerEvents="none">
            {PARTICLE_DOTS.map((config, index) => (
              <ParticleDot
                key={index}
                config={config}
                screenWidth={screenWidth}
                reduceMotion={reduceMotion}
              />
            ))}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Big streak number */}
            <Animated.View entering={FadeIn.delay(200).duration(400)}>
              <NumberRoll
                target={streak}
                duration={1200}
                delay={300}
                style={styles.streakNumber}
              />
            </Animated.View>

            {/* "day streak" label */}
            <Animated.Text
              entering={FadeIn.delay(400).duration(400)}
              style={[styles.streakLabel, { color: colors.secondary }]}
            >
              day streak
            </Animated.Text>

            {/* Percentile card */}
            <Animated.View
              entering={FadeIn.delay(600).duration(400)}
              style={styles.percentileContainer}
            >
              <GlassCard>
                <View style={styles.percentileContent}>
                  <Feather name="award" size={20} color={colors.primary} />
                  <Text style={[styles.percentileText, { color: colors.primary }]}>
                    You're in the top {percentile}% of readers!
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Next milestone text */}
            <Animated.Text
              entering={FadeIn.delay(800).duration(400)}
              style={[styles.milestoneText, { color: colors.muted }]}
            >
              {nextMilestoneText}
            </Animated.Text>
          </View>

          {/* CTA */}
          <Animated.View
            entering={FadeIn.delay(1000).duration(400)}
            style={styles.ctaContainer}
          >
            <GlassButton title={ctaCopy} onPress={handleCtaPress} />
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                styles.shareButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Feather name="share" size={18} color={colors.secondary} />
              <Text style={[styles.shareButtonText, { color: colors.secondary }]}>
                Share
              </Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>

        {/* Off-screen share card for capture */}
        <View style={styles.offScreenContainer} pointerEvents="none">
          <StreakShareCard
            ref={shareCardRef}
            streak={streak}
            message={getStreakMessage(streak)}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: HitTargets.minimum,
    height: HitTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 16,
    zIndex: 1,
  },
  streakNumber: {
    fontSize: 80,
    fontWeight: '700',
    textAlign: 'center',
  },
  streakLabel: {
    fontSize: 24,
    fontWeight: '400',
    marginTop: -8,
  },
  percentileContainer: {
    width: '100%',
    marginTop: 16,
  },
  percentileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  percentileText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  milestoneText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    zIndex: 1,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  offScreenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
  },
});
