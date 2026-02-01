import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { PageDots } from '../components/PageDots';
import { TimeGreeting } from '../components/TimeGreeting';
import { ResumeCard } from '../components/ResumeCard';
import { CategoryCard } from '../components/CategoryCard';
import { Paywall } from '../components/Paywall';
import {
  Spacing,
  Springs,
  FontFamilies,
  WordColors,
  Radius,
} from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';

// ─── Onboarding Constants ────────────────────────────────────

const ONBOARDING_WORDS = [
  'One', 'word.', 'Nothing', 'else.', 'Pure', 'focus.', 'Articulate.',
];

const ONBOARDING_FONTS: FontFamilyKey[] = ['sourceSerif', 'system', 'literata'];

const ONBOARDING_CATEGORIES = categories.filter((c) =>
  ['story', 'article', 'speech'].includes(c.key)
);

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  story: 'Short Fiction',
  article: 'News & Essays',
  speech: 'Famous Speeches',
};

// ─── AnimatedCharacters Helper ───────────────────────────────

function AnimatedLetter({
  char,
  index,
  totalChars,
  style,
  delayOffset,
}: {
  char: string;
  index: number;
  totalChars: number;
  style: any;
  delayOffset: number;
}) {
  const letterOpacity = useSharedValue(0);
  const letterTracking = useSharedValue(20);

  useEffect(() => {
    const delay = delayOffset + index * 80;
    letterOpacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    letterTracking.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: letterOpacity.value,
    marginRight: letterTracking.value,
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {char}
    </Animated.Text>
  );
}

function AnimatedCharacters({
  text,
  style,
  delayOffset = 0,
}: {
  text: string;
  style: any;
  delayOffset?: number;
}) {
  const chars = text.split('');

  return (
    <View style={styles.characterRow}>
      {chars.map((char, i) => (
        <AnimatedLetter
          key={`${char}-${i}`}
          char={char}
          index={i}
          totalChars={chars.length}
          style={style}
          delayOffset={delayOffset}
        />
      ))}
    </View>
  );
}

// ─── Step 1: The Silent Start ────────────────────────────────

function OnboardingSilentStart({ onNext }: { onNext: () => void }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const [wordIndex, setWordIndex] = useState(-1);
  const [showHint, setShowHint] = useState(false);

  const wordScale = useSharedValue(0.85);
  const wordOpacity = useSharedValue(0);
  const breatheScale = useSharedValue(1);
  const progressFraction = useSharedValue(0);
  const hintOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
      hintOpacity.value = withTiming(1, { duration: 600 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [hintOpacity]);

  useEffect(() => {
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [breatheScale]);

  const handleTap = useCallback(() => {
    const nextIndex = wordIndex + 1;
    if (nextIndex >= ONBOARDING_WORDS.length) {
      onNext();
      return;
    }

    if (showHint && nextIndex === 0) {
      hintOpacity.value = withTiming(0, { duration: 300 });
    }

    const isFinalWord = nextIndex === ONBOARDING_WORDS.length - 1;

    if (hapticEnabled) {
      Haptics.impactAsync(
        isFinalWord
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }

    setWordIndex(nextIndex);

    if (isFinalWord) {
      wordOpacity.value = 1;
      wordScale.value = 1;
      glowScale.value = 0;
      glowOpacity.value = 0;
      glowScale.value = withSequence(
        withSpring(1.5, { damping: 10, stiffness: 80 }),
        withTiming(0, { duration: 1000 })
      );
      glowOpacity.value = withSequence(
        withSpring(0.8, { damping: 10, stiffness: 80 }),
        withTiming(0, { duration: 1000 })
      );
    } else {
      wordOpacity.value = 0;
      wordOpacity.value = withTiming(1, { duration: 200 });
      wordScale.value = 0.85;
      wordScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }

    progressFraction.value = withTiming(
      (nextIndex + 1) / ONBOARDING_WORDS.length,
      { duration: 300, easing: Easing.out(Easing.ease) }
    );
  }, [wordIndex, showHint, hapticEnabled, onNext, wordScale, wordOpacity, progressFraction, hintOpacity, glowScale, glowOpacity]);

  const wordStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: wordScale.value * breatheScale.value },
    ],
    opacity: wordOpacity.value,
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressFraction.value }],
  }));

  return (
    <Pressable style={styles.onboardingPage} onPress={handleTap}>
      <View style={styles.silentCenter}>
        {wordIndex >= 0 && (
          wordIndex === ONBOARDING_WORDS.length - 1 ? (
            <AnimatedCharacters
              text="Articulate."
              style={[styles.silentWord, { color: colors.primary }]}
            />
          ) : (
            <Animated.Text
              style={[styles.silentWord, { color: colors.primary }, wordStyle]}
            >
              {ONBOARDING_WORDS[wordIndex]}
            </Animated.Text>
          )
        )}
        <Animated.Text
          style={[styles.hintText, { color: colors.muted }, hintStyle]}
        >
          Tap anywhere
        </Animated.Text>
      </View>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressLine,
            { backgroundColor: colors.primary },
            progressStyle,
          ]}
        />
      </View>
    </Pressable>
  );
}

