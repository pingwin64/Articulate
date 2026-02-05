import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';
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

// ─── Types ────────────────────────────────────────────────────

export type OnboardingPaywallVariant = 'A' | 'B' | 'C' | 'D';

interface OnboardingPaywallProps {
  fontFamily: FontFamilyKey;
  wordColor: WordColorKey;
  backgroundTheme: string;
  dailyGoal: number;
  readingLevel: number;
  variant?: OnboardingPaywallVariant;
  onSubscribe: () => void;
  onContinueFree: () => void;
}

type Plan = 'weekly' | 'monthly' | 'lifetime';

// ─── Feature Lists ────────────────────────────────────────────

const PRO_FEATURES = [
  { icon: 'droplet' as const, text: 'All fonts, colors & backgrounds' },
  { icon: 'book-open' as const, text: '12 categories — Philosophy, Poetry & more' },
  { icon: 'clipboard' as const, text: 'Unlimited custom text uploads' },
  { icon: 'help-circle' as const, text: 'Comprehension quizzes' },
  { icon: 'volume-2' as const, text: 'AI narration' },
  { icon: 'zap' as const, text: 'Auto-play, breathing & chunk modes' },
];

// ─── Component ────────────────────────────────────────────────

export function OnboardingPaywall({
  fontFamily,
  wordColor,
  backgroundTheme,
  dailyGoal,
  readingLevel,
  variant: propVariant,
  onSubscribe,
  onContinueFree,
}: OnboardingPaywallProps) {
  const { colors, glass, isDark } = useTheme();
  const { setIsPremium, hapticFeedback } = useSettingsStore();

  // Dev toggle for variant testing
  const [devVariant, setDevVariant] = useState<OnboardingPaywallVariant>(propVariant ?? 'C');
  const variant = __DEV__ ? devVariant : (propVariant ?? 'C');

  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch offerings
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

  // Generate personalized headline for Variant C
  const getSmartHeadline = () => {
    if (chosePremiumFont && chosePremiumColor && chosePremiumBg) {
      return "Your perfect setup is ready";
    }
    if (chosePremiumFont) {
      return `Keep your ${fontConfig.label} style`;
    }
    if (chosePremiumColor && colorConfig) {
      return `Keep your ${colorConfig.label} look`;
    }
    if (chosePremiumBg && bgConfig) {
      return `Keep your ${bgConfig.label} background`;
    }
    return "Unlock your full reading space";
  };

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

  // ─── Render Variant Content ─────────────────────────────────

  const renderVariantContent = () => {
    switch (variant) {
      case 'A':
        return renderVariantA();
      case 'B':
        return renderVariantB();
      case 'C':
        return renderVariantC();
      case 'D':
        return renderVariantD();
      default:
        return renderVariantC();
    }
  };

  // Variant A: Settings Preview
  const renderVariantA = () => (
    <>
      <Text style={[styles.headline, { color: colors.primary }]}>
        Your reading space is ready
      </Text>
      <Text style={[styles.subheadline, { color: colors.secondary }]}>
        {hasAnyPremiumChoice
          ? "Keep the look you've created"
          : "Personalize it even more with Pro"}
      </Text>

      {/* Preview Card */}
      <Animated.View entering={FadeIn.delay(100).duration(400)}>
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
          {hasAnyPremiumChoice && (
            <View style={styles.previewBadges}>
              {chosePremiumFont && (
                <Text style={[styles.previewBadge, { color: colors.secondary }]}>
                  {fontConfig.label}
                </Text>
              )}
              {chosePremiumColor && colorConfig && (
                <Text style={[styles.previewBadge, { color: colors.secondary }]}>
                  {colorConfig.label}
                </Text>
              )}
              {chosePremiumBg && bgConfig && (
                <Text style={[styles.previewBadge, { color: colors.secondary }]}>
                  {bgConfig.label}
                </Text>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </>
  );

  // Variant B: Goal-Focused
  const renderVariantB = () => (
    <>
      <Text style={[styles.headline, { color: colors.primary }]}>
        You want to read{'\n'}{dailyGoal} words daily
      </Text>
      <Text style={[styles.subheadline, { color: colors.secondary }]}>
        Pro readers are 3x more likely to hit their goals
      </Text>

      <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.goalStats}>
        <View style={[styles.statCard, { backgroundColor: glass.fill, borderColor: glass.border }]}>
          <Feather name="target" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.primary }]}>{dailyGoal}</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>words/day</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: glass.fill, borderColor: glass.border }]}>
          <Feather name="trending-up" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.primary }]}>Level {readingLevel}</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>starting</Text>
        </View>
      </Animated.View>
    </>
  );

  // Variant C: Feature Relevance (Smart)
  const renderVariantC = () => (
    <>
      <Text style={[styles.headline, { color: colors.primary }]}>
        {getSmartHeadline()}
      </Text>
      <Text style={[styles.subheadline, { color: colors.secondary }]}>
        {hasAnyPremiumChoice
          ? "Your choices require Pro to keep"
          : "Unlock the full reading experience"}
      </Text>

      {hasAnyPremiumChoice && (
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.chosenFeatures}>
          {chosePremiumFont && (
            <View style={[styles.chosenFeature, { backgroundColor: glass.fill, borderColor: glass.border }]}>
              <Feather name="type" size={16} color={colors.primary} />
              <Text style={[styles.chosenFeatureText, { color: colors.primary }]}>
                {fontConfig.label} font
              </Text>
            </View>
          )}
          {chosePremiumColor && colorConfig && (
            <View style={[styles.chosenFeature, { backgroundColor: glass.fill, borderColor: glass.border }]}>
              <View style={[styles.colorDot, { backgroundColor: previewColor }]} />
              <Text style={[styles.chosenFeatureText, { color: colors.primary }]}>
                {colorConfig.label} color
              </Text>
            </View>
          )}
          {chosePremiumBg && bgConfig && (
            <View style={[styles.chosenFeature, { backgroundColor: glass.fill, borderColor: glass.border }]}>
              <Feather name="layers" size={16} color={colors.primary} />
              <Text style={[styles.chosenFeatureText, { color: colors.primary }]}>
                {bgConfig.label} background
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </>
  );

  // Variant D: Before/After Split
  const renderVariantD = () => (
    <>
      <Text style={[styles.headline, { color: colors.primary }]}>
        Free vs Your Setup
      </Text>
      <Text style={[styles.subheadline, { color: colors.secondary }]}>
        See what you'll unlock with Pro
      </Text>

      <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.splitContainer}>
        {/* Free side */}
        <View style={[styles.splitCard, { backgroundColor: glass.fill, borderColor: glass.border }]}>
          <Text style={[styles.splitLabel, { color: colors.muted }]}>FREE</Text>
          <View style={[styles.splitPreview, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
            <Text style={[styles.splitPreviewText, { color: colors.primary }]}>
              Aa
            </Text>
          </View>
          <Text style={[styles.splitDetail, { color: colors.muted }]}>Default font</Text>
          <Text style={[styles.splitDetail, { color: colors.muted }]}>Default colors</Text>
        </View>

        {/* Pro side */}
        <View style={[styles.splitCard, styles.splitCardPro, { backgroundColor: glass.fill, borderColor: colors.primary }]}>
          <Text style={[styles.splitLabel, { color: colors.primary }]}>YOUR SETUP</Text>
          <View style={[styles.splitPreview, { backgroundColor: previewBgColor }]}>
            <Text
              style={[
                styles.splitPreviewText,
                { color: previewColor, fontFamily: fontConfig.regular },
              ]}
            >
              Aa
            </Text>
          </View>
          {chosePremiumFont && (
            <Text style={[styles.splitDetail, { color: colors.secondary }]}>{fontConfig.label}</Text>
          )}
          {chosePremiumColor && colorConfig && (
            <Text style={[styles.splitDetail, { color: colors.secondary }]}>{colorConfig.label}</Text>
          )}
          {chosePremiumBg && bgConfig && (
            <Text style={[styles.splitDetail, { color: colors.secondary }]}>{bgConfig.label}</Text>
          )}
        </View>
      </Animated.View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dev Toggle */}
          {__DEV__ && (
            <View style={styles.devToggle}>
              {(['A', 'B', 'C', 'D'] as const).map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setDevVariant(v)}
                  style={[
                    styles.devToggleButton,
                    {
                      backgroundColor: devVariant === v ? colors.primary : glass.fill,
                      borderColor: devVariant === v ? colors.primary : glass.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.devToggleText,
                      { color: devVariant === v ? colors.bg : colors.primary },
                    ]}
                  >
                    {v}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Variant Content */}
          <View style={styles.content}>
            {renderVariantContent()}
          </View>

          {/* Features List */}
          <View style={styles.featuresSection}>
            {PRO_FEATURES.slice(0, 4).map((feature, i) => (
              <Animated.View
                key={feature.text}
                entering={FadeIn.delay(200 + i * 50).duration(300)}
                style={styles.featureRow}
              >
                <Feather name={feature.icon} size={18} color={colors.primary} />
                <Text style={[styles.featureText, { color: colors.secondary }]}>
                  {feature.text}
                </Text>
              </Animated.View>
            ))}
          </View>

          {/* Plan Selection */}
          <View style={styles.plansSection}>
            <Pressable
              onPress={() => handleSelectPlan('weekly')}
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'weekly' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : glass.fill,
                  borderColor: selectedPlan === 'weekly' ? colors.primary : glass.border,
                  borderWidth: selectedPlan === 'weekly' ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.planTitle, { color: colors.primary }]}>Weekly</Text>
              <Text style={[styles.planPrice, { color: colors.primary }]}>$2.99/wk</Text>
              <Text style={[styles.planDetail, { color: colors.muted }]}>Cancel anytime</Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelectPlan('monthly')}
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'monthly' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : glass.fill,
                  borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                  borderWidth: selectedPlan === 'monthly' ? 2 : 1,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, { color: colors.primary }]}>Monthly</Text>
                <View style={[styles.planBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.planBadgeText, { color: colors.bg }]}>POPULAR</Text>
                </View>
              </View>
              <Text style={[styles.planPrice, { color: colors.primary }]}>$9.99/mo</Text>
              <Text style={[styles.planDetail, { color: colors.muted }]}>~$0.33/day</Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelectPlan('lifetime')}
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'lifetime' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : glass.fill,
                  borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                  borderWidth: selectedPlan === 'lifetime' ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.planTitle, { color: colors.primary }]}>Lifetime</Text>
              <Text style={[styles.planPrice, { color: colors.primary }]}>$19.99</Text>
              <Text style={[styles.planDetail, { color: colors.muted }]}>One-time payment</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <GlassButton
            title={isLoading ? 'Processing...' : 'Unlock Pro'}
            onPress={handlePurchase}
            disabled={isLoading}
          />
          <Pressable onPress={onContinueFree} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.secondary }]}>
              Continue Free
            </Text>
          </Pressable>
          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Text style={[styles.restoreText, { color: colors.muted }]}>
              Restore Purchases
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  devToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  devToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  devToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  // Variant A: Preview Card
  previewCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  previewText: {
    fontSize: 36,
    fontWeight: '400',
  },
  previewBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  previewBadge: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Variant B: Goal Stats
  goalStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  // Variant C: Chosen Features
  chosenFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.md,
  },
  chosenFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chosenFeatureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Variant D: Split View
  splitContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  splitCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  splitCardPro: {
    borderWidth: 2,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  splitPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitPreviewText: {
    fontSize: 28,
    fontWeight: '400',
  },
  splitDetail: {
    fontSize: 12,
  },
  // Features
  featuresSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  // Plans
  plansSection: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  planCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  planBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  planDetail: {
    fontSize: 12,
  },
  // CTA
  ctaSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  restoreButton: {
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 13,
  },
});
