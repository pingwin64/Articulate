import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { purchaseConsumable, CONSUMABLE_PRODUCTS } from '../lib/purchases';
import { Spacing } from '../design/theme';

export function StreakRestoreSheet() {
  const { colors, glass, isDark } = useTheme();
  const pendingStreakRestore = useSettingsStore((s) => s.pendingStreakRestore);
  const isPremium = useSettingsStore((s) => s.isPremium);
  const streakRestores = useSettingsStore((s) => s.streakRestores);
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const useStreakRestore = useSettingsStore((s) => s.useStreakRestore);
  const dismissStreakRestore = useSettingsStore((s) => s.dismissStreakRestore);
  const addPurchasedRestore = useSettingsStore((s) => s.addPurchasedRestore);

  const [loading, setLoading] = useState(false);

  if (!pendingStreakRestore) return null;

  const { previousStreak } = pendingStreakRestore;

  const handleRestore = async () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Pro with restores available — use one
    if (isPremium && streakRestores > 0) {
      useStreakRestore();
      return;
    }

    // Need to purchase a restore
    const productId = isPremium
      ? CONSUMABLE_PRODUCTS.STREAK_RESTORE_PRO
      : CONSUMABLE_PRODUCTS.STREAK_RESTORE_FREE;

    setLoading(true);
    try {
      const success = await purchaseConsumable(productId);
      if (success) {
        addPurchasedRestore();
        useStreakRestore();
      }
    } catch {
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dismissStreakRestore();
  };

  const getRestoreButtonTitle = () => {
    if (loading) return 'Processing...';
    if (isPremium && streakRestores > 0) {
      return `Restore Streak (${streakRestores} left this month)`;
    }
    if (isPremium) {
      return 'Restore Streak — $0.99';
    }
    return 'Restore Streak — $1.99';
  };

  return (
    <Modal
      visible={!!pendingStreakRestore}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          <View style={styles.content}>
            {/* Icon */}
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={[
                styles.iconCircle,
                {
                  backgroundColor: glass.fill,
                  borderColor: glass.border,
                },
              ]}
            >
              <Feather name="alert-circle" size={36} color={colors.warning ?? colors.primary} />
            </Animated.View>

            {/* Header */}
            <Animated.Text
              entering={FadeIn.delay(400).duration(400)}
              style={[styles.title, { color: colors.primary }]}
            >
              Your {previousStreak}-day streak ended
            </Animated.Text>

            {/* Subheader */}
            <Animated.Text
              entering={FadeIn.delay(500).duration(400)}
              style={[styles.subtitle, { color: colors.secondary }]}
            >
              You missed a day. Restore your streak?
            </Animated.Text>

            {/* Loss aversion copy */}
            <Animated.View entering={FadeIn.delay(600).duration(400)}>
              <GlassCard>
                <View style={styles.lossCard}>
                  <Feather name="trending-up" size={20} color={colors.primary} />
                  <Text style={[styles.lossText, { color: colors.primary }]}>
                    You built {previousStreak} days of progress — don't let it go
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Pro freeze tip */}
            {isPremium && (
              <Animated.Text
                entering={FadeIn.delay(700).duration(400)}
                style={[styles.tip, { color: colors.muted }]}
              >
                Tip: Use a Streak Freeze before you miss a day
              </Animated.Text>
            )}
          </View>

          {/* CTAs */}
          <Animated.View
            entering={FadeIn.delay(800).duration(400)}
            style={styles.ctaContainer}
          >
            <GlassButton
              title={getRestoreButtonTitle()}
              onPress={handleRestore}
              disabled={loading}
            />
            <GlassButton
              title="Start Fresh"
              onPress={handleDismiss}
              variant="outline"
              disabled={loading}
            />
          </Animated.View>
        </SafeAreaView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  lossCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lossText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  tip: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 12,
  },
});
