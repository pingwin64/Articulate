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
import { useRouter } from 'expo-router';
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
type LayoutVariant = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

const PRO_FEATURES = [
  { icon: 'check' as const, text: 'Keep your personalized setup — fonts, colors, background' },
  { icon: 'check' as const, text: 'Your library — upload anything, save words, bookmark favorites' },
  { icon: 'check' as const, text: 'All 12 categories: Philosophy, Poetry, Science & more' },
  { icon: 'check' as const, text: "Unlimited quizzes to track what you're learning" },
];

// Compact feature icons for variant E
const COMPACT_FEATURES = [
  { icon: 'book-open' as const, label: 'Library' },
  { icon: 'grid' as const, label: '12 Categories' },
  { icon: 'check-circle' as const, label: 'Quizzes' },
  { icon: 'sliders' as const, label: 'Customize' },
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
  const router = useRouter();
  const { setIsPremium, hapticFeedback } = useSettingsStore();

  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>('A');

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
            style={layoutVariant === 'F' ? styles.previewSectionSmall : styles.previewSection}
          >
            <View
              style={[
                layoutVariant === 'F' ? styles.previewCardSmall : styles.previewCard,
                {
                  backgroundColor: previewBgColor,
                  borderColor: glass.border,
                },
              ]}
            >
              <Text
                style={[
                  layoutVariant === 'F' ? styles.previewTextSmall : styles.previewText,
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

          {/* Features - Standard bullets (variants A-D, G, H) */}
          {!['E', 'F'].includes(layoutVariant) && (
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
          )}

          {/* Features - Compact icons (variant E) */}
          {layoutVariant === 'E' && (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={styles.compactFeaturesRow}
            >
              {COMPACT_FEATURES.map((feature) => (
                <View key={feature.label} style={styles.compactFeatureItem}>
                  <Feather name={feature.icon} size={20} color={colors.primary} />
                  <Text style={[styles.compactFeatureLabel, { color: colors.secondary }]}>
                    {feature.label}
                  </Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Features - Smaller for variant F (smaller preview needs less feature reduction) */}
          {layoutVariant === 'F' && (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={styles.featuresSectionCompact}
            >
              {PRO_FEATURES.map((feature, i) => (
                <View key={feature.text} style={styles.featureRowCompact}>
                  <Feather name="check" size={14} color={colors.primary} />
                  <Text style={[styles.featureTextCompact, { color: colors.secondary }]} numberOfLines={1}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Variant Switcher - DEV ONLY */}
          <View style={styles.variantSwitcher}>
            {(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as LayoutVariant[]).map((v) => (
              <Pressable
                key={v}
                onPress={() => setLayoutVariant(v)}
                style={[
                  styles.variantButton,
                  {
                    backgroundColor: layoutVariant === v ? colors.primary : glass.fill,
                    borderColor: glass.border,
                  },
                ]}
              >
                <Text style={{ color: layoutVariant === v ? colors.bg : colors.primary, fontWeight: '600', fontSize: 12 }}>
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* VARIANT A: Segmented Control */}
          {layoutVariant === 'A' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.variantAContainer}>
              <View style={[styles.segmentedControl, { backgroundColor: glass.fill, borderColor: glass.border }]}>
                {(['monthly', 'weekly', 'lifetime'] as Plan[]).map((plan) => (
                  <Pressable
                    key={plan}
                    onPress={() => handleSelectPlan(plan)}
                    style={[
                      styles.segmentButton,
                      selectedPlan === plan && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={[
                      styles.segmentText,
                      { color: selectedPlan === plan ? colors.bg : colors.primary },
                    ]}>
                      {plan === 'monthly' ? 'Monthly' : plan === 'weekly' ? 'Weekly' : 'Lifetime'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.planDetail, { backgroundColor: glass.fill, borderColor: glass.border }]}>
                <Text style={[styles.planDetailPrice, { color: colors.primary }]}>
                  {selectedPlan === 'monthly' ? '$9.99' : selectedPlan === 'weekly' ? '$2.99' : '$24.99'}
                  <Text style={[styles.planDetailPeriod, { color: colors.muted }]}>
                    {selectedPlan === 'monthly' ? '/month' : selectedPlan === 'weekly' ? '/week' : ''}
                  </Text>
                </Text>
                <Text style={[styles.planDetailSub, { color: colors.muted }]}>
                  {selectedPlan === 'monthly' ? 'Just $0.33/day · MOST POPULAR' :
                   selectedPlan === 'weekly' ? '$0.43/day · Try it first' :
                   'One-time payment · BEST VALUE'}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* VARIANT B: Compact Horizontal Cards */}
          {layoutVariant === 'B' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.planRowCompact}>
              <Pressable
                onPress={() => handleSelectPlan('monthly')}
                style={[
                  styles.planCardCompact,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'monthly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.planNameCompact, { color: colors.muted }]}>POPULAR</Text>
                <Text style={[styles.planPriceCompact, { color: colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>$9.99</Text>
                <Text style={[styles.planLabelCompact, { color: colors.primary }]}>Monthly</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('weekly')}
                style={[
                  styles.planCardCompact,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'weekly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'weekly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.planNameCompact, { color: 'transparent' }]}>.</Text>
                <Text style={[styles.planPriceCompact, { color: colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>$2.99</Text>
                <Text style={[styles.planLabelCompact, { color: colors.primary }]}>Weekly</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('lifetime')}
                style={[
                  styles.planCardCompact,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'lifetime' ? 1.5 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.planNameCompact, { color: '#22C55E' }]}>BEST</Text>
                <Text style={[styles.planPriceCompact, { color: colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>$24.99</Text>
                <Text style={[styles.planLabelCompact, { color: colors.primary }]}>Lifetime</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* VARIANT C: Vertical List (compact) */}
          {layoutVariant === 'C' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.variantCContainer}>
              {[
                { plan: 'monthly' as Plan, price: '$9.99', label: 'Monthly', badge: 'MOST POPULAR', badgeColor: colors.primary },
                { plan: 'weekly' as Plan, price: '$2.99', label: 'Weekly', badge: null, badgeColor: null },
                { plan: 'lifetime' as Plan, price: '$24.99', label: 'Lifetime', badge: 'BEST VALUE', badgeColor: '#22C55E' },
              ].map((item) => (
                <Pressable
                  key={item.plan}
                  onPress={() => handleSelectPlan(item.plan)}
                  style={[
                    styles.planRowItem,
                    {
                      backgroundColor: glass.fill,
                      borderColor: selectedPlan === item.plan ? colors.primary : glass.border,
                      borderWidth: selectedPlan === item.plan ? 1.5 : 0.5,
                    },
                  ]}
                >
                  <View style={styles.planRowItemLeft}>
                    <Text style={[styles.planRowItemLabel, { color: colors.primary }]}>{item.label}</Text>
                    {item.badge && (
                      <View style={[styles.planRowItemBadge, { backgroundColor: item.badgeColor }]}>
                        <Text style={styles.planRowItemBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planRowItemPrice, { color: colors.primary }]}>{item.price}</Text>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* VARIANT D: 2 Main + Expandable Weekly */}
          {layoutVariant === 'D' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.variantDContainer}>
              <View style={styles.planRowTwo}>
                <Pressable
                  onPress={() => handleSelectPlan('monthly')}
                  style={[
                    styles.planCardTwo,
                    {
                      backgroundColor: glass.fill,
                      borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                      borderWidth: selectedPlan === 'monthly' ? 1.5 : 0.5,
                    },
                  ]}
                >
                  <Text style={[styles.planBadgeTextD, { color: colors.primary }]}>MOST POPULAR</Text>
                  <Text style={[styles.planPriceD, { color: colors.primary }]}>$9.99</Text>
                  <Text style={[styles.planLabelD, { color: colors.muted }]}>Monthly</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSelectPlan('lifetime')}
                  style={[
                    styles.planCardTwo,
                    {
                      backgroundColor: glass.fill,
                      borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                      borderWidth: selectedPlan === 'lifetime' ? 1.5 : 0.5,
                    },
                  ]}
                >
                  <Text style={[styles.planBadgeTextD, { color: '#22C55E' }]}>BEST VALUE</Text>
                  <Text style={[styles.planPriceD, { color: colors.primary }]}>$24.99</Text>
                  <Text style={[styles.planLabelD, { color: colors.muted }]}>Lifetime</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => handleSelectPlan('weekly')}
                style={[
                  styles.weeklyLink,
                  selectedPlan === 'weekly' && { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
                ]}
              >
                <Text style={[styles.weeklyLinkText, { color: selectedPlan === 'weekly' ? colors.primary : colors.muted }]}>
                  {selectedPlan === 'weekly' ? '✓ Weekly selected · $2.99/week' : 'Or try weekly · $2.99/week'}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* VARIANT E: Compact Features + Horizontal Cards */}
          {layoutVariant === 'E' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.planRowE}>
              <Pressable
                onPress={() => handleSelectPlan('monthly')}
                style={[
                  styles.planCardE,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'monthly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.planBadgeE, { color: colors.primary }]}>POPULAR</Text>
                <Text style={[styles.planPriceE, { color: colors.primary }]}>$9.99</Text>
                <Text style={[styles.planLabelE, { color: colors.muted }]}>Monthly</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('weekly')}
                style={[
                  styles.planCardE,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'weekly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'weekly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.planBadgeE, { color: 'transparent' }]}>.</Text>
                <Text style={[styles.planPriceE, { color: colors.primary }]}>$2.99</Text>
                <Text style={[styles.planLabelE, { color: colors.muted }]}>Weekly</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('lifetime')}
                style={[
                  styles.planCardE,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'lifetime' ? 1.5 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.planBadgeE, { color: '#22C55E' }]}>BEST</Text>
                <Text style={[styles.planPriceE, { color: colors.primary }]}>$24.99</Text>
                <Text style={[styles.planLabelE, { color: colors.muted }]}>Lifetime</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* VARIANT F: Smaller Preview + Standard Horizontal Cards */}
          {layoutVariant === 'F' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.planRowF}>
              <Pressable
                onPress={() => handleSelectPlan('monthly')}
                style={[
                  styles.planCardF,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'monthly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <View style={[styles.planBadgeF, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.planBadgeTextF, { color: colors.bg }]}>POPULAR</Text>
                </View>
                <Text style={[styles.planNameF, { color: colors.primary }]}>Monthly</Text>
                <Text style={[styles.planPriceF, { color: colors.primary }]}>$9.99</Text>
                <Text style={[styles.planPeriodF, { color: colors.muted }]}>$0.33/day</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('weekly')}
                style={[
                  styles.planCardF,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'weekly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'weekly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.planNameF, { color: colors.primary, marginTop: 18 }]}>Weekly</Text>
                <Text style={[styles.planPriceF, { color: colors.primary }]}>$2.99</Text>
                <Text style={[styles.planPeriodF, { color: colors.muted }]}>$0.43/day</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('lifetime')}
                style={[
                  styles.planCardF,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'lifetime' ? 1.5 : 0.5,
                  },
                ]}
              >
                <View style={[styles.planBadgeF, { backgroundColor: '#22C55E' }]}>
                  <Text style={[styles.planBadgeTextF, { color: '#FFF' }]}>BEST</Text>
                </View>
                <Text style={[styles.planNameF, { color: colors.primary }]}>Lifetime</Text>
                <Text style={[styles.planPriceF, { color: colors.primary }]}>$24.99</Text>
                <Text style={[styles.planPeriodF, { color: colors.muted }]}>One-time</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* VARIANT G: Refined Vertical List */}
          {layoutVariant === 'G' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.variantGContainer}>
              <Pressable
                onPress={() => handleSelectPlan('monthly')}
                style={[
                  styles.planRowG,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'monthly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'monthly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <View style={styles.planRowGLeft}>
                  <Text style={[styles.planRowGLabel, { color: colors.primary }]}>Monthly</Text>
                  <Text style={[styles.planRowGSub, { color: colors.muted }]}>$0.33/day</Text>
                </View>
                <View style={styles.planRowGRight}>
                  <View style={[styles.planRowGBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.planRowGBadgeText}>POPULAR</Text>
                  </View>
                  <Text style={[styles.planRowGPrice, { color: colors.primary }]}>$9.99</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('weekly')}
                style={[
                  styles.planRowG,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'weekly' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'weekly' ? 1.5 : 0.5,
                  },
                ]}
              >
                <View style={styles.planRowGLeft}>
                  <Text style={[styles.planRowGLabel, { color: colors.primary }]}>Weekly</Text>
                  <Text style={[styles.planRowGSub, { color: colors.muted }]}>$0.43/day</Text>
                </View>
                <Text style={[styles.planRowGPrice, { color: colors.primary }]}>$2.99</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectPlan('lifetime')}
                style={[
                  styles.planRowG,
                  {
                    backgroundColor: glass.fill,
                    borderColor: selectedPlan === 'lifetime' ? colors.primary : glass.border,
                    borderWidth: selectedPlan === 'lifetime' ? 1.5 : 0.5,
                  },
                ]}
              >
                <View style={styles.planRowGLeft}>
                  <Text style={[styles.planRowGLabel, { color: colors.primary }]}>Lifetime</Text>
                  <Text style={[styles.planRowGSub, { color: colors.muted }]}>One-time</Text>
                </View>
                <View style={styles.planRowGRight}>
                  <View style={[styles.planRowGBadge, { backgroundColor: '#22C55E' }]}>
                    <Text style={styles.planRowGBadgeText}>BEST</Text>
                  </View>
                  <Text style={[styles.planRowGPrice, { color: colors.primary }]}>$24.99</Text>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* VARIANT H: Segmented + All Prices Visible */}
          {layoutVariant === 'H' && (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.variantHContainer}>
              <View style={[styles.segmentedH, { backgroundColor: glass.fill, borderColor: glass.border }]}>
                {(['monthly', 'weekly', 'lifetime'] as Plan[]).map((plan) => (
                  <Pressable
                    key={plan}
                    onPress={() => handleSelectPlan(plan)}
                    style={[
                      styles.segmentH,
                      selectedPlan === plan && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={[
                      styles.segmentTextH,
                      { color: selectedPlan === plan ? colors.bg : colors.primary },
                    ]}>
                      {plan === 'monthly' ? 'Monthly' : plan === 'weekly' ? 'Weekly' : 'Lifetime'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.pricesRowH}>
                <View style={[styles.priceItemH, selectedPlan === 'monthly' && styles.priceItemHActive]}>
                  <Text style={[styles.priceH, { color: selectedPlan === 'monthly' ? colors.primary : colors.muted }]}>$9.99</Text>
                  <Text style={[styles.priceLabelH, { color: colors.muted }]}>POPULAR</Text>
                </View>
                <View style={[styles.priceItemH, selectedPlan === 'weekly' && styles.priceItemHActive]}>
                  <Text style={[styles.priceH, { color: selectedPlan === 'weekly' ? colors.primary : colors.muted }]}>$2.99</Text>
                  <Text style={[styles.priceLabelH, { color: colors.muted }]}> </Text>
                </View>
                <View style={[styles.priceItemH, selectedPlan === 'lifetime' && styles.priceItemHActive]}>
                  <Text style={[styles.priceH, { color: selectedPlan === 'lifetime' ? colors.primary : colors.muted }]}>$24.99</Text>
                  <Text style={[styles.priceLabelH, { color: '#22C55E' }]}>BEST</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* CTA Section - Fixed at bottom */}
        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          style={[styles.ctaSection, { borderTopColor: glass.border }]}
        >
          <GlassButton
            title={isLoading ? 'Processing...' : (selectedPlan === 'lifetime' ? 'Unlock Forever' : 'Start 3-Day Free Trial')}
            onPress={handlePurchase}
            disabled={isLoading}
          />
          <Text style={[styles.cancelText, { color: colors.muted }]}>
            {selectedPlan !== 'lifetime'
              ? `Auto-renews ${selectedPlan === 'weekly' ? 'weekly' : 'monthly'}. Cancel anytime.`
              : 'One-time purchase. No subscription.'}
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
          <View style={styles.legalRow}>
            <Pressable onPress={() => router.push('/privacy')} hitSlop={8}>
              <Text style={[styles.legalLink, { color: colors.muted }]}>
                Privacy
              </Text>
            </Pressable>
            <Text style={[styles.linkDivider, { color: colors.muted }]}>·</Text>
            <Pressable onPress={() => router.push('/tos')} hitSlop={8}>
              <Text style={[styles.legalLink, { color: colors.muted }]}>
                Terms
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
    paddingVertical: 20,
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
  // Variant Switcher
  variantSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  variantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // VARIANT A: Segmented Control
  variantAContainer: {
    gap: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 0.5,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  planDetail: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  planDetailPrice: {
    fontSize: 32,
    fontWeight: '700',
  },
  planDetailPeriod: {
    fontSize: 16,
    fontWeight: '400',
  },
  planDetailSub: {
    fontSize: 13,
    marginTop: 4,
  },

  // VARIANT B: Compact Horizontal Cards
  planRowCompact: {
    flexDirection: 'row',
    gap: 6,
  },
  planCardCompact: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  planNameCompact: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  planPriceCompact: {
    fontSize: 20,
    fontWeight: '700',
  },
  planLabelCompact: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  // VARIANT C: Vertical List
  variantCContainer: {
    gap: 8,
  },
  planRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  planRowItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planRowItemLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  planRowItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planRowItemBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  planRowItemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },

  // VARIANT D: 2 Cards + Weekly Link
  variantDContainer: {
    gap: 10,
  },
  planRowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  planCardTwo: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  planBadgeTextD: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  planPriceD: {
    fontSize: 24,
    fontWeight: '700',
  },
  planLabelD: {
    fontSize: 13,
    marginTop: 2,
  },
  weeklyLink: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  weeklyLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Compact Features (Variant E)
  compactFeaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  compactFeatureItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  compactFeatureLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Compact Features for Variant F
  featuresSectionCompact: {
    marginBottom: Spacing.md,
    gap: 6,
  },
  featureRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureTextCompact: {
    fontSize: 13,
    flex: 1,
  },

  // Smaller Preview (Variant F)
  previewSectionSmall: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewCardSmall: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  previewTextSmall: {
    fontSize: 24,
    fontWeight: '400',
  },

  // VARIANT E: Horizontal Cards with Compact Features
  planRowE: {
    flexDirection: 'row',
    gap: 8,
  },
  planCardE: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  planBadgeE: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  planPriceE: {
    fontSize: 22,
    fontWeight: '700',
  },
  planLabelE: {
    fontSize: 12,
    marginTop: 2,
  },

  // VARIANT F: Standard Cards with Smaller Preview
  planRowF: {
    flexDirection: 'row',
    gap: 8,
  },
  planCardF: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  planBadgeF: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  planBadgeTextF: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  planNameF: {
    fontSize: 12,
    fontWeight: '600',
  },
  planPriceF: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  planPeriodF: {
    fontSize: 10,
    marginTop: 1,
  },

  // VARIANT G: Refined Vertical List
  variantGContainer: {
    gap: 8,
  },
  planRowG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  planRowGLeft: {
    gap: 2,
  },
  planRowGLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  planRowGSub: {
    fontSize: 12,
  },
  planRowGRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planRowGBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planRowGBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  planRowGPrice: {
    fontSize: 18,
    fontWeight: '700',
  },

  // VARIANT H: Segmented + All Prices
  variantHContainer: {
    gap: 12,
  },
  segmentedH: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 0.5,
  },
  segmentH: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentTextH: {
    fontSize: 14,
    fontWeight: '600',
  },
  pricesRowH: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceItemH: {
    alignItems: 'center',
    opacity: 0.5,
  },
  priceItemHActive: {
    opacity: 1,
  },
  priceH: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceLabelH: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },

  // CTA
  ctaSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 0.5,
  },
  cancelText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '400',
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
