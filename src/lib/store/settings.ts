import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import type { FontFamilyKey, WordColorKey } from '../../design/theme';
import { getBadgeById } from '../data/badges';
import { getISOWeekId } from '../date';

const storage = createMMKV({ id: 'articulate-mmkv' });

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

export type TTSSpeed = 'slow' | 'normal' | 'fast';
export type VoiceGender = 'male' | 'female';

// Legacy type kept for backward compatibility during migration
export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';

// Tier names for the numeric level system
export function getTierName(level: number): string {
  if (level <= 3) return 'Beginner';
  if (level <= 6) return 'Intermediate';
  if (level <= 9) return 'Advanced';
  if (level <= 12) return 'Expert';
  if (level <= 15) return 'Master';
  return 'Scholar';
}

export function getTierKey(level: number): string {
  if (level <= 3) return 'beginner';
  if (level <= 6) return 'intermediate';
  if (level <= 9) return 'advanced';
  if (level <= 12) return 'expert';
  if (level <= 15) return 'master';
  return 'scholar';
}

export type PaywallContext =
  | 'post_onboarding' | 'locked_category' | 'custom_text_limit'
  | 'locked_font' | 'locked_color' | 'locked_size' | 'locked_bold'
  | 'locked_background' | 'locked_autoplay' | 'locked_chunk'
  | 'locked_breathing' | 'locked_tts' | 'locked_quiz'
  | 'locked_daily_upload' | 'locked_scan' | 'streak_save' | 'goal_almost'
  | 'trial_expired' | 'settings_upgrade' | 'locked_insights'
  | 'locked_level_up' | 'locked_definition' | 'locked_word_bank' | 'generic';

export interface SavedWord {
  id: string;
  word: string;
  syllables?: string;
  partOfSpeech?: string;
  definition?: string;
  savedAt: string;
  sourceText?: string;
  sourceCategory?: string;
}

export interface SavedPremiumSettings {
  fontFamily: FontFamilyKey;
  wordColor: WordColorKey;
  wordSize: number;
  wordBold: boolean;
  backgroundTheme: string;
}

export interface CustomText {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  createdAt: string;
  lastReadAt?: string;
  timesRead: number;
  collectionId?: string;
  source?: 'paste' | 'file' | 'url' | 'scan';
  preview?: string;
}

export interface TextCollection {
  id: string;
  name: string;
  createdAt: string;
}

export interface ResumeData {
  categoryKey: string;
  textId?: string;
  customTextId?: string;
  wordIndex: number;
  totalWords: number;
  startTime: number;
}

export interface ReadingHistoryEntry {
  id: string;
  categoryKey: string;
  textId?: string;
  customTextId?: string;
  title: string;
  wordsRead: number;
  completedAt: string;
  wpm: number;
}

export interface SettingsState {
  // Onboarding
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;

  // Premium
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;

  // Trial
  trialStartDate: string | null;
  trialActive: boolean;
  startTrial: () => void;
  checkTrialExpired: () => boolean;

  // Theme
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (v: 'light' | 'dark' | 'system') => void;
  backgroundTheme: string;
  setBackgroundTheme: (v: string) => void;

  // Word Display
  fontFamily: FontFamilyKey;
  setFontFamily: (v: FontFamilyKey) => void;
  wordSize: number;
  setWordSize: (v: number) => void;
  wordBold: boolean;
  setWordBold: (v: boolean) => void;
  wordColor: WordColorKey;
  setWordColor: (v: WordColorKey) => void;

