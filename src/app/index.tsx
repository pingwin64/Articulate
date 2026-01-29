import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
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
import { DailyGoalRing } from '../components/DailyGoalRing';
import { Paywall } from '../components/Paywall';
import { SilentStart } from '../components/onboarding/SilentStart';
import { Personalize } from '../components/onboarding/Personalize';
import { Launch } from '../components/onboarding/Launch';
import { Spacing } from '../design/theme';

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
      {page === 0 && <SilentStart onNext={handleSilentStartDone} />}
      {page === 1 && <Personalize onNext={handlePersonalizeDone} />}
      {page === 2 && <Launch onNext={handleLaunch} />}
      <PageDots total={3} current={page} />
    </SafeAreaView>
  );
}

// ─── Daily Goal Prompt ────────────────────────────────────────

function DailyGoalPrompt({ onDismiss }: { onDismiss: () => void }) {
  const { colors, glass, isDark } = useTheme();
  const { setDailyGoal, setDailyGoalSet, hapticFeedback } = useSettingsStore();
  const [selected, setSelected] = useState<number | null>(null);

  const goals = [1, 3, 5];

  const handleConfirm = () => {
    if (selected !== null) {
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setDailyGoal(selected);
      setDailyGoalSet(true);
      onDismiss();
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.goalPromptOverlay}>
      <View style={[styles.goalPromptCard, { backgroundColor: colors.bg }]}>
        <Text style={[styles.goalPromptTitle, { color: colors.primary }]}>
          Set a daily goal
        </Text>
        <Text style={[styles.goalPromptSubtitle, { color: colors.secondary }]}>
          How many texts would you like to read each day?
        </Text>
        <View style={styles.goalOptions}>
          {goals.map((goal) => (
            <Pressable
              key={goal}
              onPress={() => setSelected(goal)}
              style={[
                styles.goalOption,
                {
                  backgroundColor: selected === goal
                    ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)')
                    : glass.fill,
                  borderColor: selected === goal
                    ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)')
                    : glass.border,
                },
              ]}
            >
              <Text style={[styles.goalNumber, { color: colors.primary }]}>
                {goal}
              </Text>
              <Text style={[styles.goalLabel, { color: colors.muted }]}>
                {goal === 1 ? 'text/day' : 'texts/day'}
              </Text>
            </Pressable>
          ))}
        </View>
        <GlassButton
          title="Set Goal"
          onPress={handleConfirm}
          disabled={selected === null}
        />
        <Pressable onPress={onDismiss} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.muted }]}>
            Skip for now
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Home ────────────────────────────────────────────────────

const FREE_CATEGORIES = ['story', 'article', 'speech'];

