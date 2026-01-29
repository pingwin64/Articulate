import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
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
import { StreakDisplay } from '../components/StreakDisplay';
import { ResumeCard } from '../components/ResumeCard';
import { CategoryCard } from '../components/CategoryCard';
import {
  Spacing,
  Springs,
  FontFamilies,
  WordColors,
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

// ─── AnimatedCharacters Helper ───────────────────────────────

function AnimatedCharacters({
  text,
  style,
  delayOffset = 0,
}: {
  text: string;
  style: any;
  delayOffset?: number;
}) {
  return (
    <View style={styles.characterRow}>
      {text.split('').map((char, i) => (
        <Animated.Text
          key={`${char}-${i}`}
          entering={FadeIn.delay(delayOffset + i * 70).duration(1)}
          style={style}
        >
          {char}
        </Animated.Text>
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

  // Word animation values
  const wordScale = useSharedValue(0.85);
  const wordOpacity = useSharedValue(0);

  // Breathing animation
  const breatheScale = useSharedValue(1);

  // Progress line (using scaleX for GPU-accelerated animation)
  const progressFraction = useSharedValue(0);

  // Hint opacity
  const hintOpacity = useSharedValue(0);

  // Shimmer glow for final word
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // Show hint after 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
      hintOpacity.value = withTiming(1, { duration: 600 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [hintOpacity]);

  // Start breathing animation
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

    // Hide hint on first tap
    if (showHint && nextIndex === 0) {
      hintOpacity.value = withTiming(0, { duration: 300 });
    }

    const isFinalWord = nextIndex === ONBOARDING_WORDS.length - 1;

    // Haptic — Medium for final word, Light otherwise
    if (hapticEnabled) {
      Haptics.impactAsync(
        isFinalWord
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }

    // Animate word in
    setWordIndex(nextIndex);

    if (isFinalWord) {
      // AnimatedCharacters handles its own entrance — just set opacity
      wordOpacity.value = 1;
      wordScale.value = 1;
      // Shimmer glow
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
      // Normal words: scale 0.85 -> 1
      wordOpacity.value = 0;
      wordOpacity.value = withTiming(1, { duration: 200 });
      wordScale.value = 0.85;
      wordScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }

    // Update progress (GPU-accelerated scaleX)
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
          <>
            {wordIndex === ONBOARDING_WORDS.length - 1 && (
              <Animated.View
                style={[
                  styles.shimmerGlow,
                  { backgroundColor: colors.primary },
                  glowStyle,
                ]}
              />
            )}
            {wordIndex === ONBOARDING_WORDS.length - 1 ? (
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
            )}
          </>
        )}
        <Animated.Text
          style={[styles.hintText, { color: colors.muted }, hintStyle]}
        >
          Tap anywhere
        </Animated.Text>
      </View>
      {/* Thin progress line at bottom */}
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

  // Preview animation
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

  // Resolve display color
  const resolvedColor = WordColors.find((c) => c.key === wordColor)?.color ?? colors.primary;
  const fontConfig = FontFamilies[fontFamily];

  return (
    <View style={styles.onboardingPage}>
      <View style={styles.personalizeContent}>
        {/* Title */}
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[styles.personalizeTitle, { color: colors.primary }]}
        >
          Make it yours.
        </Animated.Text>

        {/* Live preview */}
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

        {/* Font picker */}
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

        {/* Color picker */}
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

  // Animation shared values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowSpread = useSharedValue(0);
  const backgroundTint = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const dimOpacity = useSharedValue(1);

  // Track if we should animate (to skip animation on initial render)
  const hasAnimated = useSharedValue(false);

  useEffect(() => {
    if (isSelected) {
      // Don't animate on initial mount, only on actual selection
      if (!hasAnimated.value) {
        hasAnimated.value = true;
      }

      // Layer 1: Haptic + Scale Pulse
      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      scale.value = withSequence(
        withSpring(1.02, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );

      // Layer 2: Animated Border Glow
      glowOpacity.value = withTiming(1, { duration: 200 });
      glowSpread.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
      );

      // Layer 3: Background Tint Fade
      backgroundTint.value = withTiming(1, { duration: 200 });

      // Layer 4: Checkmark Reveal with bounce
      checkOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
      checkScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      // Layer 5: This card stays at full opacity (handled by dimOpacity staying at 1)
      dimOpacity.value = withTiming(1, { duration: 200 });
    } else {
      // Reset animations when deselected
      glowOpacity.value = withTiming(0, { duration: 200 });
      glowSpread.value = withTiming(0, { duration: 200 });
      backgroundTint.value = withTiming(0, { duration: 200 });
      checkOpacity.value = withTiming(0, { duration: 100 });
      checkScale.value = withTiming(0, { duration: 100 });
      // Dim unselected cards only when another card is selected
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
            {/* Background tint overlay */}
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

            {/* Card content */}
            <View style={styles.selectableCardContent}>
              <View style={styles.catRow}>
                <Text style={[styles.levelLabel, { color: colors.primary }]}>
                  {category.name}
                </Text>
              </View>
            </View>

            {/* Animated checkmark */}
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

  // Reset opacity for all cards when selection changes
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
    router.replace({
      pathname: '/reading',
      params: { categoryKey },
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

function Home() {
  const { colors } = useTheme();
  const router = useRouter();
  const { resumeData, currentStreak, isPremium, setIsPremium, resetAll } = useSettingsStore();

  const handleCategoryPress = (categoryKey: string) => {
    if (!isPremium && !FREE_CATEGORIES.includes(categoryKey)) {
      return;
    }
    router.push({
      pathname: '/reading',
      params: { categoryKey },
    });
  };

  const handleResume = () => {
    if (resumeData) {
      router.push({
        pathname: '/reading',
        params: {
          categoryKey: resumeData.categoryKey,
          resumeIndex: String(resumeData.wordIndex),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header stays at top */}
      <View style={styles.homeHeader}>
        <View style={styles.flex} />
        <View style={styles.headerIcons}>
          {currentStreak > 0 && <StreakDisplay compact />}
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
          <Pressable onPress={() => router.push('/settings')} style={styles.headerButton}>
            <Feather name="settings" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Main content centered vertically */}
      <View style={styles.homeMainContent}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <TimeGreeting />
        </View>

        {/* Resume card */}
        {resumeData && (
          <View style={styles.resumeSection}>
            <ResumeCard data={resumeData} onPress={handleResume} />
          </View>
        )}

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            What would you like to read?
          </Text>
          <View style={styles.categoryList}>
            {categories.map((cat) => {
              const isLocked = !isPremium && !FREE_CATEGORIES.includes(cat.key);
              return (
                <CategoryCard
                  key={cat.key}
                  category={cat}
                  onPress={() => handleCategoryPress(cat.key)}
                  locked={isLocked}
                />
              );
            })}
          </View>
        </View>
      </View>
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
  homeMainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  resumeSection: {
    marginBottom: Spacing.xl,
  },
  categoriesSection: {
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  categoryList: {
    gap: 16,
  },
});
