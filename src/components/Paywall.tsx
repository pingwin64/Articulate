import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import type { PaywallContext } from '../lib/store/settings';
import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';
import { FontFamilies, WordColors, Spacing } from '../design/theme';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '../lib/purchases';
import type { PurchasesPackage } from 'react-native-purchases';

// ─── Contextual Copy ────────────────────────────────────────

interface ContextualCopy {
  headline: string;
  subheadline: string;
  featureOrder: number[];
}

const FEATURES = [
  { icon: 'check' as const, text: 'Your library — upload anything, save words, bookmark favorites' },
  { icon: 'check' as const, text: 'All 12 categories: Philosophy, Poetry, Science & more' },
  { icon: 'check' as const, text: 'Customize fonts, colors & backgrounds to match your style' },
  { icon: 'check' as const, text: 'Unlimited quizzes to lock in what you learn' },
];

const DEFAULT_ORDER = [0, 1, 2, 3];

function getContextualCopy(context: PaywallContext | null, currentStreak?: number): ContextualCopy {
  switch (context) {
    case 'post_onboarding':
      return {
        headline: "You're off to a great start",
        subheadline: 'Unlock everything to keep the momentum going.',
        featureOrder: DEFAULT_ORDER,
      };
    case 'locked_category':
      return {
        headline: "There's more to explore",
        subheadline: 'Unlock poetry, history, mindfulness, and every future category.',
        featureOrder: [1, 0, 2, 3],
      };
    case 'custom_text_limit':
      return {
        headline: 'Save unlimited texts',
        subheadline: 'Read anything you want, anytime you want.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_font':
      return {
        headline: 'Find your perfect font',
        subheadline: 'Choose from 6 fonts designed for comfortable reading.',
        featureOrder: [2, 0, 1, 3],
      };
    case 'locked_color':
      return {
        headline: 'Set the mood',
        subheadline: 'Pick your perfect reading color from 6 curated options.',
        featureOrder: [2, 0, 1, 3],
      };
    case 'locked_size':
      return {
        headline: 'Size it right',
        subheadline: 'Adjust word size for your most comfortable reading experience.',
        featureOrder: [2, 0, 1, 3],
      };
    case 'locked_bold':
      return {
        headline: 'Sharpen your view',
        subheadline: 'Toggle bold text for sharper, easier reading.',
        featureOrder: [2, 0, 1, 3],
      };
    case 'locked_background':
      return {
        headline: 'Create your space',
        subheadline: 'Set the perfect background for your reading environment.',
        featureOrder: [2, 0, 1, 3],
      };
    case 'locked_autoplay':
      return {
        headline: "Sit back. We've got this.",
        subheadline: 'Let Articulate pace your reading automatically.',
        featureOrder: DEFAULT_ORDER,
      };
    case 'locked_chunk':
      return {
        headline: 'Speed up without losing focus',
        subheadline: 'See 2-3 words at a time for a natural reading flow.',
        featureOrder: DEFAULT_ORDER,
      };
    case 'locked_breathing':
      return {
        headline: 'Breathe. Read. Flow.',
        subheadline: 'Breathing animation syncs your reading with your breath.',
        featureOrder: DEFAULT_ORDER,
      };
    case 'locked_tts':
      return {
        headline: 'Hear every word',
        subheadline: 'Text-to-speech narration speaks each word as you read.',
        featureOrder: DEFAULT_ORDER,
      };
    case 'locked_quiz':
      return {
        headline: 'Did you really get it?',
        subheadline: 'Take a quick quiz to lock in what you just read.',
        featureOrder: [3, 0, 1, 2],
      };
    case 'trial_expired':
      return {
        headline: 'Your customizations are waiting',
        subheadline: 'Your fonts, colors, and settings are saved. Unlock them again.',
        featureOrder: [2, 0, 1, 3],
      };
    case 'locked_daily_upload':
      return {
        headline: 'Upload unlimited texts',
        subheadline: 'Read anything you want, every day — no limits.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_scan':
      return {
        headline: 'Scan any page, anytime',
        subheadline: 'Turn photos into readable text with unlimited scans.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'streak_save':
      return {
        headline: currentStreak && currentStreak > 0
          ? `Don't lose your ${currentStreak}-day streak`
          : "Don't lose your streak",
        subheadline: 'Unlock the full library so you always have something to read.',
        featureOrder: [1, 0, 2, 3],
      };
    case 'goal_almost':
      return {
        headline: "You're almost there",
        subheadline: 'Finish your daily goal faster with auto-play and the full library.',
        featureOrder: [1, 0, 2, 3],
      };
    case 'settings_upgrade':
      return {
        headline: 'Read your way',
        subheadline: 'Unlock all fonts, colors, themes, and reading tools.',
        featureOrder: [2, 0, 1, 3],
      };
    case 'locked_insights':
      return {
        headline: "See how far you've come",
        subheadline: 'Track your reading journey with weekly charts and trends.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_level_up':
      return {
        headline: 'Keep leveling up',
        subheadline: 'Unlock advanced reading levels with AI-generated content.',
        featureOrder: [1, 0, 2, 3],
      };
    case 'locked_word_bank':
      return {
        headline: 'Never forget a word',
        subheadline: 'Save the words that matter. Build a vocabulary that grows with you.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_definition':
      return {
        headline: 'Curious? Go deeper.',
        subheadline: 'Tap any word to unlock its meaning instantly.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_library':
      return {
        headline: 'Build your personal library',
        subheadline: 'Save favorites, custom texts, and build a word bank that grows with you.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_library_words':
      return {
        headline: 'Never forget a word',
        subheadline: 'Save words as you read. Build a vocabulary that grows with you.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_library_faves':
      return {
        headline: 'Keep what matters',
        subheadline: 'Save your favorites and pick up where you left off.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_library_texts':
      return {
        headline: 'Your texts, always ready',
        subheadline: 'Upload anything. Read it your way, anytime.',
        featureOrder: [0, 1, 2, 3],
      };
    case 'locked_pronunciation':
      return {
        headline: 'Practice saying it',
        subheadline: 'Record yourself and get instant pronunciation feedback.',
        featureOrder: DEFAULT_ORDER,
      };
    case 'generic':
    default:
      return {
        headline: 'Unlock the full\nexperience',
        subheadline: 'Get unlimited access to everything Articulate has to offer.',
        featureOrder: DEFAULT_ORDER,
      };
  }
}

// ─── Component ──────────────────────────────────────────────

type Plan = 'weekly' | 'monthly' | 'lifetime';

interface PaywallProps {
  visible: boolean;
  onDismiss: () => void;
  onSubscribe?: () => void;
  context?: PaywallContext | null;
  /** When true, render content directly without wrapping in a Modal (for use inside a route) */
  inline?: boolean;
}

export function Paywall({ visible, onDismiss, onSubscribe, context: propContext, inline }: PaywallProps) {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const {
    setIsPremium,
    hapticFeedback,
    currentStreak,
    trialFeaturesUsed,
    savedPremiumSettings,
    paywallContext: storeContext,
    setPaywallContext,
    incrementPaywallDismiss,
  } = useSettingsStore();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch offerings when paywall opens
  useEffect(() => {
    if (visible) {
      getOfferings().then(setPackages).catch((e) => { if (__DEV__) console.warn('[Paywall] Failed to load offerings:', e); });
    }
  }, [visible]);

  const context = propContext ?? storeContext;
  const copy = useMemo(() => getContextualCopy(context, currentStreak), [context, currentStreak]);
  const orderedFeatures = useMemo(
    () => copy.featureOrder.map((i) => FEATURES[i]),
    [copy.featureOrder]
  );

  // Build trial-expired personalization items
  const trialExpiredItems = useMemo(() => {
    if (context !== 'trial_expired') return [];
    const items: string[] = [];
    for (const feat of trialFeaturesUsed) {
      if (feat.startsWith('font:')) {
        const key = feat.replace('font:', '');
        const fontInfo = FontFamilies[key as keyof typeof FontFamilies];
        if (fontInfo) items.push(`Your ${fontInfo.label} font`);
      } else if (feat.startsWith('color:')) {
        const key = feat.replace('color:', '');
        const colorInfo = WordColors.find((c) => c.key === key);
        if (colorInfo) items.push(`Your ${colorInfo.label} color`);
      } else if (feat === 'bold') {
        items.push('Your bold text style');
      } else if (feat.startsWith('size:')) {
        items.push('Your custom word size');
      } else if (feat.startsWith('background:')) {
        items.push('Your custom background');
      } else if (feat === 'autoplay') {
        items.push('Your auto-play setup');
      } else if (feat === 'breathing') {
        items.push('Your breathing animation');
      } else if (feat === 'chunk') {
        items.push('Your chunk reading settings');
      }
    }
    // Also add from savedPremiumSettings
    if (items.length === 0 && savedPremiumSettings) {
      const fontInfo = FontFamilies[savedPremiumSettings.fontFamily as keyof typeof FontFamilies];
      if (fontInfo && savedPremiumSettings.fontFamily !== 'sourceSerif') {
        items.push(`Your ${fontInfo.label} font`);
      }
      const colorInfo = WordColors.find((c) => c.key === savedPremiumSettings.wordColor);
      if (colorInfo && savedPremiumSettings.wordColor !== 'default') {
        items.push(`Your ${colorInfo.label} color`);
      }
      if (savedPremiumSettings.wordBold) {
        items.push('Your bold text style');
      }
      if (savedPremiumSettings.wordSize !== 48) {
        items.push('Your custom word size');
      }
      if (savedPremiumSettings.backgroundTheme !== 'default') {
        items.push('Your custom background');
      }
    }
    return items;
  }, [context, trialFeaturesUsed, savedPremiumSettings]);

  const showStreakLine = currentStreak >= 1;

  const handleSubscribe = async () => {
    // Find the matching package
    const pkg = packages.find((p) => {
      const id = p.packageType;
      if (selectedPlan === 'weekly') return id === 'WEEKLY';
      if (selectedPlan === 'monthly') return id === 'MONTHLY';
      if (selectedPlan === 'lifetime') return id === 'LIFETIME';
      return false;
    }) ?? packages[0];

    if (pkg) {
      setIsLoading(true);
      try {
        const success = await purchasePackage(pkg);
        if (success) {
          if (hapticFeedback) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          onSubscribe?.();
          setPaywallContext(null);
          onDismiss();
        }
      } catch {
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (__DEV__) {
        // Dev/simulator fallback: grant premium for testing
        if (hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setIsPremium(true);
        onSubscribe?.();
        setPaywallContext(null);
        onDismiss();
      } else {
        // Production: offerings failed to load, show error
        Alert.alert(
          'Unable to Load',
          'Unable to load subscription options. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleRestore = async () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Restored', 'Your purchases have been restored.');
        setPaywallContext(null);
        onDismiss();
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found for this account.');
      }
    } catch {
      Alert.alert('Restore Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlan(plan);
  };

  const handleClose = () => {
    incrementPaywallDismiss();
    setPaywallContext(null);
    onDismiss();
  };

  const TRIAL_DAYS = 3; // Sync with RevenueCat offering

  // Context-aware CTA text
  const getContextCTA = (): string => {
    switch (context) {
      case 'custom_text_limit':
      case 'locked_daily_upload':
        return 'Unlock Unlimited Uploads';
      case 'locked_category':
        return 'Unlock All Categories';
      case 'locked_tts':
        return 'Get Text-to-Speech';
      case 'locked_quiz':
        return 'Test Yourself';
      case 'locked_font':
      case 'locked_color':
      case 'locked_background':
        return 'Unlock All Customization';
      case 'locked_size':
      case 'locked_bold':
        return 'Customize Your View';
      case 'locked_autoplay':
        return 'Go Hands-Free';
      case 'locked_chunk':
        return 'Read Faster';
      case 'locked_breathing':
        return 'Find Your Flow';
      case 'streak_save':
        return 'Protect Your Streak';
      case 'locked_word_bank':
        return 'Start Saving Words';
      case 'locked_definition':
        return 'Unlock Definitions';
      case 'locked_scan':
        return 'Start Scanning';
      case 'locked_insights':
        return 'See Your Journey';
      case 'locked_level_up':
        return 'Unlock Advanced Content';
      case 'locked_library':
        return 'Open Your Library';
      case 'locked_library_words':
        return 'Start Saving Words';
      case 'locked_library_faves':
        return 'Save Your Favorites';
      case 'locked_library_texts':
        return 'Upload Your Texts';
      case 'locked_pronunciation':
        return 'Practice Pronunciation';
      case 'settings_upgrade':
        return 'Unlock All Settings';
      case 'trial_expired':
        return 'Get Them Back';
      case 'post_onboarding':
        return 'Keep Going';
      case 'goal_almost':
        return 'Finish Strong';
      default:
        return 'Continue';
    }
  };

  // CTA includes trial info for subscription plans
  const ctaText = selectedPlan === 'lifetime'
    ? 'Unlock Forever'
    : 'Start 3-Day Free Trial';

  // Helper to get price string from packages or fallback
  const getPriceString = (type: string, fallback: string): string => {
    const pkg = packages.find((p) => p.packageType === type);
    return pkg?.product?.priceString ?? fallback;
  };

  // Compute daily cost from package price (avoids hardcoded strings)
  const getDailyRate = (type: string, days: number, fallback: string): string => {
    const pkg = packages.find((p) => p.packageType === type);
    if (pkg?.product?.price) {
      return `~$${(pkg.product.price / days).toFixed(2)}/day`;
    }
    return fallback;
  };

  // All 4 features (already compact)
  const compactFeatures = orderedFeatures;

  const content = (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.flex}>
          {/* Close */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={22} color={colors.secondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Social Proof */}
            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.socialProofContainer}>
              <View style={[styles.socialProofPill, { backgroundColor: glass.fill }]}>
                <Feather name="users" size={14} color={colors.secondary} />
                <Text style={[styles.socialProofText, { color: colors.secondary }]}>
                  Join 10,000+ focused readers
                </Text>
              </View>
            </Animated.View>

            {/* Hero - Compact */}
            <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.headlineSection}>
              <Text style={[styles.headline, { color: colors.primary }]}>
                {copy.headline}
              </Text>
              <Text style={[styles.subheadline, { color: colors.secondary }]}>
                {copy.subheadline}
              </Text>
            </Animated.View>

            {/* Feature Highlights - Compact checkmarks, BEFORE prices */}
            <Animated.View entering={FadeIn.delay(150).duration(400)} style={styles.featureSection}>
              {compactFeatures.map((feature) => (
                <View key={feature.text} style={styles.featureRowCompact}>
                  <Feather name="check" size={16} color={colors.success} />
                  <Text style={[styles.featureTextCompact, { color: colors.secondary }]}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {/* Plan Selection - After features (standard paywall flow) */}
            <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.planSection}>
              <View style={styles.planRow}>
                {/* Monthly - Featured */}
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
                  <View style={[styles.bestValueBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.bestValueText, { color: colors.bg }]}>
                      MOST POPULAR
                    </Text>
                  </View>
                  <Text style={[styles.planName, { color: colors.primary }]}>
                    Monthly
                  </Text>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    {getPriceString('MONTHLY', '$9.99')}
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.muted }]}>
                    Just $0.33/day
                  </Text>
                </Pressable>

                {/* Weekly */}
                <Pressable
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: glass.fill,
                      borderColor: selectedPlan === 'weekly' ? colors.primary : glass.border,
                      borderWidth: selectedPlan === 'weekly' ? 1.5 : 0.5,
                    },
                  ]}
                  onPress={() => handleSelectPlan('weekly')}
                >
                  <Text style={[styles.planName, { color: colors.primary }]}>
                    Weekly
                  </Text>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    {getPriceString('WEEKLY', '$2.99')}
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.muted }]}>
                    $0.43/day
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
                  <View style={[styles.lifetimeBadge, { backgroundColor: '#22C55E' }]}>
                    <Text style={[styles.bestValueText, { color: '#FFF' }]}>
                      BEST VALUE
                    </Text>
                  </View>
                  <Text style={[styles.planName, { color: colors.primary }]}>
                    Lifetime
                  </Text>
                  <Text
                    style={[styles.planPrice, { color: colors.primary }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {getPriceString('LIFETIME', '$24.99')}
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.muted }]}>
                    One-time
                  </Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Trial-Expired Personalization */}
            {context === 'trial_expired' && trialExpiredItems.length > 0 && (
              <Animated.View entering={FadeIn.delay(250).duration(400)}>
                <GlassCard>
                  <Text style={[styles.trialExpiredTitle, { color: colors.primary }]}>
                    What you'll get back
                  </Text>
                  <View style={styles.trialExpiredList}>
                    {trialExpiredItems.slice(0, 3).map((item) => (
                      <View key={item} style={styles.trialExpiredRow}>
                        <Feather name="check" size={14} color={colors.success} />
                        <Text style={[styles.trialExpiredItem, { color: colors.secondary }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </Animated.View>
            )}
          </ScrollView>

          {/* CTAs - Fixed at bottom */}
          <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.ctaContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <GlassButton title={ctaText} onPress={handleSubscribe} />
            )}
            {/* App Store required subscription disclosure */}
            <Text style={[styles.subscriptionTerms, { color: colors.muted }]}>
              {selectedPlan !== 'lifetime'
                ? `Auto-renews ${selectedPlan === 'weekly' ? 'weekly' : 'monthly'}. Cancel anytime.`
                : 'One-time purchase. No subscription.'}
            </Text>
            <View style={styles.secondaryRow}>
              <Pressable onPress={handleRestore} disabled={isLoading} hitSlop={12}>
                <Text style={[styles.secondaryLink, { color: colors.muted }]}>
                  Restore Purchase
                </Text>
              </Pressable>
              <Text style={[styles.dot, { color: colors.muted }]}>{'\u00B7'}</Text>
              <Pressable onPress={handleClose} disabled={isLoading} hitSlop={12}>
                <Text style={[styles.secondaryLink, { color: colors.muted }]}>
                  Continue Free
                </Text>
              </Pressable>
            </View>
            <View style={styles.legalRow}>
              <Pressable onPress={() => { handleClose(); router.push('/privacy'); }} hitSlop={8}>
                <Text style={[styles.legalLink, { color: colors.muted }]}>
                  Privacy
                </Text>
              </Pressable>
              <Text style={[styles.dot, { color: colors.muted }]}>{'\u00B7'}</Text>
              <Pressable onPress={() => { handleClose(); router.push('/tos'); }} hitSlop={8}>
                <Text style={[styles.legalLink, { color: colors.muted }]}>
                  Terms
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
  );

  if (inline) {
    return visible ? content : null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      {content}
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
    width: 44, // Apple HIG minimum touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: 16,
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 16,
  },
  headlineSection: {
    alignItems: 'center',
    gap: 6,
  },
  headline: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  streakLine: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  // Social proof
  socialProofContainer: {
    alignItems: 'center',
  },
  socialProofPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  socialProofText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Features
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
  // Trial expired personalization
  trialExpiredTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  trialExpiredList: {
    gap: 10,
  },
  trialExpiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trialExpiredItem: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
  },
  // Plans
  planSection: {
    gap: 8,
  },
  planRow: {
    flexDirection: 'row',
    gap: 8,
  },
  planCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderCurve: 'continuous',
    gap: 2,
    minHeight: 100,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  lifetimeBadge: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  planName: {
    fontSize: 13,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 11,
    fontWeight: '400',
  },
  planNote: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
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
  // Compact feature list (no card wrapper)
  featureSection: {
    gap: 10,
    paddingHorizontal: 4,
  },
  featureRowCompact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureTextCompact: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    lineHeight: 18,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    gap: 10,
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
  subscriptionTerms: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '400',
  },
});
