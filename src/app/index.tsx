import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Alert,
  AccessibilityInfo,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Platform,
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
  cancelAnimation,
  Easing,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import type { FeatherIconName } from '../types/icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { useShallow } from 'zustand/react/shallow';
import { categories, FREE_CATEGORY_KEYS, WIND_DOWN_CATEGORY_KEYS } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { PageDots } from '../components/PageDots';
import { TimeGreeting } from '../components/TimeGreeting';
import { ResumeCard } from '../components/ResumeCard';
import { Paywall } from '../components/Paywall';
import { OnboardingPaywall } from '../components/OnboardingPaywall';
import {
  Spacing,
  Springs,
  FontFamilies,
  WordColors,
  BackgroundThemes,
  Radius,
  HitTargets,
} from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';
import { scheduleStreakAtRiskReminder, cleanupOrphanedNotifications, requestNotificationPermissions, scheduleStreakReminder } from '../lib/notifications';
import { getDueWords, getReviewUrgency } from '../lib/spaced-repetition';
import { getCurrentChallenge, getDaysRemainingInWeek } from '../lib/data/challenges';
import { StreakRestoreSheet } from '../components/StreakRestoreSheet';
import { useToastStore } from '../lib/store/toast';

// ─── Onboarding Constants ────────────────────────────────────

const ONBOARDING_WORDS = [
  'One', 'word.', 'Nothing', 'else.', 'Pure', 'focus.', 'Articulate.',
];

