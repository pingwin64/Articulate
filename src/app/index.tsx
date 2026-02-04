import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
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
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { categories } from '../lib/data/categories';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { PageDots } from '../components/PageDots';
import { TimeGreeting } from '../components/TimeGreeting';
import { ResumeCard } from '../components/ResumeCard';
import { Paywall } from '../components/Paywall';
import {
  Spacing,
  Springs,
  FontFamilies,
  WordColors,
  Radius,
} from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';
import { scheduleStreakAtRiskReminder, cleanupOrphanedNotifications } from '../lib/notifications';
import { StreakRestoreSheet } from '../components/StreakRestoreSheet';

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
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  const wordScale = useSharedValue(0.85);
  const wordOpacity = useSharedValue(0);
  const breatheScale = useSharedValue(1);
  const progressFraction = useSharedValue(0);
  const hintOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion);
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
  const { colors, isDark, glass } = useTheme();
  const { fontFamily, setFontFamily, wordColor, setWordColor, isPremium, setPaywallContext } = useSettingsStore();
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

  const previewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: previewScale.value }],
  }));

  const fontConfig = FontFamilies[fontFamily];
  const previewColor = WordColors.find(c => c.key === wordColor)?.color ?? colors.primary;

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

        <View style={styles.previewArea}>
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
            {WordColors.slice(0, 6).map((colorOption) => {
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

// ─── Step 3: Daily Goal ──────────────────────────────────────

const GOAL_OPTIONS = [50, 100, 150, 200, 300, 500];
const GOAL_LABELS: Record<number, string> = {
  50: 'A gentle start — build from here',
  100: 'The sweet spot for habit-building',
  150: 'Steady progress every day',
  200: 'Ambitious — you\'re serious',
  300: 'Dedicated learner mode',
  500: 'Power reader — full commitment',
};
const GOAL_TIME: Record<number, string> = {
  50: '~5 min/day',
  100: '~10 min/day',
  150: '~15 min/day',
  200: '~20 min/day',
  300: '~30 min/day',
  500: '~50 min/day',
};

const ITEM_HEIGHT = 56;

function OnboardingDailyGoal({ onNext }: { onNext: (goal: number) => void }) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  // Default to 100 (index 1)
  const [selectedIndex, setSelectedIndex] = useState(1);
  const selectedGoal = GOAL_OPTIONS[selectedIndex];
  const flatListRef = React.useRef<FlatList>(null);
  const lastSnappedIndex = React.useRef(1);

  // Pad data so the first/last items can scroll to center
  const paddedData = React.useMemo(() => [
    { key: 'pad-top', value: 0 },
    ...GOAL_OPTIONS.map((v) => ({ key: String(v), value: v })),
    { key: 'pad-bottom', value: 0 },
  ], []);

  const handleScroll = React.useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, GOAL_OPTIONS.length - 1));
    if (clamped !== lastSnappedIndex.current) {
      lastSnappedIndex.current = clamped;
      setSelectedIndex(clamped);
      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [hapticEnabled]);

  // Scroll to default on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 1 * ITEM_HEIGHT, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const renderItem = React.useCallback(({ item, index }: { item: { key: string; value: number }; index: number }) => {
    if (item.value === 0) {
      return <View style={{ height: ITEM_HEIGHT }} />;
    }
    const dataIndex = index - 1; // account for top padding
    const isSelected = dataIndex === selectedIndex;
    return (
      <View style={[styles.goalItem, { height: ITEM_HEIGHT }]}>
        <Text style={[
          styles.goalItemText,
          {
            color: isSelected ? colors.primary : colors.muted,
            fontSize: isSelected ? 48 : 24,
            fontWeight: isSelected ? '700' : '400',
            opacity: isSelected ? 1 : 0.3,
          },
        ]}>
          {item.value}
        </Text>
      </View>
    );
  }, [selectedIndex, colors.primary, colors.muted]);

  return (
    <View style={styles.onboardingPage}>
      <View style={styles.onboardingCenter}>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[styles.personalizeTitle, { color: colors.primary }]}
        >
          Set your daily habit.
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={[styles.goalSubtitle, { color: colors.secondary }]}
        >
          How much focus time feels right for you?
        </Animated.Text>

        {/* Wheel picker */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.goalWheelContainer}>
          {/* Center highlight band */}
          <View style={[
            styles.goalHighlightBand,
            {
              backgroundColor: glass.fill,
              borderTopColor: glass.border,
              borderBottomColor: glass.border,
            },
          ]} />
          <FlatList
            ref={flatListRef}
            data={paddedData}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            style={{ height: ITEM_HEIGHT * 3 }}
          />
        </Animated.View>

        {/* Time estimate */}
        <Animated.Text
          entering={FadeIn.delay(300).duration(400)}
          style={[styles.goalTimeLabel, { color: colors.muted }]}
        >
          {GOAL_TIME[selectedGoal]}
        </Animated.Text>

        {/* Contextual description */}
        <Animated.Text
          entering={FadeIn.delay(350).duration(400)}
          style={[styles.goalDescription, { color: colors.secondary }]}
        >
          {GOAL_LABELS[selectedGoal]}
        </Animated.Text>
      </View>
      <View style={styles.onboardingBottom}>
        <GlassButton title="Continue" onPress={() => onNext(selectedGoal)} />
      </View>
    </View>
  );
}

