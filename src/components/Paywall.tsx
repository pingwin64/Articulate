import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';
import { Spacing } from '../design/theme';

const FEATURES = [
  { icon: 'type' as const, text: 'All typography styles & fonts' },
  { icon: 'droplet' as const, text: 'Full color palette & themes' },
  { icon: 'book-open' as const, text: 'Entire reading library' },
  { icon: 'clipboard' as const, text: 'Unlimited saved texts' },
  { icon: 'zap' as const, text: 'Auto-play & breathing animation' },
  { icon: 'shield' as const, text: 'Weekly streak freeze' },
  { icon: 'bar-chart-2' as const, text: 'Full reading history' },
  { icon: 'plus-circle' as const, text: 'New content added regularly' },
];

type Plan = 'monthly' | 'lifetime';

interface PaywallProps {
  visible: boolean;
  onDismiss: () => void;
  onSubscribe?: () => void;
}

export function Paywall({ visible, onDismiss, onSubscribe }: PaywallProps) {
  const { colors, glass, isDark } = useTheme();
  const { setIsPremium, startTrial, hapticFeedback } = useSettingsStore();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('lifetime');

  const handleSubscribe = () => {
    if (hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // Placeholder until RevenueCat integration
    setIsPremium(true);
    onSubscribe?.();
    onDismiss();
  };

  const handleRestore = () => {
    // Placeholder for RestorePurchases via RevenueCat
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlan(plan);
  };

  const ctaText = selectedPlan === 'lifetime' ? 'Get Lifetime Access' : 'Continue';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          {/* Close */}
          <View style={styles.header}>
            <Pressable onPress={onDismiss} style={styles.closeButton}>
              <Feather name="x" size={22} color={colors.secondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Headline */}
            <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.headlineSection}>
              <Text style={[styles.headline, { color: colors.primary }]}>
                Unlock the full{'\n'}experience
              </Text>
              <Text style={[styles.subheadline, { color: colors.secondary }]}>
                Get unlimited access to everything Articulate has to offer.
              </Text>
            </Animated.View>

            {/* Features */}
            <Animated.View entering={FadeIn.delay(300).duration(400)}>
              <GlassCard>
                <View style={styles.featureList}>
                  {FEATURES.map((feature) => (
                    <View key={feature.text} style={styles.featureRow}>
                      <View style={[styles.featureIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                        <Feather name={feature.icon} size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.featureText, { color: colors.primary }]}>
                        {feature.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Animated.View>

            {/* Plan Selection */}
            <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.planSection}>
              <View style={styles.planRow}>
                {/* Monthly */}
                <Pressable
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: glass.fill,
                      borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                      borderWidth: selectedPlan === 'monthly' ? 1.5 : 0.5,
                    },
                  ]}
                  onPress={() => handleSelectPlan('monthly')}
                >
                  <Text style={[styles.planName, { color: colors.primary }]}>
                    Monthly
                  </Text>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    $8.99
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.secondary }]}>
                    per month
                  </Text>
                </Pressable>

                {/* Lifetime */}
                <Pressable
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: glass.fill,
                      borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                      borderWidth: selectedPlan === 'lifetime' ? 1.5 : 0.5,
                    },
                  ]}
                  onPress={() => handleSelectPlan('lifetime')}
                >
                  <View style={[styles.bestValueBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.bestValueText, { color: colors.bg }]}>
                      BEST VALUE
                    </Text>
                  </View>
                  <Text style={[styles.planName, { color: colors.primary }]}>
                    Lifetime
                  </Text>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    $19.99
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.secondary }]}>
                    one-time purchase
                  </Text>
                  <Text style={[styles.planNote, { color: colors.muted }]}>
                    Pay once, own forever
                  </Text>
                </Pressable>
              </View>
              {selectedPlan === 'lifetime' && (
                <Text style={[styles.savingsText, { color: colors.success }]}>
                  That's just $1.67/month if you keep the app 12 months
                </Text>
              )}
            </Animated.View>

            {/* Credibility */}
            <Animated.View entering={FadeIn.delay(600).duration(400)}>
              <Text style={[styles.credibilityText, { color: colors.muted }]}>
                Built on cognitive reading research
              </Text>
            </Animated.View>
          </ScrollView>

          {/* CTAs */}
          <Animated.View entering={FadeIn.delay(700).duration(300)} style={styles.ctaContainer}>
            <GlassButton title={ctaText} onPress={handleSubscribe} />
            <View style={styles.secondaryRow}>
              <Pressable onPress={handleRestore}>
                <Text style={[styles.secondaryLink, { color: colors.muted }]}>
                  Restore Purchase
                </Text>
              </Pressable>
              <Text style={[styles.dot, { color: colors.muted }]}>{'\u00B7'}</Text>
              <Pressable onPress={onDismiss}>
                <Text style={[styles.secondaryLink, { color: colors.muted }]}>
                  Not now
                </Text>
              </Pressable>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: 24,
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 24,
  },
  headlineSection: {
    alignItems: 'center',
    gap: 10,
  },
  headline: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  featureList: {
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
  },
  planSection: {
    gap: 10,
  },
  planRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
    gap: 4,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 13,
    fontWeight: '400',
  },
  planNote: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  credibilityText: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 12,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  secondaryLink: {
    fontSize: 14,
    fontWeight: '400',
  },
  dot: {
    fontSize: 14,
  },
});