  // Reading — Adaptive Difficulty (numeric levels)
  readingLevel: number;
  setReadingLevel: (v: number) => void;
  readingLevelTier: string;
  textsCompletedAtLevel: number;
  recentQuizScoresAtLevel: number[];
  levelUpAvailable: boolean;
  checkLevelUpEligibility: () => void;
  acceptLevelUp: () => void;
  dismissLevelUp: () => void;
  sentenceRecap: boolean;
  setSentenceRecap: (v: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (v: boolean) => void;
  breathingAnimation: boolean;
  setBreathingAnimation: (v: boolean) => void;

  // Audio
  ttsSpeed: TTSSpeed;
  setTtsSpeed: (v: TTSSpeed) => void;
  voiceGender: VoiceGender;
  setVoiceGender: (v: VoiceGender) => void;
  autoPlay: boolean;
  setAutoPlay: (v: boolean) => void;
  autoPlayWPM: number;
  setAutoPlayWPM: (v: number) => void;

  // Stats
  totalWordsRead: number;
  textsCompleted: number;
  currentStreak: number;
  lastReadDate: string | null;
  incrementWordsRead: (count: number) => void;
  incrementTextsCompleted: () => void;
  updateStreak: () => void;

  // Resume
  resumeData: ResumeData | null;
  setResumeData: (v: ResumeData | null) => void;

  // Multiple Resume Points
  resumePoints: Record<string, ResumeData>;
  setResumePoint: (key: string, data: ResumeData | null) => void;
  clearResumePoint: (key: string) => void;

  // Custom Texts
  customTexts: CustomText[];
  addCustomText: (text: CustomText) => void;
  updateCustomText: (id: string, updates: Partial<CustomText>) => void;
  removeCustomText: (id: string) => void;

  // Text Collections (Phase 3)
  textCollections: TextCollection[];
  addCollection: (collection: TextCollection) => void;
  removeCollection: (id: string) => void;
  assignTextToCollection: (textId: string, collectionId: string | undefined) => void;

  // Chunk Reading
  chunkSize: 1 | 2 | 3;
  setChunkSize: (v: 1 | 2 | 3) => void;

  // Comprehension & Quiz Stats
  avgComprehension: number;
  totalQuizzesTaken: number;
  perfectQuizzes: number;
  updateComprehension: (score: number, totalQuestions: number) => void;

  // Reading History & Badge System
  readingHistory: ReadingHistoryEntry[];
  addReadingHistory: (entry: ReadingHistoryEntry) => void;
  categoryReadCounts: Record<string, number>;
  incrementCategoryReadCount: (categoryKey: string) => void;
  unlockedBadges: string[];
  unlockBadge: (id: string) => void;
  unlockedRewards: string[];
  unlockReward: (id: string) => void;
  hasUsedTTS: boolean;
  setHasUsedTTS: (v: boolean) => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  reminderHour: number;
  reminderMinute: number;
  setReminderTime: (hour: number, minute: number) => void;

  // Accessibility
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;

  // Paywall
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;
  paywallContext: PaywallContext | null;
  setPaywallContext: (ctx: PaywallContext | null) => void;

  // Trial tracking
  trialFeaturesUsed: string[];
  addTrialFeatureUsed: (feature: string) => void;
  savedPremiumSettings: SavedPremiumSettings | null;
  savedPremiumSettingsExpiry: string | null;

  // Paywall analytics
  paywallDismissCount: number;
  lastPaywallShown: string | null;
  incrementPaywallDismiss: () => void;
  canShowPaywall: () => boolean;

  // Nudge tracking
  hasShownThirdReadingNudge: boolean;
  setHasShownThirdReadingNudge: (v: boolean) => void;

  // FormSheet workaround — store categoryKey before navigating to formSheet
  selectedCategoryKey: string | null;
  setSelectedCategoryKey: (v: string | null) => void;

  // Daily upload limit (free users)
  dailyUploadDate: string | null;
  dailyUploadUsed: boolean;
  resetDailyUploadIfNewDay: () => void;
  useDailyUpload: () => void;

  // Daily word goal
  dailyWordGoal: number;
  setDailyWordGoal: (v: number) => void;
  dailyWordsToday: number;
  addDailyWordsRead: (count: number) => void;
  lastDailyResetDate: string | null;

  // Free quiz per day (foot-in-door strategy)
  freeQuizUsedToday: boolean;
  lastFreeQuizDate: string | null;
  useFreeQuiz: () => void;
  canUseFreeQuiz: () => boolean;

  // Badge upsell tracking
  lastUnlockedBadgeId: string | null;
  clearLastUnlockedBadge: () => void;

  // Streak Freeze & Restore
  streakFreezes: number;
  streakRestores: number;
  lastStreakRefillDate: string | null;
  streakFrozenTonight: boolean;
  streakFreezeActivatedDate: string | null;
  pendingStreakRestore: { previousStreak: number; breakDate: string } | null;
  refillStreakAllowancesIfNewMonth: () => void;
  activateStreakFreeze: () => boolean;
  deactivateStreakFreeze: () => void;
  useStreakRestore: () => void;
  dismissStreakRestore: () => void;
  addPurchasedRestore: () => void;

  // Weekly Challenge
  weeklyChallengeWeek: string | null;
  weeklyChallengeProgress: number;
  weeklyChallengeCompleted: boolean;
  weeklyChallengesCompleted: number;
  weeklyCategoriesRead: string[];
  checkWeeklyChallenge: () => void;
  incrementWeeklyChallengeProgress: (type: string, amount: number) => void;

  // Reading Insights (Phase 4)
  weeklyWordCounts: Record<string, number>;
  weeklyReadingDays: Record<string, string[]>;
  weeklyAvgWPM: Record<string, number>;
  longestStreak: number;
  dailyReadingLog: Record<string, number>;
  recordWeeklyReading: (words: number, wpm: number) => void;

  // Favorite Words (Phase 7)
  favoriteWords: string[];
  toggleFavoriteWord: (word: string) => void;

  // Saved Words (Word Bank)
  savedWords: SavedWord[];
  addSavedWord: (word: SavedWord) => void;
  removeSavedWord: (id: string) => void;

  // Computed helper
  trialDaysRemaining: () => number;

  // Reset
  resetAll: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasOnboarded: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),