function Home() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const {
    resumeData,
    currentStreak,
    isPremium,
    lastReadDate,
    customTexts,
    dailyGoalSet,
    textsCompleted,
    hapticFeedback,
    dailyGoal,
    textsReadToday,
    checkTrialExpired,
    trialActive,
    setShowPaywall,
    showPaywall,
    resetDailyProgressIfNeeded,
  } = useSettingsStore();

  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [trialExpiredBanner, setTrialExpiredBanner] = useState(false);

  // Check trial expiration and reset daily progress on mount
  useEffect(() => {
    const expired = checkTrialExpired();
    if (expired) {
      setTrialExpiredBanner(true);
    }
    resetDailyProgressIfNeeded();
  }, [checkTrialExpired, resetDailyProgressIfNeeded]);

  // Show goal prompt after first text completion if goal not yet set
  useEffect(() => {
    if (textsCompleted > 0 && !dailyGoalSet) {
      const timer = setTimeout(() => setShowGoalPrompt(true), 500);
      return () => clearTimeout(timer);
    }
  }, [textsCompleted, dailyGoalSet]);

  // Streak "at risk" detection
  const isStreakAtRisk = currentStreak > 0 && lastReadDate !== null && (() => {
    const now = Date.now();
    const lastMs = new Date(lastReadDate).getTime();
    if (isNaN(lastMs)) return false;
    const elapsed = now - lastMs;
    const HOURS_24 = 24 * 60 * 60 * 1000;
    return elapsed >= HOURS_24;
  })();

  const handleCategoryPress = (categoryKey: string) => {
    if (!isPremium && !FREE_CATEGORIES.includes(categoryKey)) {
      setShowPaywall(true);
      return;
    }
    router.push({
      pathname: '/reading',
      params: { categoryKey },
    });
  };

  const handleResume = () => {
    if (resumeData) {
      if (resumeData.customTextId) {
        router.push({
          pathname: '/reading',
          params: {
            customTextId: resumeData.customTextId,
            resumeIndex: String(resumeData.wordIndex),
          },
        });
      } else {
        router.push({
          pathname: '/reading',
          params: {
            categoryKey: resumeData.categoryKey,
            resumeIndex: String(resumeData.wordIndex),
          },
        });
      }
    }
  };

  const handleCustomTextPress = (textId: string) => {
    router.push({
      pathname: '/reading',
      params: { customTextId: textId },
    });
  };

  const handleDeleteCustomText = (textId: string) => {
    const { removeCustomText } = useSettingsStore.getState();
    Alert.alert(
      'Delete Text',
      'Are you sure you want to delete this text?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeCustomText(textId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={styles.homeHeader}>
        <View style={styles.leftSection}>
          {dailyGoalSet && <DailyGoalRing size={52} />}
        </View>
        <View style={styles.headerIcons}>
          {currentStreak > 0 && <StreakDisplay compact />}
          <Pressable onPress={() => router.push('/settings')} style={styles.headerButton}>
            <Feather name="settings" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <TimeGreeting />
        </View>

        {/* Trial expired banner */}
        {trialExpiredBanner && (
          <Animated.View entering={FadeIn.duration(400)}>
            <GlassCard onPress={() => setShowPaywall(true)}>
              <View style={styles.trialBanner}>
                <View style={styles.trialBannerText}>
                  <Text style={[styles.trialBannerTitle, { color: colors.primary }]}>
                    Your trial ended
                  </Text>
                  <Text style={[styles.trialBannerSubtitle, { color: colors.secondary }]}>
                    Upgrade to keep your custom style
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Streak at risk warning */}
        {isStreakAtRisk && (
          <Animated.View entering={FadeIn.duration(400)}>
            <View style={[styles.streakWarning, { backgroundColor: isDark ? 'rgba(255,149,0,0.1)' : 'rgba(255,149,0,0.08)' }]}>
              <Text style={[styles.streakWarningText, { color: colors.warning }]}>
                Don't break your {currentStreak}-day streak! Read a text today.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Resume card */}
        {resumeData && (
          <View style={styles.resumeSection}>
            <ResumeCard data={resumeData} onPress={handleResume} />
          </View>
        )}

        {/* Paste Text card */}
        <Animated.View entering={FadeIn.delay(100).duration(400)}>
          <GlassCard onPress={() => router.push('/paste')} accentBorder>
            <View style={styles.pasteCard}>
              <View style={styles.pasteCardIcon}>
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

        {/* My Texts section */}
        {customTexts.length > 0 && (
          <View style={styles.myTextsSection}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
              MY TEXTS
            </Text>
            {customTexts.map((ct, i) => (
              <Animated.View
                key={ct.id}
                entering={FadeIn.delay(i * 80).duration(300)}
              >
                <GlassCard onPress={() => handleCustomTextPress(ct.id)}>
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
                    <Pressable
                      onPress={() => handleDeleteCustomText(ct.id)}
                      style={styles.deleteButton}
                      hitSlop={8}
                    >
                      <Feather name="trash-2" size={16} color={colors.muted} />
                    </Pressable>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Curated Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
            CURATED
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

          {/* Read Your Own Text CTA */}
          <Pressable
            onPress={() => router.push('/paste')}
            style={[
              styles.ownTextButton,
              {
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
              },
            ]}
          >
            <Feather name="edit-3" size={18} color={colors.primary} />
            <Text style={[styles.ownTextLabel, { color: colors.primary }]}>
              Read Your Own Text
            </Text>
            <Feather name="arrow-right" size={16} color={colors.muted} />
          </Pressable>
        </View>

        {/* History link */}
        <View style={styles.historySection}>
          <GlassCard onPress={() => router.push('/history')}>
            <View style={styles.historyRow}>
              <Feather name="bar-chart-2" size={18} color={colors.secondary} />
              <Text style={[styles.historyText, { color: colors.secondary }]}>
                Reading History
              </Text>
              <Feather name="chevron-right" size={16} color={colors.muted} />
            </View>
          </GlassCard>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Goal prompt overlay */}
      {showGoalPrompt && (
        <DailyGoalPrompt onDismiss={() => setShowGoalPrompt(false)} />
      )}

      {/* Paywall modal */}
      <Paywall
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
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
  // Home
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: 12,
  },
  greetingSection: {
    marginBottom: Spacing.sm,
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
    fontSize: 16,
    fontWeight: '600',
  },
  trialBannerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  // Streak warning
  streakWarning: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  streakWarningText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Resume
  resumeSection: {
    marginBottom: Spacing.xs,
  },
  // Paste card
  pasteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pasteCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteCardText: {
    flex: 1,
    gap: 2,
  },
  pasteCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pasteCardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  // My Texts
  myTextsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingLeft: 4,
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: '600',
  },
  customTextCount: {
    fontSize: 13,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Categories
  categoriesSection: {
    gap: 8,
  },
  categoryList: {
    gap: 12,
  },
  ownTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    marginTop: 12,
  },
  ownTextLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // History
  historySection: {
    marginTop: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  // Goal prompt
  goalPromptOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 100,
  },
  goalPromptCard: {
    width: '100%',
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 24,
    gap: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  goalPromptTitle: {
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  goalPromptSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  goalOptions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  goalOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    gap: 4,
  },
  goalNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '400',
  },
});