// ─── Step 4: Your First Reading (Launch) ─────────────────────

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
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={[styles.personalizeSubtitle, { color: colors.secondary }]}
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
  const { setReadingLevel, setIsFirstReading } = useSettingsStore();

  const handleSilentStartDone = useCallback(() => {
    setPage(1);
  }, []);

  const handlePersonalizeDone = useCallback(() => {
    setPage(2);
  }, []);

  const handleLaunch = useCallback((categoryKey: string) => {
    // Set default level and mark as first reading
    // hasOnboarded will be set after calibration in complete.tsx
    setReadingLevel(5);
    setIsFirstReading(true);
    const cat = categories.find((c) => c.key === categoryKey);
    router.replace({
      pathname: '/reading',
      params: { categoryKey, textId: cat?.texts[0]?.id ?? '' },
    });
  }, [setReadingLevel, setIsFirstReading, router]);

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
const OTHER_CATEGORIES = categories.filter((c) => !FREE_CATEGORIES.includes(c.key));
const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── CategoryTile Component ──────────────────────────────────

interface CategoryTileProps {
  category: typeof categories[0];
  index: number;
  onPress: () => void;
  textCount: number;
  isLocked?: boolean;
}

function CategoryTile({ category, index, onPress, textCount, isLocked = false }: CategoryTileProps) {
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
      scale.value = withSpring(1, { damping: 10, stiffness: 180 });
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
            name={isLocked ? 'lock' : (category.icon as any)}
            size={24}
            color={isLocked ? colors.muted : colors.primary}
          />
        </View>
        <Text style={[styles.categoryTileName, { color: isLocked ? colors.muted : colors.primary }]}>
          {category.name}
        </Text>
        <Text style={[styles.categoryTileCount, { color: colors.muted }]}>
          {textCount} texts
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
      scale.value = withSpring(1, { damping: 10, stiffness: 180 });
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

// ─── BookSpine Component (Redesigned - Full Width Living Bookshelf) ──────────

interface BookSpineProps {
  label: string;
  color: string;
  count?: number;
  icon?: string;
  isLocked?: boolean;
  onPress: (e: any) => void;
  index: number; // For staggered entry
}

function BookSpine({ label, color, count, icon, isLocked, onPress, index }: BookSpineProps) {
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  // Entry animation
  const entryTranslateY = useSharedValue(30);
  const entryOpacity = useSharedValue(0);

  // Press animation
  const translateY = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const shadowRadius = useSharedValue(4);

  // Idle wobble
  const wobble = useSharedValue(0);

  // Entry animation on mount
  useEffect(() => {
    const delay = index * 80;
    entryTranslateY.value = withDelay(delay, withSpring(0, { damping: 12, stiffness: 100 }));
    entryOpacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  // Idle wobble (very subtle)
  useEffect(() => {
    if (reduceMotion) return;
    const startWobble = () => {
      wobble.value = withSequence(
        withTiming(0.5, { duration: 2000 }),
        withTiming(-0.5, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      );
    };
    // Initial delay before first wobble
    const initialDelay = setTimeout(() => {
      startWobble();
    }, 3000 + index * 1000);
    const interval = setInterval(startWobble, 8000 + index * 2000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
      cancelAnimation(wobble);
      wobble.value = 0;
    };
  }, [reduceMotion, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: entryTranslateY.value + translateY.value },
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotate: `${wobble.value}deg` },
      { scale: scale.value },
    ],
    opacity: entryOpacity.value,
    shadowRadius: shadowRadius.value,
  }));

  const handlePressIn = () => {
    translateY.value = withSpring(-12, { damping: 15, stiffness: 200 });
    rotateX.value = withSpring(-8, { damping: 15, stiffness: 200 });
    scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
    shadowRadius.value = withTiming(12, { duration: 150 });
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0, { damping: 12, stiffness: 180 });
    rotateX.value = withSpring(0, { damping: 12, stiffness: 180 });
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    shadowRadius.value = withTiming(4, { duration: 200 });
  };

  const handlePress = (e: any) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.bookSpinePressable}
    >
      <Animated.View
        style={[
          styles.bookSpine,
          { backgroundColor: color },
          animatedStyle,
        ]}
      >
        {/* Icon at top */}
        {isLocked ? (
          <Feather name="lock" size={20} color="rgba(255,255,255,0.6)" />
        ) : icon ? (
          <Feather name={icon as any} size={20} color="rgba(255,255,255,0.9)" />
        ) : null}

        {/* Label */}
        <Text style={styles.bookSpineLabel}>{label}</Text>

        {/* Count badge */}
        {!isLocked && count !== undefined && count > 0 && (
          <Text style={styles.bookSpineCount}>({count})</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

function Home() {
  const { colors, isDark, glass } = useTheme();
  const router = useRouter();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
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
    reduceMotion,
    resetDailyUploadIfNewDay,
    refillStreakAllowancesIfNewMonth,
    checkWeeklyChallenge,
  } = useSettingsStore();

  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

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
  const { notificationsEnabled } = useSettingsStore();
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
    resetDailyUploadIfNewDay();
    refillStreakAllowancesIfNewMonth();
    checkWeeklyChallenge();
  }, [resetDailyUploadIfNewDay, refillStreakAllowancesIfNewMonth, checkWeeklyChallenge]);

  // Streak "at risk" detection — warn at 20h (4-hour buffer before streak resets at 48h)
  const isStreakAtRisk = currentStreak > 0 && lastReadDate !== null && (() => {
    const now = Date.now();
    const lastMs = new Date(lastReadDate).getTime();
    if (isNaN(lastMs)) return false;
    const elapsed = now - lastMs;
    const HOURS_20 = 20 * 60 * 60 * 1000;
    return elapsed >= HOURS_20;
  })();

  const setSelectedCategoryKey = useSettingsStore((s) => s.setSelectedCategoryKey);

  // ─── Shuffle (Surprise Me) ─────────────────────────────────
  const shuffleRotation = useSharedValue(0);

  const shuffleableTexts = useMemo(() => {
    const results: { categoryKey: string; textId: string }[] = [];
    for (const cat of categories) {
      const isAccessible = isPremium || FREE_CATEGORIES.includes(cat.key);
      if (!isAccessible) continue;
      for (const text of cat.texts) {
        const required = text.requiredReads ?? 0;
        const completed = categoryReadCounts[cat.key] ?? 0;
        if (completed >= required) {
          results.push({ categoryKey: cat.key, textId: text.id });
        }
      }
    }
    return results;
  }, [isPremium, categoryReadCounts]);

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
      const isLocked = !isPremium && !FREE_CATEGORIES.includes(category.key);

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

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
  const insightsCount = textsCompleted;

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={styles.homeHeader}>
        {/* Icons row - at top */}
        <View style={styles.headerIconsTop}>
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
          <Pressable onPress={() => router.push('/achievements')} style={styles.headerButton} accessibilityLabel="Open achievements" accessibilityRole="button">
            <Feather name="award" size={18} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => router.push('/library')} style={styles.headerButton} accessibilityLabel="Open library" accessibilityRole="button">
            <Feather name="folder" size={18} color={colors.primary} />
          </Pressable>
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
              accessibilityLabel="Unlock full access"
            >
              <Feather name="zap" size={12} color={colors.primary} />
              <Text style={[styles.upgradePillText, { color: colors.primary }]}>
                Unlock full access
              </Text>
            </Pressable>
          )}
        </View>
      </View>

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

        {/* Continue card */}
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

        {/* Categories Grid */}
        <Animated.View entering={FadeIn.delay(140).duration(400)} style={styles.categoriesGrid}>
          {/* Always show: Story, Article, Speech */}
          {CORE_CATEGORIES.map((cat, index) => (
            <CategoryTile
              key={cat.key}
              category={cat}
              index={index}
              textCount={cat.texts.length}
              onPress={() => handleCategoryPress(cat)}
            />
          ))}

          {/* Expanded: Show remaining categories */}
          {categoriesExpanded && OTHER_CATEGORIES.map((cat, index) => {
            const isLocked = !isPremium;
            return (
              <CategoryTile
                key={cat.key}
                category={cat}
                index={index + 3}
                textCount={cat.texts.length}
                onPress={() => handleCategoryPress(cat)}
                isLocked={isLocked}
              />
            );
          })}

          {/* Toggle tile: +More / Show Less */}
          <MoreTile
            count={OTHER_CATEGORIES.length}
            onPress={() => setCategoriesExpanded(!categoriesExpanded)}
            index={categoriesExpanded ? CORE_CATEGORIES.length + OTHER_CATEGORIES.length : 3}
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

        {/* Bookshelf Library - Full Width Living Design */}
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.bookshelfContainer}>
          {/* Books row - spans full width */}
          <View style={styles.booksRow}>
            {/* Word Bank - open to all */}
            <BookSpine
              label="Words"
              icon="bookmark"
              color={isDark ? '#2A5A5A' : '#4A9A9A'}
              count={savedWords.length}
              index={0}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/word-bank');
              }}
            />

            {/* Favorites - open to all */}
            <BookSpine
              label="Favs"
              icon="heart"
              color={isDark ? '#5A4A4A' : '#9A7A7A'}
              count={favoriteTexts.length}
              index={1}
              onPress={(e) => {
                e.stopPropagation();
                router.push({ pathname: '/library', params: { tab: 'favorites' } });
              }}
            />

            {/* My Texts - LOCKED for free users */}
            <BookSpine
              label="Texts"
              icon="file-text"
              color={isDark ? '#4A4A5A' : '#7A7A8A'}
              count={customTexts.length}
              isLocked={!isPremium}
              index={2}
              onPress={(e) => {
                e.stopPropagation();
                if (!isPremium) {
                  setPaywallContext('custom_text_limit');
                } else {
                  router.push({ pathname: '/library', params: { tab: 'texts' } });
                }
              }}
            />
          </View>

          {/* 3D Shelf */}
          <View style={styles.shelfContainer}>
            <View style={[styles.shelfTop, { backgroundColor: isDark ? '#3A3A3A' : '#D4C4B4' }]} />
            <View style={[styles.shelfFront, { backgroundColor: isDark ? '#2A2A2A' : '#B4A494' }]} />
            <View style={[styles.shelfShadow, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }]} />
          </View>
        </Animated.View>

        {/* Library Preview */}
        {(favoriteTexts.length > 0 || customTexts.length > 0) && (
          <View style={styles.librarySection}>
            <View style={styles.librarySectionHeader}>
              <Text style={[styles.librarySectionTitle, { color: colors.secondary }]}>
                {favoriteTexts.length > 0 ? 'FAVORITES' : 'YOUR LIBRARY'}
              </Text>
              <Pressable onPress={() => router.push('/library')}>
                <Text style={[styles.librarySeeAll, { color: colors.primary }]}>See all →</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.libraryScroll}
              style={{ flexGrow: 0 }}
            >
              {(favoriteTexts.length > 0
                ? favoriteTexts.slice(0, 5).map((fav) => {
                    const cat = categories.find(c => c.key === fav.categoryKey);
                    const text = cat?.texts.find(t => t.id === fav.textId);
                    if (!text) return null;
                    return (
                      <Pressable
                        key={`${fav.categoryKey}-${fav.textId}`}
                        onPress={() => {
                          router.push({
                            pathname: '/reading',
                            params: { categoryKey: fav.categoryKey, textId: fav.textId },
                          });
                        }}
                        style={({ pressed }) => [
                          styles.libraryCard,
                          { backgroundColor: glass.fill, borderColor: glass.border, opacity: pressed ? 0.8 : 1 },
                        ]}
                      >
                        <Text style={[styles.libraryCardTitle, { color: colors.primary }]} numberOfLines={2}>
                          {text.title}
                        </Text>
                        <Text style={[styles.libraryCardMeta, { color: colors.muted }]}>
                          {text.words.length} words
                        </Text>
                      </Pressable>
                    );
                  })
                : customTexts.slice(0, 5).map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        router.push({
                          pathname: '/reading',
                          params: { categoryKey: 'custom', customTextId: item.id },
                        });
                      }}
                      style={({ pressed }) => [
                        styles.libraryCard,
                        { backgroundColor: glass.fill, borderColor: glass.border, opacity: pressed ? 0.8 : 1 },
                      ]}
                    >
                      <Text style={[styles.libraryCardTitle, { color: colors.primary }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={[styles.libraryCardMeta, { color: colors.muted }]}>
                        {item.wordCount} words
                      </Text>
                    </Pressable>
                  ))
              )}
            </ScrollView>
          </View>
        )}

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

        {isStreakAtRisk && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.bannerSection} accessibilityLabel={`Streak at risk: ${currentStreak}-day streak. Read one text to keep it going`} accessibilityRole="button">
            <GlassCard onPress={() => {
              const firstCat = CORE_CATEGORIES[0];
              if (firstCat) {
                setSelectedCategoryKey(firstCat.key);
                router.push({
                  pathname: '/text-select',
                  params: { categoryKey: firstCat.key },
                });
              }
            }}>
              <View style={styles.streakAtRiskBanner}>
                <View style={styles.streakAtRiskContent}>
                  <Feather name="alert-circle" size={18} color={colors.warning ?? colors.primary} />
                  <View style={styles.streakAtRiskText}>
                    <Text style={[styles.streakAtRiskTitle, { color: colors.primary }]}>
                      Don't lose your {currentStreak}-day streak
                    </Text>
                    <Text style={[styles.streakAtRiskSubtitle, { color: colors.secondary }]}>
                      Read one text to keep it going
                    </Text>
                  </View>
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
  devReplay: {
    fontSize: 10,
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
    paddingTop: Spacing.sm,
  },
  heroSection: {
    marginBottom: Spacing.lg,
  },
  // Stats Row (inline, above hero)
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
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
  // Categories Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: Spacing.lg,
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
  // Bookshelf Library - Full Width Living Design
  bookshelfContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  booksRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  bookSpinePressable: {
    flex: 1,
  },
  bookSpine: {
    flex: 1,
    height: 100,
    borderRadius: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 8, // Rounded spine edge
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    // Book shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bookSpineLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  bookSpineCount: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '500',
  },
  // 3D Shelf
  shelfContainer: {
    marginTop: -4, // Overlap with books
    zIndex: 1,
  },
  shelfTop: {
    height: 8,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  shelfFront: {
    height: 6,
    marginHorizontal: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  shelfShadow: {
    height: 8,
    marginHorizontal: 16,
    borderRadius: 4,
    marginTop: 2,
  },
  // Library Section
  librarySection: {
    marginBottom: Spacing.lg,
  },
  librarySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  librarySectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  librarySeeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  libraryScroll: {
    gap: 12,
  },
  libraryCard: {
    width: 140,
    padding: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    gap: 6,
  },
  libraryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  libraryCardMeta: {
    fontSize: 12,
    fontWeight: '400',
  },
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
  // Streak at risk banner
  streakAtRiskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakAtRiskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  streakAtRiskText: {
    flex: 1,
    gap: 2,
  },
  streakAtRiskTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  streakAtRiskSubtitle: {
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
});