// Helper to determine if a color is "dark" (for contrast decisions)
function isColorDark(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

const ONBOARDING_FONTS: FontFamilyKey[] = ['sourceSerif', 'system', 'literata'];

const ONBOARDING_CATEGORIES = categories.filter((c) =>
  (FREE_CATEGORY_KEYS as readonly string[]).includes(c.key)
);

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  story: 'Short Fiction',
  poetry: 'Poems & Verse',
  wisdom: 'Daily Wisdom',
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
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  const wordScale = useSharedValue(0.85);
  const wordOpacity = useSharedValue(0);
  const breatheScale = useSharedValue(1);
  const progressFraction = useSharedValue(0);
  const hintOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
      hintOpacity.value = withTiming(1, { duration: 600 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [hintOpacity]);

  useEffect(() => {
    if (systemReduceMotion) return;
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    return () => {
      cancelAnimation(breatheScale);
      breatheScale.value = 1;
    };
  }, [breatheScale, systemReduceMotion]);

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
        withTiming(1.5, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 1000 })
      );
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 400, easing: Easing.out(Easing.cubic) }),
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
  const { colors, isDark, glass } = useTheme();
  const { fontFamily, setFontFamily, wordColor, setWordColor, backgroundTheme, setBackgroundTheme } = useSettingsStore(useShallow((s) => ({
    fontFamily: s.fontFamily,
    setFontFamily: s.setFontFamily,
    wordColor: s.wordColor,
    setWordColor: s.setWordColor,
    backgroundTheme: s.backgroundTheme,
    setBackgroundTheme: s.setBackgroundTheme,
  })));
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

  // All colors available during onboarding - pro experience for first reading
  const handleColorSelect = useCallback((key: WordColorKey) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setWordColor(key);
    animatePreview();
  }, [hapticEnabled, setWordColor, animatePreview]);

  // Background selection handler
  const handleBackgroundSelect = useCallback((key: string) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBackgroundTheme(key);
    animatePreview();
  }, [hapticEnabled, setBackgroundTheme, animatePreview]);

  const previewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: previewScale.value }],
  }));

  const fontConfig = FontFamilies[fontFamily];
  const previewColor = WordColors.find(c => c.key === wordColor)?.color ?? colors.primary;

  // Get background color for preview
  const selectedBgTheme = BackgroundThemes.find(t => t.key === backgroundTheme);
  const previewBgColor = selectedBgTheme
    ? (isDark ? selectedBgTheme.dark : selectedBgTheme.light)
    : colors.bg;

  // Filter background themes for onboarding (exclude reward-locked ones)
  const onboardingBackgrounds = BackgroundThemes.filter(t => !t.rewardId);

  return (
    <View style={styles.onboardingPage}>
      <View style={styles.personalizeContent}>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[styles.personalizeTitle, { color: colors.primary }]}
        >
          Your reading space.
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={[styles.personalizeSubtitle, { color: colors.secondary }]}
        >
          The right font and color keep you coming back.
        </Animated.Text>

        <View style={[styles.previewArea, { backgroundColor: previewBgColor, borderRadius: Radius.lg }]}>
          <Animated.Text
            style={[
              styles.previewWord,
              {
                color: previewColor,
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
                        color: previewColor,
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

        {/* Color selection */}
        <Animated.View
          entering={FadeIn.delay(350).duration(400)}
          style={styles.colorSelectionRow}
        >
          <View style={styles.colorLabelRow}>
            <Text style={[styles.colorLabel, { color: colors.secondary }]}>
              Color
            </Text>
          </View>
          <View style={styles.colorSwatches}>
            {WordColors.filter(c => !('rewardId' in c)).map((colorOption) => {
              const isSelected = wordColor === colorOption.key;
              const swatchColor = colorOption.color ?? colors.primary;
              return (
                <Pressable
                  key={colorOption.key}
                  onPress={() => handleColorSelect(colorOption.key)}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: swatchColor,
                      borderColor: isSelected ? colors.primary : glass.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Background selection */}
        <Animated.View
          entering={FadeIn.delay(450).duration(400)}
          style={styles.colorSelectionRow}
        >
          <View style={styles.colorLabelRow}>
            <Text style={[styles.colorLabel, { color: colors.secondary }]}>
              Background
            </Text>
          </View>
          <View style={styles.colorSwatches}>
            {onboardingBackgrounds.map((theme) => {
              const isSelected = backgroundTheme === theme.key;
              const swatchColor = theme.darkOnly ? theme.dark : theme.light;
              return (
                <Pressable
                  key={theme.key}
                  onPress={() => handleBackgroundSelect(theme.key)}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: swatchColor,
                      borderColor: isSelected ? colors.primary : glass.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>
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
  isDarkBackground?: boolean;
}

function SelectableCategoryCard({ category, isSelected, hasSelection, onSelect, index, isDarkBackground }: SelectableCategoryCardProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  // Compute contrast-aware colors based on actual background darkness
  const contrastColors = useMemo(() => {
    if (isDarkBackground) {
      // Light colors for dark backgrounds
      return {
        primary: '#FFFFFF',
        secondary: 'rgba(255,255,255,0.7)',
        muted: 'rgba(255,255,255,0.5)',
        border: 'rgba(255,255,255,0.15)',
        borderSelected: 'rgba(255,255,255,0.35)',
        fill: 'rgba(255,255,255,0.08)',
        iconBg: 'rgba(255,255,255,0.08)',
        checkBg: 'rgba(255,255,255,0.15)',
      };
    } else {
      // Default theme colors for light backgrounds
      return {
        primary: colors.primary,
        secondary: colors.secondary,
        muted: colors.muted,
        border: glass.border,
        borderSelected: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
        fill: glass.fill,
        iconBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
        checkBg: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
      };
    }
  }, [isDarkBackground, colors, glass, isDark]);

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
        withTiming(1.02, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
      );
      glowOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      glowSpread.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
      backgroundTint.value = withTiming(1, { duration: 200 });
      checkOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
      checkScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) })
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

  const borderColor = isSelected ? contrastColors.borderSelected : contrastColors.border;

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
                backgroundColor: contrastColors.fill,
                borderColor: borderColor,
                borderWidth: isSelected ? 1 : 0.5,
              },
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDarkBackground ? '#ffffff' : '#000000',
                  borderRadius: 16,
                },
                tintAnimatedStyle,
              ]}
            />
            <View style={styles.selectableCardContent}>
              <View style={styles.selectableContentRow}>
                <View style={[styles.selectableIconCircle, {
                  backgroundColor: contrastColors.iconBg,
                  borderColor: contrastColors.border,
                }]}>
                  <Feather name={category.icon} size={20} color={contrastColors.primary} />
                </View>
                <View style={styles.catColumn}>
                  <Text style={[styles.levelLabel, { color: contrastColors.primary }]}>
                    {category.name}
                  </Text>
                  {CATEGORY_DESCRIPTIONS[category.key] && (
                    <Text style={[styles.catDescription, { color: contrastColors.secondary }]}>
                      {CATEGORY_DESCRIPTIONS[category.key]}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <Animated.View
              style={[
                styles.checkmarkContainer,
                { backgroundColor: contrastColors.checkBg },
                checkContainerStyle,
              ]}
            >
              <Text style={[styles.checkmark, { color: contrastColors.primary }]}>✓</Text>
            </Animated.View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Step 3: Daily Goal (moved to complete.tsx journey step) ──


// ─── Step 4: Your First Reading (Launch) ─────────────────────

function OnboardingLaunch({ onNext }: { onNext: (categoryKey: string) => void }) {
  const { colors, isDark } = useTheme();
  const backgroundTheme = useSettingsStore((s) => s.backgroundTheme);
  const [selected, setSelected] = useState<string | null>(null);

  // Compute if the current background is dark (for contrast)
  const isDarkBackground = useMemo(() => {
    const selectedBgTheme = BackgroundThemes.find((t) => t.key === backgroundTheme);
    if (!selectedBgTheme) return isDark;
    const bgColor = isDark ? selectedBgTheme.dark : selectedBgTheme.light;
    return isColorDark(bgColor);
  }, [backgroundTheme, isDark]);

  // Contrast-aware colors for text
  const textColors = useMemo(() => {
    if (isDarkBackground) {
      return {
        primary: '#FFFFFF',
        secondary: 'rgba(255,255,255,0.7)',
      };
    }
    return {
      primary: colors.primary,
      secondary: colors.secondary,
    };
  }, [isDarkBackground, colors]);

  const handleSelect = (key: string) => {
    setSelected(key);
  };

  return (
    <View style={styles.onboardingPage}>
      <View style={styles.onboardingCenter}>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[styles.personalizeTitle, { color: textColors.primary }]}
        >
          Your first reading.
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={[styles.personalizeSubtitle, { color: textColors.secondary }]}
        >
          Pick what speaks to you. You'll want to come back.
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
              isDarkBackground={isDarkBackground}
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
  const setIsFirstReading = useSettingsStore((s) => s.setIsFirstReading);

  // Page 0: Silent Start
  const handleSilentStartDone = useCallback(() => {
    setPage(1);
  }, []);

  // Page 1: Personalize (font/color/bg)
  const handlePersonalizeDone = useCallback(() => {
    setPage(2);
  }, []);

  // Page 2: Category Selection → Navigate to reading
  // After reading completes, complete.tsx handles: daily goal → paywall
  const handleLaunch = useCallback((categoryKey: string) => {
    setIsFirstReading(true);
    const cat = categories.find((c) => c.key === categoryKey);
    router.replace({
      pathname: '/reading',
      params: { categoryKey, textId: cat?.texts[0]?.id ?? '' },
    });
  }, [setIsFirstReading, router]);

  return (
    <SafeAreaView style={styles.flex}>
      {page === 0 && <OnboardingSilentStart onNext={handleSilentStartDone} />}
      {page === 1 && <OnboardingPersonalize onNext={handlePersonalizeDone} />}
      {page === 2 && <OnboardingLaunch onNext={handleLaunch} />}
      <PageDots total={3} current={page} />
      {__DEV__ && (
        <Pressable
          testID="skip-onboarding"
          onPress={() => {
            useSettingsStore.getState().seedScreenshotData();
          }}
          style={{ position: 'absolute', top: 60, right: 16, backgroundColor: 'rgba(139,92,246,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
        >
          <Text style={{ fontSize: 12, color: '#8B5CF6', fontWeight: '700' }}>SKIP</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

// ─── Home ────────────────────────────────────────────────────

const CORE_CATEGORIES = categories.filter((c) => (FREE_CATEGORY_KEYS as readonly string[]).includes(c.key));
const OTHER_CATEGORIES = categories.filter((c) => !(FREE_CATEGORY_KEYS as readonly string[]).includes(c.key));
const WIND_DOWN_CORE = categories.filter((c) => (WIND_DOWN_CATEGORY_KEYS as readonly string[]).includes(c.key));
const WIND_DOWN_OTHER = categories.filter((c) => !(WIND_DOWN_CATEGORY_KEYS as readonly string[]).includes(c.key));
const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── CategoryTile Component ──────────────────────────────────

interface CategoryTileProps {
  category: typeof categories[0];
  index: number;
  onPress: () => void;
  textCount: number;
  readCount?: number;
  isLocked?: boolean;
}

function CategoryTile({ category, index, onPress, textCount, readCount = 0, isLocked = false }: CategoryTileProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [hapticEnabled, onPress]);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 18, stiffness: 250 });
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={FadeIn.delay(index * 80).duration(400)}
        style={[
          styles.categoryTile,
          animatedStyle,
          {
            backgroundColor: glass.fill,
            borderColor: glass.border,
            opacity: isLocked ? 0.7 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.categoryTileIcon,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            },
          ]}
        >
          <Feather
            name={isLocked ? 'lock' : category.icon}
            size={24}
            color={isLocked ? colors.muted : colors.primary}
          />
        </View>
        <Text style={[styles.categoryTileName, { color: isLocked ? colors.muted : colors.primary }]}>
          {category.name}
        </Text>
        <Text style={[styles.categoryTileCount, { color: colors.muted }]}>
          {readCount > 0 ? `${readCount} of ${textCount}` : `${textCount} texts`}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── MoreTile Component ──────────────────────────────────────

interface MoreTileProps {
  count: number;
  onPress: () => void;
  index: number;
  expanded: boolean;
}

function MoreTile({ count, onPress, index, expanded }: MoreTileProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  }, [hapticEnabled, onPress]);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 18, stiffness: 250 });
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={FadeIn.delay(index * 80).duration(400)}
        style={[
          styles.categoryTile,
          animatedStyle,
          {
            backgroundColor: glass.fill,
            borderColor: glass.border,
          },
        ]}
      >
        <View
          style={[
            styles.categoryTileIcon,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            },
          ]}
        >
          <Feather name={expanded ? 'chevron-up' : 'plus'} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.categoryTileName, { color: colors.primary }]}>
          {expanded ? 'Show less' : 'More'}
        </Text>
        {!expanded && (
          <Text style={[styles.categoryTileCount, { color: colors.muted }]}>
            {count} categories
          </Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Bookshelf Design Variants ──────────────────────────────────────────────

type ShelfVariant = 'A';

interface BookData {
  label: string;
  icon: FeatherIconName;
  count: number;
  isLocked: boolean;
  onPress: (e: any) => void;
}

// Shared press/entry animation hook
function useBookAnimation(index: number) {
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const entryTranslateY = useSharedValue(30);
  const entryOpacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const d = index * 100;
    entryTranslateY.value = withDelay(d, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
    entryOpacity.value = withDelay(d, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: entryTranslateY.value + translateY.value },
      { scale: scale.value },
    ],
    opacity: entryOpacity.value,
  }));

  const handlePressIn = () => {
    translateY.value = withSpring(-8, { damping: 15, stiffness: 200 });
    scale.value = withSpring(1.04, { damping: 15, stiffness: 200 });
  };
  const handlePressOut = () => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 250 });
    scale.value = withSpring(1, { damping: 18, stiffness: 250 });
  };
  const handlePress = (onPress: (e: any) => void) => (e: any) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(e);
  };

  return { animatedStyle, handlePressIn, handlePressOut, handlePress };
}

