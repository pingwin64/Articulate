import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, useWindowDimensions, Share } from 'react-native';
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
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { Feather } from '@expo/vector-icons';
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

// Gold color for lightning bolts
const LIGHTNING_GOLD = '#FFD700';

// Confetti pieces - start from left (-1) or right (1), with varying speeds and wobble
const CONFETTI_PIECES = [
  { side: -1, startY: -50, size: 28, speed: 2200, wobble: 30, delay: 0 },
  { side: 1, startY: -80, size: 32, speed: 2400, wobble: -25, delay: 50 },
  { side: -1, startY: 0, size: 24, speed: 2000, wobble: 35, delay: 100 },
  { side: 1, startY: -30, size: 30, speed: 2600, wobble: -40, delay: 80 },
  { side: -1, startY: 50, size: 26, speed: 2300, wobble: 28, delay: 150 },
  { side: 1, startY: 80, size: 28, speed: 2100, wobble: -32, delay: 120 },
  { side: -1, startY: -100, size: 22, speed: 2500, wobble: 38, delay: 200 },
  { side: 1, startY: 30, size: 26, speed: 2350, wobble: -28, delay: 180 },
  { side: -1, startY: 100, size: 30, speed: 2150, wobble: 25, delay: 60 },
  { side: 1, startY: -60, size: 24, speed: 2450, wobble: -35, delay: 140 },
  { side: -1, startY: 150, size: 20, speed: 2550, wobble: 42, delay: 220 },
  { side: 1, startY: 120, size: 22, speed: 2250, wobble: -30, delay: 170 },
];

function ConfettiBolt({
  config,
  screenWidth,
  reduceMotion,
}: {
  config: typeof CONFETTI_PIECES[number];
  screenWidth: number;
  reduceMotion: boolean;
}) {
  // Start off-screen on left or right
  const startX = config.side === -1 ? -50 : screenWidth + 50;
  const endX = config.side === -1 ? screenWidth + 50 : -50;

  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(config.startY);
  const rotate = useSharedValue(config.side === -1 ? -30 : 30);
  const opacity = useSharedValue(1); // Start visible

  useEffect(() => {
    if (reduceMotion) {
      // Just show static bolts at edges
      translateX.value = config.side === -1 ? 40 : screenWidth - 70;
      opacity.value = 0.7;
      return;
    }

    const baseDelay = 200 + config.delay;
    const duration = config.speed;

    // Fly across the screen
    translateX.value = withDelay(
      baseDelay,
      withTiming(endX, { duration })
    );

    // Float down while flying
    translateY.value = withDelay(
      baseDelay,
      withTiming(config.startY + 350, { duration })
    );

    // Spin while flying
    rotate.value = withDelay(
      baseDelay,
      withTiming(config.wobble * 6, { duration })
    );

    // Fade out as it exits
    opacity.value = withDelay(
      baseDelay + duration - 500,
      withTiming(0, { duration: 500 })
    );

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(rotate);
      cancelAnimation(opacity);
    };
  }, [config, screenWidth, reduceMotion, startX, endX, translateX, translateY, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.confettiBolt, animatedStyle]}>
      <Feather name="zap" size={config.size} color={LIGHTNING_GOLD} />
    </Animated.View>
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

    try {
      // Capture the share card as image
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your streak',
      });
    } catch (error) {
      // Fallback to text share if capture fails
      await Share.share({
        message: `I just hit a ${streak}-day reading streak on Articulate!\n\nImprove your reading skills one word at a time.`,
      });
    }
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

          {/* Lightning confetti - flies across from sides */}
          <View style={styles.confettiContainer} pointerEvents="none">
            {CONFETTI_PIECES.map((config, index) => (
              <ConfettiBolt
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
  confettiBolt: {
    position: 'absolute',
    top: '40%',
    left: 0,
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
