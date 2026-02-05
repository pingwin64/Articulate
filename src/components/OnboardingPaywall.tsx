import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassButton } from './GlassButton';
import {
  FontFamilies,
  WordColors,
  BackgroundThemes,
  Spacing,
} from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '../lib/purchases';
import type { PurchasesPackage } from 'react-native-purchases';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPaywallProps {
  fontFamily: FontFamilyKey;
  wordColor: WordColorKey;
  backgroundTheme: string;
  dailyGoal: number;
  onSubscribe: () => void;
  onContinueFree: () => void;
}

type Plan = 'weekly' | 'monthly' | 'lifetime';

const PRO_FEATURES = [
  { icon: 'check' as const, text: 'Keep your personalized setup — fonts, colors, background' },
  { icon: 'check' as const, text: 'Your library — upload anything, save words, bookmark favorites' },
  { icon: 'check' as const, text: 'All 12 categories: Philosophy, Poetry, Science & more' },
  { icon: 'check' as const, text: "Unlimited quizzes to track what you're learning" },
];

export function OnboardingPaywall({
  fontFamily,
  wordColor,
  backgroundTheme,
  dailyGoal,
  onSubscribe,
  onContinueFree,
}: OnboardingPaywallProps) {
  const { colors, glass, isDark } = useTheme();
  const { setIsPremium, hapticFeedback } = useSettingsStore();

  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getOfferings().then(setPackages).catch(() => {});
  }, []);

  // Get personalization info
  const fontConfig = FontFamilies[fontFamily];
  const colorConfig = WordColors.find(c => c.key === wordColor);
  const bgConfig = BackgroundThemes.find(t => t.key === backgroundTheme);

  const previewColor = colorConfig?.color ?? colors.primary;
  const previewBgColor = bgConfig
    ? (isDark ? bgConfig.dark : bgConfig.light)
    : colors.bg;

  // Detect premium features chosen
  const chosePremiumFont = fontFamily !== 'sourceSerif';
  const chosePremiumColor = wordColor !== 'default';
  const chosePremiumBg = backgroundTheme !== 'default';
  const hasAnyPremiumChoice = chosePremiumFont || chosePremiumColor || chosePremiumBg;

  const handleSelectPlan = (plan: Plan) => {
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
    const pkg = packages.find(
      (p) =>
        (selectedPlan === 'weekly' && p.identifier.includes('weekly')) ||
        (selectedPlan === 'monthly' && p.identifier.includes('monthly')) ||
        (selectedPlan === 'lifetime' && p.identifier.includes('lifetime'))
    );
    if (!pkg) {
      Alert.alert('Error', 'Unable to find selected plan');
      return;
    }

    setIsLoading(true);
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await purchasePackage(pkg);
      setIsPremium(true);
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onSubscribe();
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setIsPremium(true);
        if (hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onSubscribe();
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases to restore.');
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // Build the customization labels
  const customizations: string[] = [];
  if (chosePremiumFont) customizations.push(fontConfig.label);
  if (chosePremiumColor && colorConfig) customizations.push(colorConfig.label);
  if (chosePremiumBg && bgConfig) customizations.push(bgConfig.label);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
            <Text style={[styles.headline, { color: colors.primary }]}>
              {hasAnyPremiumChoice
                ? "Your reading space"
                : "Unlock your full\nreading space"}
            </Text>
            {hasAnyPremiumChoice && (
              <Text style={[styles.subheadline, { color: colors.secondary }]}>
                Keep the look you've created
              </Text>
            )}
          </Animated.View>

          {/* Preview Card */}
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={styles.previewSection}
          >
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: previewBgColor,
                  borderColor: glass.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewText,
                  {
                    color: previewColor,
                    fontFamily: fontConfig.regular,
                  },
                ]}
              >
                Articulate
              </Text>
            </View>
            {customizations.length > 0 && (
              <Text style={[styles.customizationLabel, { color: colors.muted }]}>
                {customizations.join(' · ')}
              </Text>
            )}
          </Animated.View>

          {/* Features */}
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={styles.featuresSection}
          >
            {PRO_FEATURES.map((feature, i) => (
              <View key={feature.text} style={styles.featureRow}>
                <Feather name="check" size={18} color={colors.primary} />
                <Text style={[styles.featureText, { color: colors.secondary }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Plans */}
          <Animated.View
            entering={FadeIn.delay(300).duration(400)}
            style={styles.plansSection}
          >
            {/* Monthly - Featured */}
            <Pressable
              onPress={() => handleSelectPlan('monthly')}
              style={[
                styles.planCard,
                styles.planCardFeatured,
                {
                  backgroundColor: selectedPlan === 'monthly'
                    ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                    : glass.fill,
                  borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                  borderWidth: selectedPlan === 'monthly' ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.popularBadgeText, { color: colors.bg }]}>
                  MOST POPULAR
                </Text>
              </View>
              <View style={styles.planContent}>
                <View style={styles.planLeft}>
                  <Text style={[styles.planTitle, { color: colors.primary }]}>Monthly</Text>
                  <Text style={[styles.planSubtitle, { color: colors.muted }]}>
                    Just $0.33/day
                  </Text>
                </View>
                <Text style={[styles.planPrice, { color: colors.primary }]}>$9.99</Text>
              </View>
            </Pressable>

            {/* Weekly */}
            <Pressable
              onPress={() => handleSelectPlan('weekly')}
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'weekly'
                    ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                    : glass.fill,
                  borderColor: selectedPlan === 'weekly' ? colors.primary : glass.border,
                  borderWidth: selectedPlan === 'weekly' ? 2 : 1,
                },
              ]}
            >
              <View style={styles.planContent}>
                <View style={styles.planLeft}>
                  <Text style={[styles.planTitle, { color: colors.primary }]}>Weekly</Text>
                  <Text style={[styles.planSubtitle, { color: colors.muted }]}>
                    $0.43/day · Try it first
                  </Text>
                </View>
                <Text style={[styles.planPrice, { color: colors.primary }]}>$2.99</Text>
              </View>
            </Pressable>

            {/* Lifetime */}
            <Pressable
              onPress={() => handleSelectPlan('lifetime')}
              style={[
                styles.planCard,
                styles.planCardFeatured,
                {
                  backgroundColor: selectedPlan === 'lifetime'
                    ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                    : glass.fill,
                  borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                  borderWidth: selectedPlan === 'lifetime' ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.savingsBadge, { backgroundColor: '#22C55E' }]}>
                <Text style={[styles.savingsBadgeText, { color: '#FFF' }]}>
                  SAVE 60%
                </Text>
              </View>
              <View style={styles.planContent}>
                <View style={styles.planLeft}>
                  <Text style={[styles.planTitle, { color: colors.primary }]}>Lifetime</Text>
                  <Text style={[styles.planSubtitle, { color: colors.muted }]}>
                    One payment, forever yours
                  </Text>
                </View>
                <Text style={[styles.planPrice, { color: colors.primary }]}>$24.99</Text>
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>

        {/* CTA Section - Fixed at bottom */}
        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          style={[styles.ctaSection, { borderTopColor: glass.border }]}
        >
          <GlassButton
            title={isLoading ? 'Processing...' : 'Continue'}
            onPress={handlePurchase}
            disabled={isLoading}
          />
          <Text style={[styles.cancelText, { color: colors.muted }]}>
            Cancel anytime
          </Text>
          <View style={styles.bottomLinks}>
            <Pressable onPress={onContinueFree} style={styles.linkButton}>
              <Text style={[styles.linkText, { color: colors.secondary }]}>
                Continue Free
              </Text>
            </Pressable>
            <Text style={[styles.linkDivider, { color: colors.muted }]}>·</Text>
            <Pressable onPress={handleRestore} style={styles.linkButton}>
              <Text style={[styles.linkText, { color: colors.muted }]}>
                Restore
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 6,
  },
  // Preview
  previewSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  previewCard: {
    width: '100%',
    paddingVertical: 32,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 32,
    fontWeight: '400',
  },
  customizationLabel: {
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  // Features
  featuresSection: {
    marginBottom: Spacing.lg,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  // Plans
  plansSection: {
    gap: 10,
  },
  planCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  planCardFeatured: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  savingsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  planLeft: {
    gap: 2,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  planSubtitle: {
    fontSize: 13,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  // CTA
  ctaSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 0.5,
  },
  cancelText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
  },
  linkDivider: {
    fontSize: 15,
  },
});