      // Premium
      isPremium: false,
      setIsPremium: (v) => {
        if (v) {
          // Restore saved premium settings on subscribe
          const state = get();
          const restored: Record<string, any> = { isPremium: true, trialActive: false };
          if (state.savedPremiumSettings) {
            restored.fontFamily = state.savedPremiumSettings.fontFamily;
            restored.wordColor = state.savedPremiumSettings.wordColor;
            restored.wordSize = state.savedPremiumSettings.wordSize;
            restored.wordBold = state.savedPremiumSettings.wordBold;
            restored.backgroundTheme = state.savedPremiumSettings.backgroundTheme;
            restored.savedPremiumSettings = null;
            restored.savedPremiumSettingsExpiry = null;
          }
          set(restored as any);
        } else {
          set({ isPremium: false });
        }
      },

      // Trial
      trialStartDate: null,
      trialActive: false,
      startTrial: () => set({
        trialStartDate: new Date().toISOString(),
        trialActive: true,
      }),
      checkTrialExpired: () => {
        const state = get();
        if (!state.trialActive || !state.trialStartDate) return false;
        const elapsed = Date.now() - new Date(state.trialStartDate).getTime();
        const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
        if (elapsed > THREE_DAYS) {
          // Save premium settings before resetting (for win-back)
          const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          set({
            trialActive: false,
            savedPremiumSettings: {
              fontFamily: state.fontFamily,
              wordColor: state.wordColor,
              wordSize: state.wordSize,
              wordBold: state.wordBold,
              backgroundTheme: state.backgroundTheme,
            },
            savedPremiumSettingsExpiry: expiry,
            fontFamily: 'sourceSerif',
            wordColor: 'default',
            wordSize: 48,
            wordBold: false,
            backgroundTheme: 'default',
          });
          return true;
        }
        return false;
      },

      // Theme
      themeMode: 'light',
      setThemeMode: (v) => set({ themeMode: v }),
      backgroundTheme: 'default',
      setBackgroundTheme: (v) => set({ backgroundTheme: v }),

      // Word Display
      fontFamily: 'sourceSerif',
      setFontFamily: (v) => set({ fontFamily: v }),
      wordSize: 48,
      setWordSize: (v) => set({ wordSize: v }),
      wordBold: false,
      setWordBold: (v) => set({ wordBold: v }),
      wordColor: 'default',
      setWordColor: (v) => set({ wordColor: v }),

      // Reading — Adaptive Difficulty
      readingLevel: 5,
      setReadingLevel: (v) => set({ readingLevel: v, readingLevelTier: getTierName(v) }),
      readingLevelTier: 'Intermediate',
      textsCompletedAtLevel: 0,
      recentQuizScoresAtLevel: [],
      levelUpAvailable: false,
      checkLevelUpEligibility: () => {
        const state = get();
        const textsNeeded = 8;
        const minQuizzes = 3;
        const minAvgScore = 70;
        const hasVolume = state.textsCompletedAtLevel >= textsNeeded;
        const scores = state.recentQuizScoresAtLevel;
        const recentScores = scores.slice(-minQuizzes);
        const hasComprehension = recentScores.length >= minQuizzes
          && (recentScores.reduce((a, b) => a + b, 0) / recentScores.length) >= minAvgScore;
        const isReady = hasVolume && hasComprehension;
        if (isReady !== state.levelUpAvailable) {
          set({ levelUpAvailable: isReady });
        }
      },
      acceptLevelUp: () => {
        const state = get();
        const newLevel = state.readingLevel + 1;
        set({
          readingLevel: newLevel,
          readingLevelTier: getTierName(newLevel),
          textsCompletedAtLevel: 0,
          recentQuizScoresAtLevel: [],
          levelUpAvailable: false,
        });
      },
      dismissLevelUp: () => set({ levelUpAvailable: false }),
      sentenceRecap: false,
      setSentenceRecap: (v) => set({ sentenceRecap: v }),
      hapticFeedback: true,
      setHapticFeedback: (v) => set({ hapticFeedback: v }),
      breathingAnimation: true,
      setBreathingAnimation: (v) => set({ breathingAnimation: v }),

      // Audio
      ttsSpeed: 'normal',
      setTtsSpeed: (v) => set({ ttsSpeed: v }),
      voiceGender: 'female',
      setVoiceGender: (v) => set({ voiceGender: v }),
      autoPlay: false,
      setAutoPlay: (v) => set({ autoPlay: v }),
      autoPlayWPM: 250,
      setAutoPlayWPM: (v) => set({ autoPlayWPM: v }),