// ─── VARIANT A: Dark Library Glass ──────────────────────────────────────────

const GOLD_A = { light: '#B8963E', dark: '#8A7530' };

function BookVariantA({ book, index, isDark, glass, themeColors }: { book: BookData; index: number; isDark: boolean; glass: any; themeColors: any }) {
  const { animatedStyle, handlePressIn, handlePressOut, handlePress } = useBookAnimation(index);
  const gold = isDark ? GOLD_A.dark : GOLD_A.light;
  const heights = [148, 148, 148];

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress(book.onPress)} style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View style={[{
        width: '100%', height: heights[index], borderRadius: 8,
        borderWidth: 1, borderColor: isDark ? `${gold}30` : `${gold}25`,
        backgroundColor: glass.fill,
        shadowColor: gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.2 : 0.1, shadowRadius: 8, elevation: 4,
        overflow: 'hidden',
      }, animatedStyle]}>
        <LinearGradient
          colors={[`${gold}12`, 'transparent'] as [string, string]}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50 }}
        />
        <View style={{ position: 'absolute', top: 10, left: 8, right: 8, bottom: 10, borderWidth: 0.5, borderColor: `${gold}35`, borderRadius: 4 }} />
        <View style={{ position: 'absolute', top: 14, left: 12, right: 12, bottom: 14, borderWidth: 0.5, borderColor: `${gold}18`, borderRadius: 2 }} />
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: `${gold}15` }} />

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 0.5, borderColor: `${gold}30`, alignItems: 'center', justifyContent: 'center', backgroundColor: `${gold}08` }}>
            {book.isLocked ? (
              <Feather name="lock" size={15} color={themeColors.muted} />
            ) : (
              <Feather name={book.icon} size={15} color={gold} />
            )}
          </View>
          <Text style={{ color: themeColors.primary, fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>{book.label}</Text>
          <View style={{ width: 16, height: 0.5, backgroundColor: gold, opacity: 0.3 }} />
          {!book.isLocked && book.count > 0 && (
            <Text style={{ color: gold, fontSize: 11, fontWeight: '500', opacity: 0.7 }}>{book.count}</Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function ShelfVariantA({ books, isDark, glass, themeColors }: { books: BookData[]; isDark: boolean; glass: any; themeColors: any }) {
  const gold = isDark ? GOLD_A.dark : GOLD_A.light;
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, alignItems: 'flex-end', zIndex: 2 }}>
        {books.map((b, i) => <BookVariantA key={b.label} book={b} index={i} isDark={isDark} glass={glass} themeColors={themeColors} />)}
      </View>
      <View style={{ marginTop: -2, zIndex: 1, paddingHorizontal: 12 }}>
        <View style={{ height: 2, backgroundColor: gold, opacity: 0.2, borderRadius: 1 }} />
        <View style={{ height: 6, backgroundColor: glass.fill, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, borderWidth: 0.5, borderTopWidth: 0, borderColor: glass.border }} />
        <View style={{ height: 4, marginHorizontal: 8, borderRadius: 2, marginTop: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)' }} />
      </View>
    </View>
  );
}

// ─── VARIANT D: Vintage Collection ──────────────────────────────────────────


function Home() {
  const { colors, isDark, glass } = useTheme();
  const router = useRouter();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [aiTextLoading, setAiTextLoading] = useState(false);
  const [windDownTextLoading, setWindDownTextLoading] = useState(false);
  const {
    resumeData,
    currentStreak,
    isPremium,
    setIsPremium,
    resetAll,
    categoryReadCounts,
    lastReadDate,
    customTexts,
    favoriteTexts,
    savedWords,
    trialActive,
    trialStartDate,
    showPaywall,
    paywallContext,
    savedPremiumSettings,
    savedPremiumSettingsExpiry,
    totalWordsRead,
    textsCompleted,
    reduceMotion,
    windDownMode,
  } = useSettingsStore(useShallow((s) => ({
    resumeData: s.resumeData,
    currentStreak: s.currentStreak,
    isPremium: s.isPremium,
    setIsPremium: s.setIsPremium,
    resetAll: s.resetAll,
    categoryReadCounts: s.categoryReadCounts,
    lastReadDate: s.lastReadDate,
    customTexts: s.customTexts,
    favoriteTexts: s.favoriteTexts,
    savedWords: s.savedWords,
    trialActive: s.trialActive,
    trialStartDate: s.trialStartDate,
    showPaywall: s.showPaywall,
    paywallContext: s.paywallContext,
    savedPremiumSettings: s.savedPremiumSettings,
    savedPremiumSettingsExpiry: s.savedPremiumSettingsExpiry,
    totalWordsRead: s.totalWordsRead,
    textsCompleted: s.textsCompleted,
    reduceMotion: s.reduceMotion,
    windDownMode: s.windDownMode,
  })));
  const dailyAIText = useSettingsStore((s) => s.dailyAIText);
  const dailyAITextDate = useSettingsStore((s) => s.dailyAITextDate);
  const dailyAITextReason = useSettingsStore((s) => s.dailyAITextPersonalizationReason);
  const windDownText = useSettingsStore((s) => s.windDownText);
  const windDownTextDate = useSettingsStore((s) => s.windDownTextDate);
  const lastWordReviewDate = useSettingsStore((s) => s.lastWordReviewDate);
  const pronunciationHistory = useSettingsStore((s) => s.pronunciationHistory);
  const weeklyChallengeProgress = useSettingsStore((s) => s.weeklyChallengeProgress);
  const weeklyChallengeCompleted = useSettingsStore((s) => s.weeklyChallengeCompleted);

  // Stable action references — these don't trigger re-renders
  const checkTrialExpired = useSettingsStore((s) => s.checkTrialExpired);
  const setPaywallContext = useSettingsStore((s) => s.setPaywallContext);
  const trialDaysRemaining = useSettingsStore((s) => s.trialDaysRemaining);
  const resetDailyIfNewDay = useSettingsStore((s) => s.resetDailyIfNewDay);
  const refillStreakAllowancesIfNewMonth = useSettingsStore((s) => s.refillStreakAllowancesIfNewMonth);
  const checkWeeklyChallenge = useSettingsStore((s) => s.checkWeeklyChallenge);

  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const streakFreezes = useSettingsStore((s) => s.streakFreezes);
  const activateStreakFreeze = useSettingsStore((s) => s.activateStreakFreeze);
  const showToast = useToastStore((s) => s.showToast);

  // Breathing border animation for "Your Text" hero card
  const heroBorderOpacity = useSharedValue(0.25);
  useEffect(() => {
    if (reduceMotion) return;
    heroBorderOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion, heroBorderOpacity]);

  const heroBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(${isDark ? '255,255,255' : '0,0,0'}, ${heroBorderOpacity.value})`,
  }));

  // Clean up orphaned notifications and schedule streak at risk on mount
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  useEffect(() => {
    cleanupOrphanedNotifications();
    if (notificationsEnabled && currentStreak > 0) {
      scheduleStreakAtRiskReminder(currentStreak, lastReadDate);
    }
  }, [notificationsEnabled, currentStreak, lastReadDate]);

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

  // Reset daily counters if new day, refill streak allowances, check weekly challenge
  useEffect(() => {
    resetDailyIfNewDay();
    refillStreakAllowancesIfNewMonth();
    checkWeeklyChallenge();
  }, [resetDailyIfNewDay, refillStreakAllowancesIfNewMonth, checkWeeklyChallenge]);

  // Streak "at risk" detection — warn at 20h (4-hour buffer before streak resets at 48h)
  const streakAtRiskDismissedDate = useSettingsStore((s) => s.streakAtRiskDismissedDate);
  const dismissStreakAtRisk = useSettingsStore((s) => s.dismissStreakAtRisk);

  const streakAtRiskInfo = useMemo(() => {
    if (currentStreak <= 0 || lastReadDate === null) return { atRisk: false, hoursRemaining: 0 };
    const now = Date.now();
    const lastMs = new Date(lastReadDate).getTime();
    if (isNaN(lastMs)) return { atRisk: false, hoursRemaining: 0 };
    const elapsed = now - lastMs;
    const HOURS_20 = 20 * 60 * 60 * 1000;
    const HOURS_48 = 48 * 60 * 60 * 1000;
    const atRisk = elapsed >= HOURS_20;
    const hoursRemaining = Math.max(0, (HOURS_48 - elapsed) / (60 * 60 * 1000));
    return { atRisk, hoursRemaining };
  }, [currentStreak, lastReadDate]);

  const isStreakAtRisk = streakAtRiskInfo.atRisk;

  // Show popup only if at risk AND not already dismissed today
  const todayStr = new Date().toISOString().slice(0, 10);
  const showStreakAtRiskPopup = isStreakAtRisk && streakAtRiskDismissedDate !== todayStr;

  const setSelectedCategoryKey = useSettingsStore((s) => s.setSelectedCategoryKey);

  // ─── Shuffle (Surprise Me) ─────────────────────────────────
  const shuffleRotation = useSharedValue(0);

  const shuffleableTexts = useMemo(() => {
    const results: { categoryKey: string; textId: string }[] = [];
    for (const cat of categories) {
      const isAccessible = isPremium || (FREE_CATEGORY_KEYS as readonly string[]).includes(cat.key);
      if (!isAccessible) continue;
      // Wind-down: restrict shuffle to calming categories
      if (windDownMode && !(WIND_DOWN_CATEGORY_KEYS as readonly string[]).includes(cat.key)) continue;
      for (const text of cat.texts) {
        const required = text.requiredReads ?? 0;
        const completed = categoryReadCounts[cat.key] ?? 0;
        if (completed >= required) {
          results.push({ categoryKey: cat.key, textId: text.id });
        }
      }
    }
    return results;
  }, [isPremium, categoryReadCounts, windDownMode]);

  const handleShuffle = useCallback(() => {
    if (shuffleableTexts.length === 0) return;
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Rotation animation (skip if reduceMotion)
    if (!reduceMotion) {
      shuffleRotation.value = 0;
      shuffleRotation.value = withTiming(360, { duration: 400, easing: Easing.out(Easing.cubic) });
      setTimeout(() => {
        const pick = shuffleableTexts[Math.floor(Math.random() * shuffleableTexts.length)];
        setSelectedCategoryKey(pick.categoryKey);
        router.push({
          pathname: '/reading',
          params: { categoryKey: pick.categoryKey, textId: pick.textId },
        });
      }, 200);
    } else {
      const pick = shuffleableTexts[Math.floor(Math.random() * shuffleableTexts.length)];
      setSelectedCategoryKey(pick.categoryKey);
      router.push({
        pathname: '/reading',
        params: { categoryKey: pick.categoryKey, textId: pick.textId },
      });
    }
  }, [shuffleableTexts, hapticEnabled, reduceMotion, shuffleRotation, setSelectedCategoryKey, router]);

  const shuffleIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shuffleRotation.value}deg` }],
  }));

  // ─── Category Press Handler ─────────────────────────────────
  const handleCategoryPress = useCallback(
    (category: typeof categories[0]) => {
      const isLocked = !isPremium && !(FREE_CATEGORY_KEYS as readonly string[]).includes(category.key);

      if (isLocked) {
        setPaywallContext('locked_category');
        return;
      }

      // If only one text, go directly to reading
      if (category.texts.length === 1) {
        router.push({
          pathname: '/reading',
          params: { categoryKey: category.key, textId: category.texts[0]?.id ?? '' },
        });
        return;
      }

      // Otherwise, go to text selection
      setSelectedCategoryKey(category.key);
      router.push({
        pathname: '/text-select',
        params: { categoryKey: category.key },
      });
    },
    [isPremium, setPaywallContext, setSelectedCategoryKey, router]
  );

  // ─── Your Daily Read ──────────────────────────────────────
  const hasTodayAIText = dailyAITextDate === new Date().toDateString() && dailyAIText !== null;

  const handleDailyRead = useCallback(async () => {
    if (!isPremium) {
      setPaywallContext('locked_ai_practice');
      return;
    }
    if (hasTodayAIText && dailyAIText) {
      router.push({
        pathname: '/reading',
        params: { customTextId: dailyAIText.id },
      });
      return;
    }
    setAiTextLoading(true);
    try {
      const { getOrGenerateDailyText } = await import('../lib/ai-text-service');
      const text = await getOrGenerateDailyText();
      router.push({
        pathname: '/reading',
        params: { customTextId: text.id },
      });
    } catch (err) {
      console.error('Daily read generation failed:', err);
      Alert.alert('Error', 'Could not generate your daily read. Please try again later.');
    } finally {
      setAiTextLoading(false);
    }
  }, [isPremium, hasTodayAIText, dailyAIText, setPaywallContext, router]);

  // Tonight's Reading (wind-down exclusive content)
  const hasTodayWindDownText = windDownTextDate === new Date().toDateString() && windDownText !== null;

  const handleTonightsReading = useCallback(async () => {
    if (!isPremium) {
      setPaywallContext('locked_wind_down');
      return;
    }
    if (hasTodayWindDownText && windDownText) {
      router.push({
        pathname: '/reading',
        params: { customTextId: windDownText.id },
      });
      return;
    }
    setWindDownTextLoading(true);
    try {
      const { getOrGenerateWindDownText } = await import('../lib/ai-text-service');
      const text = await getOrGenerateWindDownText();
      router.push({
        pathname: '/reading',
        params: { customTextId: text.id },
      });
    } catch (err) {
      console.error('Wind-down text generation failed:', err);
      Alert.alert('Error', 'Could not generate tonight\'s reading. Please try again later.');
    } finally {
      setWindDownTextLoading(false);
    }
  }, [isPremium, hasTodayWindDownText, windDownText, setPaywallContext, router]);

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
  const insightsCount = textsCompleted;

  // Standalone dueWords memo — used by priority cascade and review nudge JSX
  const dueWords = useMemo(
    () => getDueWords(savedWords, pronunciationHistory),
    [savedWords, pronunciationHistory]
  );

  // Daily read: ready (slim row) vs needs generation (full card)
  const dailyReadReady = windDownMode ? hasTodayWindDownText : hasTodayAIText;
  const showDailyReadGenerate = !dailyReadReady && isPremium;

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={styles.homeHeader}>
        {/* Icons row - at top */}
        <View style={styles.headerIconsTop}>
          <Pressable onPress={() => router.push('/settings')} style={styles.headerButton} accessibilityLabel="Open profile" accessibilityRole="button">
            <Feather name="user" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* Greeting row - below icons */}
        <View style={styles.headerGreeting}>
          <TimeGreeting />
          {/* Upgrade Pill CTA - only for free users */}
          {!isPremium && !trialActive && (
            <Pressable
              onPress={() => setPaywallContext('generic')}
              style={({ pressed }) => [
                styles.upgradePill,
                {
                  backgroundColor: glass.fill,
                  borderColor: glass.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Get Pro"
            >
              <Feather name="star" size={12} color={colors.primary} />
              <Text style={[styles.upgradePillText, { color: colors.primary }]}>
                Get Pro
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Streak at risk sticky banner */}
      {showStreakAtRiskPopup && (
        <Animated.View entering={FadeIn.duration(300)} style={[styles.stickyBannerC, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderLeftColor: colors.primary + '60' }]}>
          <View style={styles.stickyBannerTap}>
            <View style={styles.bannerCRow}>
              <Feather name="zap" size={16} color={colors.primary} />
              <View style={styles.bannerCText}>
                <Text style={[styles.bannerCTitle, { color: colors.primary }]}>
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'} built. Don't start over.
                </Text>
                <Text style={[styles.bannerCSub, { color: colors.muted }]}>
                  One quick read keeps it alive
                </Text>
              </View>
            </View>
            <View style={styles.bannerActions}>
              <Pressable
                style={[styles.bannerActionBtn, { backgroundColor: colors.primary }]}
                hitSlop={HitTargets.hitSlop}
                onPress={() => {
                  dismissStreakAtRisk();
                  const firstCat = CORE_CATEGORIES[0];
                  if (firstCat) {
                    setSelectedCategoryKey(firstCat.key);
                    router.push({ pathname: '/text-select', params: { categoryKey: firstCat.key } });
                  }
                }}
              >
                <Text style={styles.bannerActionText}>Read Now</Text>
              </Pressable>
              {isPremium && streakFreezes > 0 ? (
                <Pressable
                  style={[styles.bannerActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                  hitSlop={HitTargets.hitSlop}
                  onPress={() => {
                    const success = activateStreakFreeze();
                    if (success) {
                      if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      showToast('Streak frozen until tomorrow', 'shield');
                      dismissStreakAtRisk();
                    }
                  }}
                >
                  <Feather name="shield" size={12} color={colors.secondary} />
                  <Text style={[styles.bannerActionText, { color: colors.secondary }]}>Freeze</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.bannerActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                  hitSlop={HitTargets.hitSlop}
                  onPress={() => {
                    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPaywallContext('streak_freeze');
                  }}
                >
                  <Feather name="shield" size={12} color={colors.muted} />
                  <Text style={[styles.bannerActionText, { color: colors.muted }]}>Freeze (Pro)</Text>
                </Pressable>
              )}
            </View>
          </View>
          <Pressable onPress={() => dismissStreakAtRisk()} hitSlop={HitTargets.hitSlop} style={styles.stickyBannerClose}>
            <Feather name="x" size={14} color={colors.muted} />
          </Pressable>
        </Animated.View>
      )}

      {/* Main content */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.statsRow}>
          <View style={styles.statsLeft}>
            <Feather name="zap" size={14} color={colors.muted} />
            <Text style={[styles.statsText, { color: colors.secondary }]}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{currentStreak}</Text>
              {'-day streak · '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{formatNumber(totalWordsRead)}</Text>
              {' words'}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/insights')} hitSlop={12}>
            <Text style={[styles.insightsLink, { color: colors.primary }]}>Insights →</Text>
          </Pressable>
        </Animated.View>

        {/* Hero: Your Text */}
        <Animated.View entering={FadeIn.delay(120).duration(400)} style={styles.heroSection}>
          <Pressable
            onPress={() => router.push('/paste')}
            accessibilityRole="button"
            accessibilityLabel="Open your text"
          >
            <Animated.View style={[styles.heroCard, { backgroundColor: glass.fill }, heroBorderStyle]}>
              <Text style={[styles.heroCardTitle, { color: colors.primary }]}>
                Your Text
              </Text>
              <Text style={[styles.heroCardSubtitle, { color: colors.secondary }]}>
                Paste, scan, or import any text
              </Text>
              <View style={styles.heroActions}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({ pathname: '/paste', params: { action: 'paste' } });
                  }}
                  style={({ pressed }) => [
                    styles.heroActionButton,
                    styles.heroActionPrimary,
                    { backgroundColor: '#000000', opacity: pressed ? 0.8 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Paste text"
                >
                  <Feather name="clipboard" size={14} color="#FFFFFF" />
                  <Text style={[styles.heroActionText, { color: '#FFFFFF' }]}>
                    Paste
                  </Text>
                </Pressable>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({ pathname: '/paste', params: { action: 'scan' } });
                  }}
                  style={({ pressed }) => [
                    styles.heroActionButton,
                    styles.heroActionPrimary,
                    { backgroundColor: '#000000', opacity: pressed ? 0.8 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Scan text"
                >
                  <Feather name="camera" size={14} color="#FFFFFF" />
                  <Text style={[styles.heroActionText, { color: '#FFFFFF' }]}>
                    Scan
                  </Text>
                </Pressable>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({ pathname: '/paste', params: { action: 'import' } });
                  }}
                  style={({ pressed }) => [
                    styles.heroActionButton,
                    styles.heroActionPrimary,
                    { backgroundColor: '#000000', opacity: pressed ? 0.8 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Import a file"
                >
                  <Feather name="upload" size={14} color="#FFFFFF" />
                  <Text style={[styles.heroActionText, { color: '#FFFFFF' }]}>
                    Import
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Continue card — temporarily hidden to reduce clutter */}
        {/* {resumeData && (
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
        )} */}

        {/* Generate card — shown when no daily text exists yet */}
        {showDailyReadGenerate && (
          <Pressable
            onPress={windDownMode ? handleTonightsReading : handleDailyRead}
            style={({ pressed }) => [
              styles.dailyReadCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                borderColor: glass.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.dailyReadRow}>
              <Feather
                name={windDownMode ? 'moon' : 'book-open'}
                size={18}
                color={windDownMode ? '#D4A574' : colors.primary}
              />
              <View style={styles.dailyReadTextCol}>
                <Text style={[styles.dailyReadTitle, { color: colors.primary }]}>
                  {windDownMode ? "Generate Tonight's Reading" : 'Generate Your Daily Read'}
                </Text>
                <Text style={[styles.dailyReadSub, { color: colors.muted }]} numberOfLines={1}>
                  {windDownMode ? 'A calming passage for bedtime' : 'Personalized to your reading taste'}
                </Text>
              </View>
              {(windDownMode ? windDownTextLoading : aiTextLoading) ? (
                <Text style={{ fontSize: 14, color: colors.muted }}>...</Text>
              ) : (
                <Feather name="chevron-right" size={16} color={colors.muted} />
              )}
            </View>
          </Pressable>
        )}

        {/* Contextual rows: daily read (ready) + review nudge + weekly challenge */}
        <View style={styles.contextualGroup}>
          {/* Daily read — slim row when text is already generated */}
          {dailyReadReady && (
            <Pressable
              onPress={windDownMode ? handleTonightsReading : handleDailyRead}
              style={({ pressed }) => [
                styles.reviewNudge,
                { borderColor: glass.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name={windDownMode ? 'moon' : 'book-open'}
                size={16}
                color={windDownMode ? '#D4A574' : colors.secondary}
              />
              <Text style={[styles.reviewNudgeText, { color: colors.secondary }]} numberOfLines={1}>
                {windDownMode ? "Tonight's Reading" : 'Your Daily Read'}
              </Text>
              <Feather name="chevron-right" size={14} color={colors.muted} />
            </Pressable>
          )}

        </View>

        {/* Categories Grid */}
        <Animated.View entering={FadeIn.delay(140).duration(400)} style={styles.categoriesGrid}>
          {/* Wind-down: show wisdom/poetry/philosophy as main grid */}
          {(windDownMode ? WIND_DOWN_CORE : CORE_CATEGORIES).map((cat, index) => (
            <CategoryTile
              key={cat.key}
              category={cat}
              index={index}
              textCount={cat.texts.length}
              readCount={categoryReadCounts[cat.key] ?? 0}
              onPress={() => handleCategoryPress(cat)}
            />
          ))}

          {/* Expanded: Show remaining categories */}
          {categoriesExpanded && (windDownMode ? WIND_DOWN_OTHER : OTHER_CATEGORIES).map((cat, index) => {
            const isLocked = !isPremium && !(FREE_CATEGORY_KEYS as readonly string[]).includes(cat.key);
            return (
              <CategoryTile
                key={cat.key}
                category={cat}
                index={index + 3}
                textCount={cat.texts.length}
                readCount={categoryReadCounts[cat.key] ?? 0}
                onPress={() => handleCategoryPress(cat)}
                isLocked={isLocked}
              />
            );
          })}

          {/* Toggle tile: +More / Show Less */}
          <MoreTile
            count={(windDownMode ? WIND_DOWN_OTHER : OTHER_CATEGORIES).length}
            onPress={() => setCategoriesExpanded(!categoriesExpanded)}
            index={categoriesExpanded ? (windDownMode ? WIND_DOWN_CORE : CORE_CATEGORIES).length + (windDownMode ? WIND_DOWN_OTHER : OTHER_CATEGORIES).length : 3}
            expanded={categoriesExpanded}
          />
        </Animated.View>

        {/* Surprise Me Button */}
        <Animated.View entering={FadeIn.delay(180).duration(400)}>
          <Pressable
            onPress={handleShuffle}
            style={({ pressed }) => [
              styles.surpriseMeButton,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                borderColor: glass.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Surprise me with a random text"
          >
            <Animated.View style={shuffleIconStyle}>
              <Feather name="shuffle" size={16} color={colors.primary} />
            </Animated.View>
            <Text style={[styles.surpriseMeText, { color: colors.primary }]}>
              Surprise me
            </Text>
          </Pressable>
        </Animated.View>

        {/* Bookshelf Library - Variant Design System */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.bookshelfContainer}>
          {/* DEV tools */}
          {__DEV__ && (
            <View style={styles.variantSwitcher}>
              <Pressable
                testID="seed-screenshots"
                onPress={() => {
                  useSettingsStore.getState().seedScreenshotData();
                  if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }}
                style={[styles.variantBtn, { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.3)' }]}
              >
                <Text style={{ fontSize: 13, letterSpacing: 0.5, color: '#8B5CF6', fontWeight: '700' }}>SEED</Text>
              </Pressable>
              <Pressable
                testID="dev-quiz"
                onPress={() => {
                  router.push({ pathname: '/quiz', params: { categoryKey: 'story', textId: 'story-village' } });
                }}
                style={[styles.variantBtn, { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.3)' }]}
              >
                <Text style={{ fontSize: 13, letterSpacing: 0.5, color: '#22C55E', fontWeight: '700' }}>QUIZ</Text>
              </Pressable>
            </View>
          )}

          <ShelfVariantA
            books={[
              {
                label: 'Words', icon: 'bookmark' as FeatherIconName, count: savedWords.length, isLocked: !isPremium,
                onPress: (e: any) => { e.stopPropagation(); if (!isPremium) { setPaywallContext('locked_library_words'); } else { router.push({ pathname: '/library', params: { tab: 'words' } }); } },
              },
              {
                label: 'Favs', icon: 'heart' as FeatherIconName, count: favoriteTexts.length, isLocked: !isPremium,
                onPress: (e: any) => { e.stopPropagation(); if (!isPremium) { setPaywallContext('locked_library_faves'); } else { router.push({ pathname: '/library', params: { tab: 'favorites' } }); } },
              },
              {
                label: 'Texts', icon: 'file-text' as FeatherIconName, count: customTexts.length, isLocked: false,
                onPress: (e: any) => { e.stopPropagation(); router.push({ pathname: '/library', params: { tab: 'myTexts' } }); },
              },
            ]}
            isDark={isDark}
            glass={glass}
            themeColors={colors}
          />
        </Animated.View>


        {/* Notices */}
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

        {/* 9. Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Streak Restore Sheet (modal) */}
      <StreakRestoreSheet />

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
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);
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
    bottom: 140,
    left: 0,
    right: 0,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 24,
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
  personalizeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: -20,
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
  // Color selection
  colorSelectionRow: {
    alignItems: 'center',
    gap: 12,
  },
  colorLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorLockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Daily Goal wheel picker
  goalSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  goalWheelContainer: {
    height: 56 * 3,
    overflow: 'hidden',
    justifyContent: 'center',
    width: '100%',
  },
  goalHighlightBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 56,
    height: 56,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderRadius: 12,
  },
  goalItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalItemText: {
    textAlign: 'center',
  },
  goalTimeLabel: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  goalDescription: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
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
    flexDirection: 'column',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  headerIconsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerGreeting: {
    // Greeting below icons
  },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  upgradePillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerButton: {
    width: 44, // Apple HIG minimum touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  stickyBannerTap: {
    flex: 1,
  },
  stickyBannerClose: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  stickyBannerC: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderLeftWidth: 3,
  },
  bannerCRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerCText: {
    gap: 1,
  },
  bannerCTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  bannerCSub: {
    fontSize: 12,
    fontWeight: '400',
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginLeft: 26,
  },
  bannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  bannerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  heroSection: {
    marginBottom: Spacing.xl, // Increased for better visual separation
  },
  // Stats Row (inline, above hero)
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '400',
  },
  insightsLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  bannerSection: {
    marginBottom: Spacing.md,
  },
  resumeSection: {
    marginBottom: Spacing.lg,
  },
  // Daily read generate card
  dailyReadCard: {
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  dailyReadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dailyReadTextCol: {
    flex: 1,
    gap: 2,
  },
  dailyReadTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dailyReadSub: {
    fontSize: 13,
    fontWeight: '400',
  },
  // Contextual group (daily read ready + review nudge + weekly challenge)
  contextualGroup: {
    gap: 6,
  },
  // Categories Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: Spacing.md,
  },
  categoryTile: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    aspectRatio: 1.1,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  categoryTileIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTileCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  // Surprise Me Button
  surpriseMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  surpriseMeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Bookshelf Variants
  bookshelfContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  variantSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  variantBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // Library Section
  // Daily goal progress
  dailyGoalRow: {
    marginTop: 10,
    gap: 4,
  },
  dailyGoalBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  dailyGoalFill: {
    height: 4,
    borderRadius: 2,
  },
  dailyGoalText: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
  },
  // Next badge card
  nextBadgeCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    gap: 8,
  },
  nextBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextBadgeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextBadgeProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  nextBadgeProgressFill: {
    height: 6,
    borderRadius: 3,
  },
  nextBadgeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextBadgeProgress: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  nextBadgeAction: {
    fontSize: 12,
    fontWeight: '500',
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
  // Hero "Your Text" card
  heroCard: {
    gap: 14,
    paddingTop: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroCardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 14,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 0.6,
  },
  heroActionPrimary: {
    borderWidth: 0,
  },
  heroActionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Combined Activity card
  activityCard: {
    gap: Spacing.sm,
  },
  activityDivider: {
    height: 0.5,
    marginVertical: Spacing.sm,
  },
  activityLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featuredIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTextGroup: {
    flex: 1,
    gap: 2,
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  featuredMeta: {
    fontSize: 12,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  challengeDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  challengeProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  challengeProgressText: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  // Shuffle / My Words card
  shuffleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shuffleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shuffleTextGroup: {
    flex: 1,
    gap: 2,
  },
  shuffleTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  shuffleSubtitle: {
    fontSize: 12,
  },
  // Review nudge
  reviewNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  reviewNudgeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
  },
  // Notification toggle in onboarding
  notifyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  notifyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifyToggleText: {
    fontSize: 14,
    fontWeight: '400',
  },
  notifyToggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