// ─── Step 2: Make It Yours (Personalize) ─────────────────────

function OnboardingPersonalize({ onNext }: { onNext: () => void }) {
  const { colors, isDark } = useTheme();
  const { fontFamily, setFontFamily, wordColor, setWordColor } = useSettingsStore();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const previewScale = useSharedValue(1);

  const animatePreview = useCallback(() => {
    previewScale.value = withSequence(
      withSpring(1.05, Springs.default),
      withSpring(1, Springs.default)
    );
  }, [previewScale]);

  const handleFontSelect = useCallback((key: FontFamilyKey) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFontFamily(key);
    animatePreview();
  }, [hapticEnabled, setFontFamily, animatePreview]);

  const handleColorSelect = useCallback((key: WordColorKey) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setWordColor(key);
    animatePreview();
  }, [hapticEnabled, setWordColor, animatePreview]);

  const previewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: previewScale.value }],
  }));

  const resolvedColor = WordColors.find((c) => c.key === wordColor)?.color ?? colors.primary;
  const fontConfig = FontFamilies[fontFamily];

  return (
    <View style={styles.onboardingPage}>
      <View style={styles.personalizeContent}>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[styles.personalizeTitle, { color: colors.primary }]}
        >
          Make it yours.
        </Animated.Text>

        <View style={styles.previewArea}>
          <Animated.Text
            style={[
              styles.previewWord,
              {
                color: resolvedColor,
                fontFamily: fontConfig.regular,
              },
              previewStyle,
            ]}
          >
            Articulate
          </Animated.Text>
        </View>

        <View style={styles.fontRow}>
          {ONBOARDING_FONTS.map((key, i) => {
            const font = FontFamilies[key];
            const isSelected = fontFamily === key;
            return (
              <Animated.View
                key={key}
                entering={FadeIn.delay(i * 100).duration(400)}
                style={styles.fontCardWrapper}
              >
                <GlassCard
                  onPress={() => handleFontSelect(key)}
                  accentBorder={isSelected}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.fontCardText,
                      {
                        color: colors.primary,
                        fontFamily: font.regular,
                      },
                    ]}
                  >
                    Articulate
                  </Text>
                  <Text style={[styles.fontCardLabel, { color: colors.secondary }]}>
                    {font.label}
                  </Text>
                </GlassCard>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.colorRow}>
          {WordColors.map((c, i) => {
            const dotColor = c.color ?? colors.primary;
            const isSelected = wordColor === c.key;
            return (
              <Animated.View
                key={c.key}
                entering={FadeIn.delay(i * 60).duration(400)}
              >
                <Pressable
                  onPress={() => handleColorSelect(c.key)}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: dotColor,
                      borderWidth: isSelected ? 2.5 : 0,
                      borderColor: isSelected
                        ? isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'
                        : 'transparent',
                    },
                  ]}
                />
              </Animated.View>
            );
          })}
        </View>
      </View>
      <View style={styles.onboardingBottom}>
        <GlassButton title="Continue" onPress={onNext} />
      </View>
    </View>
  );
}