      // Stats
      totalWordsRead: 0,
      textsCompleted: 0,
      currentStreak: 0,
      lastReadDate: null,
      incrementWordsRead: (count) =>
        set((s) => ({ totalWordsRead: s.totalWordsRead + count })),
      incrementTextsCompleted: () =>
        set((s) => ({ textsCompleted: s.textsCompleted + 1 })),
      updateStreak: () => {
        const now = Date.now();
        const state = get();

        // Parse last read timestamp (backward-compatible with old toDateString format)
        let lastReadMs = 0;
        if (state.lastReadDate) {
          const parsed = new Date(state.lastReadDate).getTime();
          if (!isNaN(parsed)) lastReadMs = parsed;
        }

        if (lastReadMs === 0) {
          // First time reading
          set({ currentStreak: 1, lastReadDate: new Date(now).toISOString() });
          return;
        }

        const HOURS_24 = 24 * 60 * 60 * 1000;
        const HOURS_48 = 48 * 60 * 60 * 1000;
        const elapsed = now - lastReadMs;

        if (elapsed < HOURS_24) {
          // Within same 24h window — still update lastReadDate so it's always fresh
          set({ lastReadDate: new Date(now).toISOString() });
          return;
        }

        if (elapsed <= HOURS_48) {
          // 24h–48h: consecutive day, increment streak
          set({
            currentStreak: state.currentStreak + 1,
            lastReadDate: new Date(now).toISOString(),
          });
        } else {
          // >48h gap — check freeze first (only honor if activated within last 48h)
          const freezeStillValid = state.streakFrozenTonight
            && state.streakFreezeActivatedDate
            && (now - new Date(state.streakFreezeActivatedDate).getTime()) < HOURS_48;
          if (freezeStillValid) {
            // Freeze saved the streak — consume it, increment, continue
            set({
              streakFreezes: Math.max(0, state.streakFreezes - 1),
              streakFrozenTonight: false,
              streakFreezeActivatedDate: null,
              currentStreak: state.currentStreak + 1,
              lastReadDate: new Date(now).toISOString(),
            });
          } else {
            // Streak broken — set pending restore (don't reset yet)
            set({
              pendingStreakRestore: {
                previousStreak: state.currentStreak,
                breakDate: new Date(now).toISOString(),
              },
              streakFrozenTonight: false,
              streakFreezeActivatedDate: null,
              // DON'T update currentStreak or lastReadDate yet
            });
          }
        }
      },

      // Resume
      resumeData: null,
      setResumeData: (v) => set({ resumeData: v }),

      // Multiple Resume Points
      resumePoints: {},
      setResumePoint: (key, data) =>
        set((s) => {
          const updated = { ...s.resumePoints };
          if (data === null) {
            delete updated[key];
          } else {
            updated[key] = data;
          }
          return { resumePoints: updated };
        }),
      clearResumePoint: (key) =>
        set((s) => {
          const updated = { ...s.resumePoints };
          delete updated[key];
          return { resumePoints: updated };
        }),

