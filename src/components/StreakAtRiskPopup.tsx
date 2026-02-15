import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassButton } from './GlassButton';
import { Spacing, Radius, HitTargets } from '../design/theme';

type Variant = 'A' | 'B' | 'C' | 'D';

interface StreakAtRiskPopupProps {
  visible: boolean;
  streak: number;
  hoursRemaining: number;
  onDismiss: () => void;
  onReadNow: () => void;
}

export function StreakAtRiskPopup({
  visible,
  streak,
  hoursRemaining,
  onDismiss,
  onReadNow,
}: StreakAtRiskPopupProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const { width: screenWidth } = useWindowDimensions();

  const [variant, setVariant] = useState<Variant>('A');

  // Haptic on appear
  useEffect(() => {
    if (visible && hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible, hapticFeedback]);

  const handleReadNow = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onReadNow();
  };

  const handleDismiss = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss();
  };

  const hoursText = hoursRemaining <= 1
    ? 'less than an hour'
    : `~${Math.round(hoursRemaining)} hours`;

  const surfaceBg = isDark ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)';
  const subtleBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(250)}
        style={[
          styles.sheet,
          {
            backgroundColor: surfaceBg,
            borderColor: glass.border,
          },
        ]}
      >
        {/* DEV: Variant switcher */}
        {__DEV__ && (
        <View style={styles.variantSwitcher}>
          {(['A', 'B', 'C', 'D'] as const).map((v) => (
            <Pressable
              key={v}
              onPress={() => setVariant(v)}
              style={[
                styles.variantButton,
                {
                  backgroundColor: variant === v
                    ? colors.primary
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <Text
                style={[
                  styles.variantButtonText,
                  { color: variant === v ? (isDark ? '#000' : '#fff') : colors.secondary },
                ]}
              >
                {v}
              </Text>
            </Pressable>
          ))}
        </View>
        )}

        {/* Variant A: Minimal countdown focus */}
        {variant === 'A' && (
          <View style={styles.content}>
            <View style={[styles.iconCircle, { backgroundColor: subtleBg }]}>
              <Feather name="clock" size={28} color={colors.primary} />
            </View>

            <Text style={[styles.headline, { color: colors.primary }]}>
              Your {streak}-day streak{'\n'}is at risk
            </Text>

            <Text style={[styles.subtitle, { color: colors.secondary }]}>
              You have {hoursText} left to read
            </Text>

            <View style={styles.ctaRow}>
              <GlassButton title="Read now" onPress={handleReadNow} style={styles.ctaButton} />
            </View>

            <Pressable onPress={handleDismiss} hitSlop={HitTargets.hitSlop}>
              <Text style={[styles.dismissText, { color: colors.muted }]}>Not now</Text>
            </Pressable>
          </View>
        )}

        {/* Variant B: Big streak number hero */}
        {variant === 'B' && (
          <View style={styles.content}>
            <Text style={[styles.bigNumber, { color: colors.primary }]}>{streak}</Text>
            <Text style={[styles.bigNumberLabel, { color: colors.secondary }]}>day streak at risk</Text>

            <View style={[styles.timeChip, { backgroundColor: subtleBg }]}>
              <Feather name="clock" size={14} color={colors.muted} />
              <Text style={[styles.timeChipText, { color: colors.secondary }]}>
                {hoursText} remaining
              </Text>
            </View>

            <View style={styles.ctaRow}>
              <GlassButton title="Read now" onPress={handleReadNow} style={styles.ctaButton} />
            </View>

            <Pressable onPress={handleDismiss} hitSlop={HitTargets.hitSlop}>
              <Text style={[styles.dismissText, { color: colors.muted }]}>Not now</Text>
            </Pressable>
          </View>
        )}

        {/* Variant C: Compact with urgency bar */}
        {variant === 'C' && (
          <View style={styles.content}>
            <View style={styles.compactHeader}>
              <Feather name="zap" size={20} color={colors.primary} />
              <Text style={[styles.compactTitle, { color: colors.primary }]}>
                Don't lose your streak
              </Text>
            </View>

            <View style={[styles.streakPill, { backgroundColor: subtleBg }]}>
              <Text style={[styles.streakPillNumber, { color: colors.primary }]}>{streak}</Text>
              <Text style={[styles.streakPillLabel, { color: colors.secondary }]}>days</Text>
            </View>

            <UrgencyBar
              hoursRemaining={hoursRemaining}
              isDark={isDark}
              primaryColor={colors.primary}
              mutedColor={colors.muted}
            />

            <Text style={[styles.urgencyText, { color: colors.secondary }]}>
              {hoursText} left to keep your streak alive
            </Text>

            <View style={styles.ctaRow}>
              <GlassButton title="Read now" onPress={handleReadNow} style={styles.ctaButton} />
            </View>

            <Pressable onPress={handleDismiss} hitSlop={HitTargets.hitSlop}>
              <Text style={[styles.dismissText, { color: colors.muted }]}>Not now</Text>
            </Pressable>
          </View>
        )}

        {/* Variant D: Emotional / loss framing */}
        {variant === 'D' && (
          <View style={styles.content}>
            <Text style={[styles.emotionalHeadline, { color: colors.primary }]}>
              {streak} days of reading
            </Text>
            <Text style={[styles.emotionalSub, { color: colors.secondary }]}>
              Don't let it reset to zero
            </Text>

            <View style={[styles.divider, { backgroundColor: glass.border }]} />

            <View style={styles.emotionalRow}>
              <View style={styles.emotionalStat}>
                <Text style={[styles.emotionalStatValue, { color: colors.primary }]}>
                  {hoursText}
                </Text>
                <Text style={[styles.emotionalStatLabel, { color: colors.muted }]}>remaining</Text>
              </View>
              <View style={[styles.emotionalStatDivider, { backgroundColor: glass.border }]} />
              <View style={styles.emotionalStat}>
                <Text style={[styles.emotionalStatValue, { color: colors.primary }]}>1 text</Text>
                <Text style={[styles.emotionalStatLabel, { color: colors.muted }]}>to save it</Text>
              </View>
            </View>

            <View style={styles.ctaRow}>
              <GlassButton title="Read now" onPress={handleReadNow} style={styles.ctaButton} />
            </View>

            <Pressable onPress={handleDismiss} hitSlop={HitTargets.hitSlop}>
              <Text style={[styles.dismissText, { color: colors.muted }]}>Not now</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

// Sub-component for variant C urgency bar
function UrgencyBar({
  hoursRemaining,
  isDark,
  primaryColor,
  mutedColor,
}: {
  hoursRemaining: number;
  isDark: boolean;
  primaryColor: string;
  mutedColor: string;
}) {
  // 28 hours total window (48h reset - 20h trigger = 28h max remaining)
  const progress = Math.max(0, Math.min(1, hoursRemaining / 28));

  const barBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.urgencyBar, { backgroundColor: barBg }]}>
      <View
        style={[
          styles.urgencyBarFill,
          {
            width: `${progress * 100}%`,
            backgroundColor: primaryColor + '40',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingBottom: 40,
    paddingTop: 12,
  },
  variantSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
  },
  variantButton: {
    width: 36,
    height: 28,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  variantButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
  },

  // Variant A: Minimal
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },

  // Variant B: Big number
  bigNumber: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 68,
  },
  bigNumberLabel: {
    fontSize: 17,
    fontWeight: '500',
    marginTop: -4,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Variant C: Compact with urgency
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  streakPillNumber: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  streakPillLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  urgencyBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  urgencyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },

  // Variant D: Emotional
  emotionalHeadline: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emotionalSub: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: -4,
  },
  divider: {
    width: 40,
    height: 1,
    marginVertical: 4,
  },
  emotionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  emotionalStat: {
    alignItems: 'center',
    gap: 2,
  },
  emotionalStatValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  emotionalStatLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  emotionalStatDivider: {
    width: 1,
    height: 32,
  },

  // Shared
  ctaRow: {
    width: '100%',
    marginTop: 8,
  },
  ctaButton: {
    width: '100%',
  },
  dismissText: {
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
  },
});