// ─── Selectable Category Card with Luminous Selection ────────

interface SelectableCategoryCardProps {
  category: typeof ONBOARDING_CATEGORIES[0];
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  index: number;
}

function SelectableCategoryCard({ category, isSelected, hasSelection, onSelect, index }: SelectableCategoryCardProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowSpread = useSharedValue(0);
  const backgroundTint = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const dimOpacity = useSharedValue(1);
  const hasAnimated = useSharedValue(false);

  useEffect(() => {
    if (isSelected) {
      if (!hasAnimated.value) {
        hasAnimated.value = true;
      }
      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      scale.value = withSequence(
        withSpring(1.02, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      glowOpacity.value = withTiming(1, { duration: 200 });
      glowSpread.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
      );
      backgroundTint.value = withTiming(1, { duration: 200 });
      checkOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
      checkScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      dimOpacity.value = withTiming(1, { duration: 200 });
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
      glowSpread.value = withTiming(0, { duration: 200 });
      backgroundTint.value = withTiming(0, { duration: 200 });
      checkOpacity.value = withTiming(0, { duration: 100 });
      checkScale.value = withTiming(0, { duration: 100 });
      dimOpacity.value = withTiming(hasSelection ? 0.7 : 1, { duration: 200 });
    }
  }, [isSelected, hasSelection, hapticEnabled]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: dimOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const glowColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
    const spreadValue = glowSpread.value * 8;
    const blurValue = glowSpread.value * 12;
    return {
      opacity: glowOpacity.value,
      boxShadow: `0 0 ${blurValue}px ${spreadValue}px ${glowColor}`,
    };
  });

  const tintAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundTint.value * (isDark ? 0.08 : 0.05),
  }));

  const checkContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const borderColor = isSelected
    ? isDark
      ? 'rgba(255,255,255,0.35)'
      : 'rgba(0,0,0,0.2)'
    : glass.border;

  return (
    <Animated.View entering={FadeIn.delay(index * 120).duration(400)}>
      <Animated.View style={cardAnimatedStyle}>
        <Pressable onPress={onSelect}>
          <Animated.View
            style={[
              styles.selectableCardGlow,
              { borderRadius: 16 },
              glowAnimatedStyle,
            ]}
          />
          <View
            style={[
              styles.selectableCard,
              {
                backgroundColor: glass.fill,
                borderColor: borderColor,
                borderWidth: isSelected ? 1 : 0.5,
              },
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark ? '#ffffff' : '#000000',
                  borderRadius: 16,
                },
                tintAnimatedStyle,
              ]}
            />
            <View style={styles.selectableCardContent}>
              <View style={styles.selectableContentRow}>
                <View style={[styles.selectableIconCircle, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                  borderColor: glass.border,
                }]}>
                  <Feather name={category.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={styles.catColumn}>
                  <Text style={[styles.levelLabel, { color: colors.primary }]}>
                    {category.name}
                  </Text>
                  {CATEGORY_DESCRIPTIONS[category.key] && (
                    <Text style={[styles.catDescription, { color: colors.secondary }]}>
                      {CATEGORY_DESCRIPTIONS[category.key]}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <Animated.View
              style={[
                styles.checkmarkContainer,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
                checkContainerStyle,
              ]}
            >
              <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
            </Animated.View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Step 3: Your First Reading (Launch) ─────────────────────

function OnboardingLaunch({ onNext }: { onNext: (categoryKey: string) => void }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setSelected(key);
  };

  return (
    <View style={styles.onboardingPage}>
      <View style={styles.onboardingCenter}>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[styles.personalizeTitle, { color: colors.primary }]}
        >
          Your first reading.
        </Animated.Text>
        <View style={styles.levelCards}>
          {ONBOARDING_CATEGORIES.map((cat, i) => (
            <SelectableCategoryCard
              key={cat.key}
              category={cat}
              isSelected={selected === cat.key}
              hasSelection={selected !== null}
              onSelect={() => handleSelect(cat.key)}
              index={i}
            />
          ))}
        </View>
      </View>
      <View style={styles.onboardingBottom}>
        <GlassButton
          title="Start reading"
          onPress={() => selected && onNext(selected)}
          disabled={!selected}
        />
      </View>
    </View>
  );
}

// ─── Onboarding Container ────────────────────────────────────

function Onboarding() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const { setReadingLevel } = useSettingsStore();

  const handleSilentStartDone = useCallback(() => {
    setPage(1);
  }, []);

  const handlePersonalizeDone = useCallback(() => {
    setPage(2);
  }, []);

  const handleLaunch = useCallback((categoryKey: string) => {
    setReadingLevel('intermediate');
    const cat = categories.find((c) => c.key === categoryKey);
    router.replace({
      pathname: '/reading',
      params: { categoryKey, textId: cat?.texts[0]?.id ?? '' },
    });
  }, [setReadingLevel, router]);

  return (
    <SafeAreaView style={styles.flex}>
      {page === 0 && <OnboardingSilentStart onNext={handleSilentStartDone} />}
      {page === 1 && <OnboardingPersonalize onNext={handlePersonalizeDone} />}
      {page === 2 && <OnboardingLaunch onNext={handleLaunch} />}
      <PageDots total={3} current={page} />
    </SafeAreaView>
  );
}