      // Custom Texts
      customTexts: [],
      addCustomText: (text) =>
        set((s) => ({ customTexts: [...s.customTexts, text] })),
      updateCustomText: (id, updates) =>
        set((s) => ({
          customTexts: s.customTexts.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      removeCustomText: (id) =>
        set((s) => ({
          customTexts: s.customTexts.filter((t) => t.id !== id),
        })),

      // Text Collections
      textCollections: [],
      addCollection: (collection) =>
        set((s) => ({ textCollections: [...s.textCollections, collection] })),
      removeCollection: (id) =>
        set((s) => ({
          textCollections: s.textCollections.filter((c) => c.id !== id),
          customTexts: s.customTexts.map((t) =>
            t.collectionId === id ? { ...t, collectionId: undefined } : t
          ),
        })),
      assignTextToCollection: (textId, collectionId) =>
        set((s) => ({
          customTexts: s.customTexts.map((t) =>
            t.id === textId ? { ...t, collectionId } : t
          ),
        })),

      // Chunk Reading
      chunkSize: 1,
      setChunkSize: (v) => set({ chunkSize: v }),

      // Comprehension
      avgComprehension: 0,
      totalQuizzesTaken: 0,
      perfectQuizzes: 0,
      updateComprehension: (score, totalQuestions) => {
        const state = get();
        const pct = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        const isPerfect = score === totalQuestions && totalQuestions > 0;
        const newTotal = state.totalQuizzesTaken + 1;
        const newPerfect = isPerfect ? state.perfectQuizzes + 1 : state.perfectQuizzes;
        const newAvg =
          (state.avgComprehension * state.totalQuizzesTaken + pct) / newTotal;

        const updates: Partial<SettingsState> = {
          avgComprehension: Math.round(newAvg),
          totalQuizzesTaken: newTotal,
          perfectQuizzes: newPerfect,
        };
        set(updates);

        // Unlock quiz badges
        const unlockBadge = get().unlockBadge;

        // First quiz
        if (newTotal === 1) {
          unlockBadge('quiz-first');
        }
        // Perfect score
        if (isPerfect) {
          unlockBadge('quiz-perfect');
          get().incrementWeeklyChallengeProgress('quiz_perfect', 1);
        }
        // 10 quizzes
        if (newTotal >= 10) {
          unlockBadge('quiz-10');
        }
        // 25 quizzes
        if (newTotal >= 25) {
          unlockBadge('quiz-25');
        }
        // Scholar: 10+ quizzes with 80%+ average
        if (newTotal >= 10 && Math.round(newAvg) >= 80) {
          unlockBadge('quiz-scholar');
        }
      },

      // Reading History & Badge System
      readingHistory: [],
      addReadingHistory: (entry) =>
        set((s) => {
          // Keep only the last 50 entries
          const updated = [entry, ...s.readingHistory].slice(0, 50);
          return { readingHistory: updated };
        }),
      categoryReadCounts: {},
      incrementCategoryReadCount: (categoryKey) =>
        set((s) => ({
          categoryReadCounts: {
            ...s.categoryReadCounts,
            [categoryKey]: (s.categoryReadCounts[categoryKey] ?? 0) + 1,
          },
        })),
      unlockedBadges: [],
      unlockBadge: (id) => {
        const state = get();
        if (state.unlockedBadges.includes(id)) return;

        const badge = getBadgeById(id);
        const updates: Partial<SettingsState> = {
          unlockedBadges: [...state.unlockedBadges, id],
          lastUnlockedBadgeId: id, // Track for badge-triggered upsells
        };

        // If badge has a reward, unlock it too
        if (badge?.reward) {
          if (!state.unlockedRewards.includes(badge.reward.id)) {
            updates.unlockedRewards = [...state.unlockedRewards, badge.reward.id];
          }
        }

        set(updates);
      },
      unlockedRewards: [],
      unlockReward: (id) =>
        set((s) => ({
          unlockedRewards: s.unlockedRewards.includes(id)
            ? s.unlockedRewards
            : [...s.unlockedRewards, id],
        })),
      hasUsedTTS: false,
      setHasUsedTTS: (v) => set({ hasUsedTTS: v }),

      // Notifications
      notificationsEnabled: false,
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      reminderHour: 20,
      reminderMinute: 0,
      setReminderTime: (hour, minute) =>
        set({ reminderHour: hour, reminderMinute: minute }),

      // Accessibility
      reduceMotion: false,
      setReduceMotion: (v) => set({ reduceMotion: v }),

      // Paywall
      showPaywall: false,
      setShowPaywall: (v) => set({ showPaywall: v }),
      paywallContext: null,
      setPaywallContext: (ctx) => {
        if (ctx === null) {
          set({ paywallContext: null, showPaywall: false });
        } else {
          const state = get();
          // Skip frequency limiting for intentional upgrade actions
          // All locked_* contexts are intentional taps; also settings_upgrade, custom_text_limit, trial_expired
          const isIntentional = ctx.startsWith('locked_') || ctx === 'settings_upgrade'
            || ctx === 'custom_text_limit' || ctx === 'trial_expired';
          // Frequency limiting only for passive/proactive paywalls
          if (!isIntentional && !state.canShowPaywall()) return;
          set({ paywallContext: ctx, showPaywall: true, lastPaywallShown: new Date().toISOString() });
        }
      },

      // Trial tracking
      trialFeaturesUsed: [],
      addTrialFeatureUsed: (feature) => {
        const state = get();
        if (state.trialActive && !state.trialFeaturesUsed.includes(feature)) {
          set({ trialFeaturesUsed: [...state.trialFeaturesUsed, feature] });
        }
      },
      savedPremiumSettings: null,
      savedPremiumSettingsExpiry: null,

      // Paywall analytics
      paywallDismissCount: 0,
      lastPaywallShown: null,
      incrementPaywallDismiss: () =>
        set((s) => ({ paywallDismissCount: s.paywallDismissCount + 1 })),
      canShowPaywall: () => {
        const state = get();
        if (!state.lastPaywallShown) return true;
        const elapsed = Date.now() - new Date(state.lastPaywallShown).getTime();
        const TWO_HOURS = 2 * 60 * 60 * 1000;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const cooldown = state.paywallDismissCount >= 3 ? TWENTY_FOUR_HOURS : TWO_HOURS;
        return elapsed >= cooldown;
      },

      // Nudge tracking
      hasShownThirdReadingNudge: false,
      setHasShownThirdReadingNudge: (v) => set({ hasShownThirdReadingNudge: v }),

      // FormSheet workaround
      selectedCategoryKey: null,
      setSelectedCategoryKey: (v) => set({ selectedCategoryKey: v }),

      // Daily upload limit
      dailyUploadDate: null,
      dailyUploadUsed: false,
      resetDailyUploadIfNewDay: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.dailyUploadDate !== today) {
          set({ dailyUploadDate: today, dailyUploadUsed: false });
        }
        // Also reset daily words if new day
        if (state.lastDailyResetDate !== today) {
          set({ dailyWordsToday: 0, lastDailyResetDate: today });
        }
      },
      useDailyUpload: () => {
        const today = new Date().toDateString();
        set({ dailyUploadDate: today, dailyUploadUsed: true });
      },

      // Daily word goal
      dailyWordGoal: 100,
      setDailyWordGoal: (v) => set({ dailyWordGoal: v }),
      dailyWordsToday: 0,
      addDailyWordsRead: (count) =>
        set((s) => ({ dailyWordsToday: s.dailyWordsToday + count })),
      lastDailyResetDate: null,

      // Free quiz per day (foot-in-door strategy)
      freeQuizUsedToday: false,
      lastFreeQuizDate: null,
      useFreeQuiz: () => {
        const today = new Date().toDateString();
        set({ freeQuizUsedToday: true, lastFreeQuizDate: today });
      },
      canUseFreeQuiz: () => {
        const state = get();
        const today = new Date().toDateString();
        // Reset state if new day (consistent with resetDailyUploadIfNewDay pattern)
        if (state.lastFreeQuizDate !== today) {
          set({ freeQuizUsedToday: false, lastFreeQuizDate: today });
          return true;
        }
        return !state.freeQuizUsedToday;
      },

      // Badge upsell tracking
      lastUnlockedBadgeId: null,
      clearLastUnlockedBadge: () => set({ lastUnlockedBadgeId: null }),

      // Streak Freeze & Restore
      streakFreezes: 0,
      streakRestores: 0,
      lastStreakRefillDate: null,
      streakFrozenTonight: false,
      streakFreezeActivatedDate: null,
      pendingStreakRestore: null,

      refillStreakAllowancesIfNewMonth: () => {
        const state = get();
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (state.lastStreakRefillDate !== currentMonth) {
          const updates: Partial<SettingsState> = { lastStreakRefillDate: currentMonth };
          if (state.isPremium) {
            updates.streakFreezes = 2;
            updates.streakRestores = 3;
          }
          set(updates);
        }
      },

      activateStreakFreeze: () => {
        const state = get();
        if (state.isPremium && state.streakFreezes > 0 && !state.streakFrozenTonight) {
          set({
            streakFrozenTonight: true,
            streakFreezeActivatedDate: new Date().toISOString(),
          });
          return true;
        }
        return false;
      },

      deactivateStreakFreeze: () => set({ streakFrozenTonight: false, streakFreezeActivatedDate: null }),

      useStreakRestore: () => {
        const state = get();
        if (!state.pendingStreakRestore) return;
        set({
          streakRestores: Math.max(0, state.streakRestores - 1),
          currentStreak: state.pendingStreakRestore.previousStreak,
          lastReadDate: new Date().toISOString(),
          pendingStreakRestore: null,
        });
      },

      dismissStreakRestore: () => {
        set({
          currentStreak: 1,
          lastReadDate: new Date().toISOString(),
          pendingStreakRestore: null,
        });
      },

      addPurchasedRestore: () =>
        set((s) => ({ streakRestores: s.streakRestores + 1 })),

      // Weekly Challenge
      weeklyChallengeWeek: null,
      weeklyChallengeProgress: 0,
      weeklyChallengeCompleted: false,
      weeklyChallengesCompleted: 0,
      weeklyCategoriesRead: [],

      checkWeeklyChallenge: () => {
        const { getCurrentWeekId } = require('../data/challenges');
        const currentWeek = getCurrentWeekId();
        const state = get();
        if (state.weeklyChallengeWeek !== currentWeek) {
          set({
            weeklyChallengeWeek: currentWeek,
            weeklyChallengeProgress: 0,
            weeklyChallengeCompleted: false,
            weeklyCategoriesRead: [],
          });
        }
      },

      incrementWeeklyChallengeProgress: (type: string, amount: number) => {
        const { getCurrentChallenge, getCurrentWeekId } = require('../data/challenges');
        const state = get();
        const currentWeek = getCurrentWeekId();
        if (state.weeklyChallengeWeek !== currentWeek) return;
        if (state.weeklyChallengeCompleted) return;

        const challenge = getCurrentChallenge();
        if (challenge.type !== type) return;

        const newProgress = state.weeklyChallengeProgress + amount;
        const updates: Partial<SettingsState> = {
          weeklyChallengeProgress: newProgress,
        };
        if (newProgress >= challenge.target) {
          updates.weeklyChallengeCompleted = true;
          updates.weeklyChallengesCompleted = state.weeklyChallengesCompleted + 1;
        }
        set(updates);
      },

      // Reading Insights
      weeklyWordCounts: {},
      weeklyReadingDays: {},
      weeklyAvgWPM: {},
      longestStreak: 0,
      dailyReadingLog: {},
      recordWeeklyReading: (words, wpm) => {
        const state = get();
        const now = new Date();
        const dayKey = now.toISOString().slice(0, 10);

        // Get ISO week key (YYYY-WNN)
        const weekKey = getISOWeekId(now);

        // Update weekly word count
        const newWeeklyWordCounts = { ...state.weeklyWordCounts };
        newWeeklyWordCounts[weekKey] = (newWeeklyWordCounts[weekKey] ?? 0) + words;

        // Update weekly reading days
        const newWeeklyReadingDays = { ...state.weeklyReadingDays };
        const days = newWeeklyReadingDays[weekKey] ?? [];
        if (!days.includes(dayKey)) {
          newWeeklyReadingDays[weekKey] = [...days, dayKey];
        }

        // Update weekly avg WPM (running average)
        const newWeeklyAvgWPM = { ...state.weeklyAvgWPM };
        const existingWPM = newWeeklyAvgWPM[weekKey];
        newWeeklyAvgWPM[weekKey] = existingWPM
          ? Math.round((existingWPM + wpm) / 2)
          : wpm;

        // Update daily reading log
        const newDailyLog = { ...state.dailyReadingLog };
        newDailyLog[dayKey] = (newDailyLog[dayKey] ?? 0) + words;

        // Update longest streak
        const newLongest = Math.max(state.longestStreak, state.currentStreak);

        set({
          weeklyWordCounts: newWeeklyWordCounts,
          weeklyReadingDays: newWeeklyReadingDays,
          weeklyAvgWPM: newWeeklyAvgWPM,
          dailyReadingLog: newDailyLog,
          longestStreak: newLongest,
        });
      },

      // Favorite Words
      favoriteWords: [],
      toggleFavoriteWord: (word) =>
        set((s) => ({
          favoriteWords: s.favoriteWords.includes(word)
            ? s.favoriteWords.filter((w) => w !== word)
            : [...s.favoriteWords, word],
        })),

      // Saved Words (Word Bank)
      savedWords: [],
      addSavedWord: (word) =>
        set((s) => {
          // Prevent duplicates by word text
          if (s.savedWords.some((w) => w.word === word.word)) return s;
          return { savedWords: [...s.savedWords, word] };
        }),
      removeSavedWord: (id) =>
        set((s) => ({
          savedWords: s.savedWords.filter((w) => w.id !== id),
        })),

      // Computed helper
      trialDaysRemaining: () => {
        const state = get();
        if (!state.trialActive || !state.trialStartDate) return 0;
        const elapsed = Date.now() - new Date(state.trialStartDate).getTime();
        const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
        const remaining = THREE_DAYS - elapsed;
        return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
      },

      // Reset
      resetAll: () => set({
        hasOnboarded: false,
        isPremium: false,
        themeMode: 'light',
        backgroundTheme: 'default',
        fontFamily: 'sourceSerif',
        wordSize: 48,
        wordBold: false,
        wordColor: 'default',
        readingLevel: 5,
        readingLevelTier: 'Intermediate',
        textsCompletedAtLevel: 0,
        recentQuizScoresAtLevel: [],
        levelUpAvailable: false,
        sentenceRecap: false,
        hapticFeedback: true,
        breathingAnimation: true,
        ttsSpeed: 'normal',
        voiceGender: 'female' as VoiceGender,
        autoPlay: false,
        autoPlayWPM: 250,
        totalWordsRead: 0,
        textsCompleted: 0,
        currentStreak: 0,
        lastReadDate: null,
        resumeData: null,
        resumePoints: {},
        customTexts: [],
        textCollections: [],
        chunkSize: 1 as 1 | 2 | 3,
        avgComprehension: 0,
        totalQuizzesTaken: 0,
        perfectQuizzes: 0,
        readingHistory: [],
        categoryReadCounts: {},
        unlockedBadges: [],
        unlockedRewards: [],
        hasUsedTTS: false,
        notificationsEnabled: false,
        reminderHour: 20,
        reminderMinute: 0,
        reduceMotion: false,
        showPaywall: false,
        paywallContext: null,
        trialFeaturesUsed: [],
        savedPremiumSettings: null,
        savedPremiumSettingsExpiry: null,
        paywallDismissCount: 0,
        lastPaywallShown: null,
        hasShownThirdReadingNudge: false,
        trialStartDate: null,
        trialActive: false,
        selectedCategoryKey: null,
        dailyUploadDate: null,
        dailyUploadUsed: false,
        dailyWordGoal: 100,
        dailyWordsToday: 0,
        lastDailyResetDate: null,
        freeQuizUsedToday: false,
        lastFreeQuizDate: null,
        lastUnlockedBadgeId: null,
        streakFreezes: 0,
        streakRestores: 0,
        lastStreakRefillDate: null,
        streakFrozenTonight: false,
        streakFreezeActivatedDate: null,
        pendingStreakRestore: null,
        weeklyChallengeWeek: null,
        weeklyChallengeProgress: 0,
        weeklyChallengeCompleted: false,
        weeklyChallengesCompleted: 0,
        weeklyCategoriesRead: [],
        weeklyWordCounts: {},
        weeklyReadingDays: {},
        weeklyAvgWPM: {},
        longestStreak: 0,
        dailyReadingLog: {},
        favoriteWords: [],
        savedWords: [],
      }),
    }),
    {
      name: 'articulate-settings',
      version: 10,
      storage: createJSONStorage(() => mmkvStorage),
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          // Migrate users who had newYork font (removed in v1)
          if (persisted.fontFamily === 'newYork') {
            persisted.fontFamily = 'sourceSerif';
          }
          if (persisted.savedPremiumSettings?.fontFamily === 'newYork') {
            persisted.savedPremiumSettings.fontFamily = 'sourceSerif';
          }
        }
        if (version < 2) {
          // v2: add daily upload limit, daily word goal, formSheet workaround fields
          persisted.selectedCategoryKey = persisted.selectedCategoryKey ?? null;
          persisted.dailyUploadDate = persisted.dailyUploadDate ?? null;
          persisted.dailyUploadUsed = persisted.dailyUploadUsed ?? false;
          persisted.dailyWordGoal = persisted.dailyWordGoal ?? 100;
          persisted.dailyWordsToday = persisted.dailyWordsToday ?? 0;
          persisted.lastDailyResetDate = persisted.lastDailyResetDate ?? null;
        }
        if (version < 3) {
          // v3: add voice gender
          persisted.voiceGender = persisted.voiceGender ?? 'female';
        }
        if (version < 4) {
          // v4: add reading history, badge system
          persisted.readingHistory = persisted.readingHistory ?? [];
          persisted.categoryReadCounts = persisted.categoryReadCounts ?? {};
          persisted.unlockedBadges = persisted.unlockedBadges ?? [];
          persisted.unlockedRewards = persisted.unlockedRewards ?? [];
          persisted.hasUsedTTS = persisted.hasUsedTTS ?? false;
        }
        if (version < 5) {
          // v5: add quiz achievements tracking
          persisted.perfectQuizzes = persisted.perfectQuizzes ?? 0;
        }
        if (version < 6) {
          // v6: add free quiz per day, badge upsell tracking
          persisted.freeQuizUsedToday = persisted.freeQuizUsedToday ?? false;
          persisted.lastFreeQuizDate = persisted.lastFreeQuizDate ?? null;
          persisted.lastUnlockedBadgeId = persisted.lastUnlockedBadgeId ?? null;
        }
        if (version < 7) {
          // v7: streak freeze/restore, weekly challenge
          persisted.streakFreezes = persisted.streakFreezes ?? 0;
          persisted.streakRestores = persisted.streakRestores ?? 0;
          persisted.lastStreakRefillDate = persisted.lastStreakRefillDate ?? null;
          persisted.streakFrozenTonight = persisted.streakFrozenTonight ?? false;
          persisted.pendingStreakRestore = persisted.pendingStreakRestore ?? null;
          persisted.weeklyChallengeWeek = persisted.weeklyChallengeWeek ?? null;
          persisted.weeklyChallengeProgress = persisted.weeklyChallengeProgress ?? 0;
          persisted.weeklyChallengeCompleted = persisted.weeklyChallengeCompleted ?? false;
          persisted.weeklyChallengesCompleted = persisted.weeklyChallengesCompleted ?? 0;
          persisted.weeklyCategoriesRead = persisted.weeklyCategoriesRead ?? [];
        }
        if (version < 8) {
          // v8: streak freeze expiration, remove unused fields
          persisted.streakFreezeActivatedDate = persisted.streakFreezeActivatedDate ?? null;
          // Clear stale streak freeze (no activation date = indefinite, clear it)
          if (persisted.streakFrozenTonight && !persisted.streakFreezeActivatedDate) {
            persisted.streakFrozenTonight = false;
          }
          // Remove unused fields
          delete persisted.baselineWPM;
          delete persisted.highContrast;
          delete persisted.unlockedAchievements;
        }
        if (version < 9) {
          // v9: Theme restructuring — reset free users off premium themes
          // Premium themes now have explicit `premium: true` flag
          const premiumThemeKeys = ['paper', 'stone', 'sepia'];
          if (!persisted.isPremium && !persisted.trialActive &&
              premiumThemeKeys.includes(persisted.backgroundTheme)) {
            persisted.backgroundTheme = 'default';
          }
          // Initialize new fields for phases 3-7
          // Custom library enhancements
          if (Array.isArray(persisted.customTexts)) {
            persisted.customTexts = persisted.customTexts.map((ct: any) => ({
              ...ct,
              timesRead: ct.timesRead ?? 0,
              source: ct.source ?? 'paste',
              preview: ct.preview ?? (ct.text ? ct.text.slice(0, 120) : ''),
            }));
          }
          persisted.textCollections = persisted.textCollections ?? [];
          // Reading insights
          persisted.weeklyWordCounts = persisted.weeklyWordCounts ?? {};
          persisted.weeklyReadingDays = persisted.weeklyReadingDays ?? {};
          persisted.weeklyAvgWPM = persisted.weeklyAvgWPM ?? {};
          persisted.longestStreak = persisted.longestStreak ?? (persisted.currentStreak ?? 0);
          persisted.dailyReadingLog = persisted.dailyReadingLog ?? {};
          // Adaptive difficulty — convert string readingLevel to numeric
          const levelMap: Record<string, number> = { beginner: 2, intermediate: 5, advanced: 8 };
          if (typeof persisted.readingLevel === 'string') {
            persisted.readingLevel = levelMap[persisted.readingLevel] ?? 5;
          }
          persisted.readingLevelTier = persisted.readingLevelTier ?? 'intermediate';
          persisted.textsCompletedAtLevel = persisted.textsCompletedAtLevel ?? 0;
          persisted.recentQuizScoresAtLevel = persisted.recentQuizScoresAtLevel ?? [];
          persisted.levelUpAvailable = persisted.levelUpAvailable ?? false;
          // Favorite words
          persisted.favoriteWords = persisted.favoriteWords ?? [];
        }
        if (version < 10) {
          // v10: add saved words (word bank)
          persisted.savedWords = persisted.savedWords ?? [];
        }
        return persisted;
      },
    }
  )
);