// ─── Home ────────────────────────────────────────────────────

const FREE_CATEGORIES = ['story', 'article', 'speech'];
const CORE_CATEGORIES = categories.filter((c) => FREE_CATEGORIES.includes(c.key));
const MORE_CATEGORIES = categories.filter((c) => !FREE_CATEGORIES.includes(c.key));

function Home() {
  const { colors, isDark, glass } = useTheme();
  const router = useRouter();
  const {
    resumeData,
    currentStreak,
    isPremium,
    setIsPremium,
    resetAll,
    lastReadDate,
    customTexts,
    removeCustomText,
    checkTrialExpired,
    trialActive,
    trialStartDate,
    showPaywall,
    setPaywallContext,
    paywallContext,
    trialDaysRemaining,
    savedPremiumSettings,
    savedPremiumSettingsExpiry,
    totalWordsRead,
    textsCompleted,
  } = useSettingsStore();

  const [moreExpanded, setMoreExpanded] = useState(false);
  const chevronRotation = useSharedValue(0);

  const toggleMore = useCallback(() => {
    setMoreExpanded((prev) => {
      const next = !prev;
      chevronRotation.value = withSpring(next ? 1 : 0, Springs.default);
      return next;
    });
  }, [chevronRotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value * 180}deg` }],
  }));

  // Trial countdown
  const daysLeft = trialDaysRemaining();
  const showTrialCountdown = trialActive && daysLeft > 0;

  // Post-trial win-back banner
  const daysSinceExpired = (() => {
    if (isPremium || trialActive || !trialStartDate) return -1;
    const trialEnd = new Date(trialStartDate).getTime() + 3 * 24 * 60 * 60 * 1000;
    return Math.floor((Date.now() - trialEnd) / (24 * 60 * 60 * 1000));
  })();

  const winBackText = (() => {
    if (daysSinceExpired < 0 || isPremium) return null;
    const features: string[] = [];
    if (savedPremiumSettings) {
      if (savedPremiumSettings.fontFamily !== 'sourceSerif') {
        const f = FontFamilies[savedPremiumSettings.fontFamily as keyof typeof FontFamilies];
        if (f) features.push(f.label + ' font');
      }
      if (savedPremiumSettings.wordColor !== 'default') {
        const c = WordColors.find((wc) => wc.key === savedPremiumSettings.wordColor);
        if (c) features.push(c.label + ' color');
      }
    }
    const personalSuffix = features.length > 0
      ? ` Your ${features.join(' and ')} ${features.length === 1 ? 'is' : 'are'} waiting.`
      : '';

    if (daysSinceExpired <= 3) {
      return `Your trial ended. Your settings are saved for 7 days.${personalSuffix}`;
    } else if (daysSinceExpired <= 6) {
      return `Your saved settings expire soon. Upgrade to keep them.${personalSuffix}`;
    } else {
      return 'Upgrade anytime to unlock the full experience.';
    }
  })();

  // Clear expired saved settings (7 days after trial end)
  useEffect(() => {
    if (savedPremiumSettingsExpiry) {
      const expiry = new Date(savedPremiumSettingsExpiry).getTime();
      if (Date.now() > expiry) {
        useSettingsStore.setState({
          savedPremiumSettings: null,
          savedPremiumSettingsExpiry: null,
        });
      }
    }
  }, [savedPremiumSettingsExpiry]);

  // Check trial expiration on mount
  useEffect(() => {
    checkTrialExpired();
  }, [checkTrialExpired]);

  // Streak "at risk" detection — warn at 20h (4-hour buffer before streak resets at 48h)
  const isStreakAtRisk = currentStreak > 0 && lastReadDate !== null && (() => {
    const now = Date.now();
    const lastMs = new Date(lastReadDate).getTime();
    if (isNaN(lastMs)) return false;
    const elapsed = now - lastMs;
    const HOURS_20 = 20 * 60 * 60 * 1000;
    return elapsed >= HOURS_20;
  })();

  const handleCategoryPress = (categoryKey: string) => {
    if (!isPremium && !FREE_CATEGORIES.includes(categoryKey)) {
      setPaywallContext('locked_category');
      return;
    }
    const cat = categories.find((c) => c.key === categoryKey);
    if (cat && cat.texts.length > 1) {
      router.push({
        pathname: '/text-select',
        params: { categoryKey },
      });
    } else if (cat) {
      router.push({
        pathname: '/reading',
        params: { categoryKey, textId: cat.texts[0]?.id ?? '' },
      });
    }
  };

  const handleCustomTextOptions = (id: string) => {
    Alert.alert('Text Options', undefined, [
      {
        text: 'Edit',
        onPress: () => router.push({ pathname: '/paste', params: { editTextId: id } }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeCustomText(id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={styles.homeHeader}>
        <View style={styles.flex} />
        <View style={styles.headerIcons}>
          {__DEV__ && (
            <>
              <Pressable onPress={() => setIsPremium(!isPremium)}>
                <Text style={[styles.devReplay, { color: isPremium ? colors.primary : colors.muted }]}>
                  {isPremium ? 'Pro' : 'Free'}
                </Text>
              </Pressable>
              <Pressable onPress={() => resetAll()}>
                <Text style={[styles.devReplay, { color: colors.muted }]}>
                  Replay
                </Text>
              </Pressable>
            </>
          )}
          <Pressable onPress={() => router.push('/settings')} style={styles.headerButton} accessibilityLabel="Open settings" accessibilityRole="button">
            <Feather name="settings" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Main content */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Greeting */}
        <View style={styles.greetingSection}>
          <TimeGreeting />
        </View>

        {/* 2. Stats row */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.bannerSection}>
          <GlassCard>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="zap" size={14} color={colors.muted} />
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>
                  {currentStreak === 1 ? 'day' : 'days'}
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: glass.border }]} />
              <View style={styles.statItem}>
                <Feather name="book-open" size={14} color={colors.muted} />
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatNumber(totalWordsRead)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>
                  words read
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: glass.border }]} />
              <View style={styles.statItem}>
                <Feather name="check-circle" size={14} color={colors.muted} />
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {textsCompleted}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>
                  completed
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* 3. Banners */}
        {/* Trial countdown banner (active trial) */}
        {showTrialCountdown && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.bannerSection}>
            <GlassCard onPress={() => setPaywallContext('generic')}>
              <View style={styles.trialBanner}>
                <View style={styles.trialBannerText}>
                  <Text style={[
                    styles.trialBannerTitle,
                    { color: daysLeft <= 1 ? colors.warning : colors.primary }
                  ]}>
                    Premium trial: {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Post-trial win-back banner */}
        {!isPremium && !trialActive && winBackText && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.bannerSection}>
            <GlassCard onPress={() => setPaywallContext('trial_expired')}>
              <View style={styles.trialBanner}>
                <View style={styles.trialBannerText}>
                  <Text style={[styles.trialBannerTitle, { color: colors.primary }]}>
                    {daysSinceExpired <= 3 ? 'Your trial ended' : daysSinceExpired <= 6 ? 'Settings expiring soon' : 'Upgrade to Pro'}
                  </Text>
                  <Text style={[styles.trialBannerSubtitle, { color: colors.secondary }]}>
                    {winBackText}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Streak at risk warning */}
        {isStreakAtRisk && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.bannerSection}>
            <Text style={[styles.streakHint, { color: colors.secondary }]}>
              Don't break your {currentStreak}-day streak — read a text today.
            </Text>
          </Animated.View>
        )}

        {/* 4. Resume card */}
        {resumeData && (
          <View style={styles.resumeSection}>
            <Link
              href={{
                pathname: '/reading',
                params: {
                  categoryKey: resumeData.categoryKey,
                  resumeIndex: String(resumeData.wordIndex),
                  ...(resumeData.textId ? { textId: resumeData.textId } : {}),
                  ...(resumeData.customTextId ? { customTextId: resumeData.customTextId } : {}),
                },
              }}
              asChild
            >
              <Link.AppleZoom>
                <ResumeCard data={resumeData} />
              </Link.AppleZoom>
            </Link>
          </View>
        )}

        {/* 5. Paste Text card */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.bannerSection}>
          <GlassCard onPress={() => router.push('/paste')} accentBorder>
            <View style={styles.pasteCard}>
              <View
                style={[
                  styles.pasteCardIcon,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    borderColor: glass.border,
                  },
                ]}
              >
                <Feather name="clipboard" size={20} color={colors.primary} />
              </View>
              <View style={styles.pasteCardText}>
                <Text style={[styles.pasteCardTitle, { color: colors.primary }]}>
                  Paste Text
                </Text>
                <Text style={[styles.pasteCardSubtitle, { color: colors.secondary }]}>
                  Read any article, passage, or notes
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* 6. My Texts section */}
        {customTexts.length > 0 && (
          <View style={styles.myTextsSection}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
              MY TEXTS
            </Text>
            {customTexts.map((ct, i) => (
              <Animated.View
                key={ct.id}
                entering={FadeIn.delay(i * 80).duration(300)}
                style={styles.customTextCardWrapper}
              >
                <Link
                  href={{
                    pathname: '/reading',
                    params: { customTextId: ct.id },
                  }}
                  asChild
                >
                  <Link.AppleZoom>
                    <GlassCard>
                      <View style={styles.customTextRow}>
                        <View style={styles.customTextInfo}>
                          <Text
                            style={[styles.customTextTitle, { color: colors.primary }]}
                            numberOfLines={1}
                          >
                            {ct.title}
                          </Text>
                          <Text style={[styles.customTextCount, { color: colors.muted }]}>
                            ~{ct.wordCount} words
                          </Text>
                        </View>
                        {/* Spacer for the absolutely positioned options button */}
                        <View style={styles.moreButton} />
                      </View>
                    </GlassCard>
                  </Link.AppleZoom>
                </Link>
                {/* Options button positioned outside Link to avoid gesture conflicts */}
                <Pressable
                  onPress={() => handleCustomTextOptions(ct.id)}
                  style={styles.moreButtonOverlay}
                  hitSlop={8}
                >
                  <Feather name="more-vertical" size={18} color={colors.muted} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}

        {/* 7. Core category cards (Story, Article, Speech) */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoryList}>
            {CORE_CATEGORIES.map((cat, i) => {
              if (cat.texts.length === 1) {
                return (
                  <Link
                    key={cat.key}
                    href={{
                      pathname: '/reading',
                      params: { categoryKey: cat.key, textId: cat.texts[0]?.id ?? '' },
                    }}
                    asChild
                  >
                    <Link.AppleZoom>
                      <CategoryCard
                        category={cat}
                        index={i}
                      />
                    </Link.AppleZoom>
                  </Link>
                );
              }
              return (
                <CategoryCard
                  key={cat.key}
                  category={cat}
                  onPress={() => handleCategoryPress(cat.key)}
                  index={i}
                />
              );
            })}
          </View>
        </View>

        {/* 8. "More to explore" expandable section */}
        <View style={styles.moreSection}>
          <Pressable onPress={toggleMore} style={styles.moreHeader}>
            <Text style={[styles.moreHeaderText, { color: colors.secondary }]}>
              More to explore
            </Text>
            <Animated.View style={chevronStyle}>
              <Feather name="chevron-down" size={18} color={colors.secondary} />
            </Animated.View>
          </Pressable>
          {moreExpanded && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.categoryList}>
              {MORE_CATEGORIES.map((cat, i) => {
                const isLocked = !isPremium && !FREE_CATEGORIES.includes(cat.key);
                return (
                  <CategoryCard
                    key={cat.key}
                    category={cat}
                    onPress={() => handleCategoryPress(cat.key)}
                    locked={isLocked}
                    index={i}
                  />
                );
              })}
            </Animated.View>
          )}
        </View>

        {/* 9. Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Paywall */}
      <Paywall
        visible={showPaywall}
        onDismiss={() => setPaywallContext(null)}
        context={paywallContext}
      />
    </SafeAreaView>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function IndexScreen() {
  const { hasOnboarded } = useSettingsStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      {hasOnboarded ? <Home /> : <Onboarding />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  // Onboarding — shared
  onboardingPage: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  onboardingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  onboardingBottom: {
    paddingBottom: Spacing.lg,
  },
  levelCards: {
    width: '100%',
    gap: 12,
  },
  levelLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catColumn: {
    flex: 1,
    gap: 2,
  },
  catDescription: {
    fontSize: 13,
    fontWeight: '400',
  },
  // Step 1 — Silent Start
  silentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  silentWord: {
    fontSize: 40,
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  hintText: {
    position: 'absolute',
    bottom: 120,
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  shimmerGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  progressLine: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    transformOrigin: 'left',
  },
  characterRow: {
    flexDirection: 'row',
  },
  // Step 2 — Personalize
  personalizeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  personalizeTitle: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  previewArea: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWord: {
    fontSize: 40,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  fontRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  fontCardWrapper: {
    flex: 1,
  },
  fontCardText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 6,
  },
  fontCardLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  // Selectable Category Card (Luminous Selection)
  selectableCard: {
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  selectableCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectableCardContent: {
    padding: 16,
  },
  selectableContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectableIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Home
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  devReplay: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  bannerSection: {
    marginBottom: Spacing.md,
  },
  resumeSection: {
    marginBottom: Spacing.xl,
  },
  categoriesSection: {
    marginTop: Spacing.md,
  },
  categoryList: {
    gap: 12,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
  },
  statDivider: {
    width: 0.5,
    height: 32,
  },
  // More to explore
  moreSection: {
    marginTop: Spacing.md,
  },
  moreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  moreHeaderText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  // Trial banner
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trialBannerText: {
    flex: 1,
    gap: 2,
  },
  trialBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  trialBannerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  // Streak hint
  streakHint: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  // Paste card
  pasteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pasteCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteCardText: {
    flex: 1,
    gap: 2,
  },
  pasteCardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  pasteCardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  // Custom texts
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  myTextsSection: {
    marginTop: Spacing.md,
    gap: 8,
  },
  customTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customTextInfo: {
    flex: 1,
    gap: 2,
  },
  customTextTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  customTextCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTextCardWrapper: {
    position: 'relative',
  },
  moreButtonOverlay: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
