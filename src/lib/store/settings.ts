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

// New 5-level system thresholds (words) — lowered for better progression feel
export const LEVEL_THRESHOLDS = [0, 750, 2500, 5500, 10000];
export const LEVEL_NAMES = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'] as const;

// Streak celebration milestones - single source of truth
export const STREAK_MILESTONES = [3, 5, 7, 14, 21, 30, 50, 75, 100, 150, 200, 250, 300, 365];
export type LevelName = typeof LEVEL_NAMES[number];

// Compute current level from levelProgress (1-5)
export function getCurrentLevel(levelProgress: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (levelProgress >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

// Get level name from levelProgress
export function getLevelName(levelProgress: number): LevelName {
  const level = getCurrentLevel(levelProgress);
  return LEVEL_NAMES[level - 1];
}

// Get progress toward next level (0-100)
export function getProgressToNextLevel(levelProgress: number): number {
  const level = getCurrentLevel(levelProgress);
  if (level >= 5) return 100; // Mastery achieved
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  const progressInLevel = levelProgress - currentThreshold;
  const levelRange = nextThreshold - currentThreshold;
  return Math.min(100, Math.round((progressInLevel / levelRange) * 100));
}

// Get words needed for next level
export function getWordsToNextLevel(levelProgress: number): number {
  const level = getCurrentLevel(levelProgress);
  if (level >= 5) return 0; // Mastery achieved
  const nextThreshold = LEVEL_THRESHOLDS[level];
  return nextThreshold - levelProgress;
}

export type PaywallContext =
  | 'post_onboarding' | 'locked_category' | 'custom_text_limit'
  | 'locked_font' | 'locked_color' | 'locked_size' | 'locked_bold'
  | 'locked_background' | 'locked_autoplay' | 'locked_chunk'
  | 'locked_breathing' | 'locked_tts' | 'locked_quiz'
  | 'locked_daily_upload' | 'locked_scan' | 'streak_save' | 'goal_almost'
  | 'trial_expired' | 'settings_upgrade' | 'locked_insights'
  | 'locked_level_up' | 'locked_definition' | 'locked_word_bank'
  | 'locked_library' | 'locked_library_words' | 'locked_library_faves' | 'locked_library_texts'
  | 'locked_pronunciation'
  | 'generic';

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

export interface FavoriteText {
  categoryKey: string;
  textId: string;
  savedAt: string;
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

export type TextDifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SettingsState {
  // Onboarding
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  isFirstReading: boolean;
  setIsFirstReading: (v: boolean) => void;

  // Premium
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;

  // Trial
  trialStartDate: string | null;
  trialActive: boolean;
  startTrial: () => void;
  checkTrialExpired: () => boolean;

  // Profile Customization
  displayName: string | null;
  setDisplayName: (v: string | null) => void;
  profileImage: string | null;
  setProfileImage: (v: string | null) => void;
  profileColor: string;
  setProfileColor: (v: string) => void;

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

  // Reading — Level Progress (new 5-level system)
  levelProgress: number;
  addLevelProgress: (words: number) => void;
  addQuizProgress: (scorePercent: number) => void;
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
  hasUsedPronunciation: boolean;
  setHasUsedPronunciation: (v: boolean) => void;

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

  // Free user text limit (1 text, expires after 24h)
  cleanupExpiredFreeTexts: () => void;
  canFreeUserUpload: () => boolean;
  getFreeTextExpiry: () => number | null;
  getFreeUserActiveText: () => CustomText | null;
  resetDailyIfNewDay: () => void;

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

  // Favorite Texts (Bundled texts saved to library)
  favoriteTexts: FavoriteText[];
  addFavoriteText: (categoryKey: string, textId: string) => void;
  removeFavoriteText: (categoryKey: string, textId: string) => void;
  isFavoriteText: (categoryKey: string, textId: string) => boolean;

  // Difficulty Tracking
  beginnerTextsCompleted: number;
  intermediateTextsCompleted: number;
  advancedTextsCompleted: number;
  incrementDifficultyCount: (difficulty: TextDifficultyLevel) => void;

  // Pronunciation Tracking
  perfectPronunciations: number;
  incrementPerfectPronunciations: () => void;

  // Streak Celebrations
  shownStreakCelebrations: number[];
  markStreakCelebrationShown: (milestone: number) => void;

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
      isFirstReading: false,
      setIsFirstReading: (v) => set({ isFirstReading: v }),

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

      // Profile Customization
      displayName: null,
      setDisplayName: (v) => set({ displayName: v }),
      profileImage: null,
      setProfileImage: (v) => set({ profileImage: v }),
      profileColor: '#A78BFA', // Default purple
      setProfileColor: (v) => set({ profileColor: v }),

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

      // Reading — Level Progress (new 5-level system)
      levelProgress: 0,
      addLevelProgress: (words) => {
        const state = get();
        const oldLevel = getCurrentLevel(state.levelProgress);
        const newProgress = state.levelProgress + words;
        const newLevel = getCurrentLevel(newProgress);

        set({ levelProgress: newProgress });

        // Check for level-up badges (thresholds match LEVEL_THRESHOLDS)
        if (newLevel > oldLevel) {
          const unlockBadge = get().unlockBadge;
          if (newLevel >= 2) unlockBadge('reached-intermediate');
          if (newLevel >= 3) unlockBadge('reached-advanced');
          if (newLevel >= 4) unlockBadge('reached-expert');
          if (newLevel >= 5) unlockBadge('reached-master');
        }

        // 50K words milestone: award 3-day Pro trial
        // Note: totalWordsRead was already updated by incrementWordsRead before this runs
        // So we check if it JUST crossed 50K (was below before adding these words)
        // Badge ('words-50k') is unlocked separately via complete.tsx checkBadges
        const prevTotalWords = state.totalWordsRead - words;
        if (prevTotalWords < 50000 && state.totalWordsRead >= 50000) {
          const currentState = get();
          if (!currentState.isPremium && !currentState.trialActive) {
            get().startTrial();
          }
        }
      },
      addQuizProgress: (scorePercent) => {
        // Quiz bonus: 100 base + 25 for 80%+ + 25 for 100%
        let bonus = 100;
        if (scorePercent >= 80) bonus += 25;
        if (scorePercent === 100) bonus += 25;

        const state = get();
        const oldLevel = getCurrentLevel(state.levelProgress);
        const newProgress = state.levelProgress + bonus;
        const newLevel = getCurrentLevel(newProgress);

        set({ levelProgress: newProgress });

        // Check for level-up badges (thresholds match LEVEL_THRESHOLDS)
        if (newLevel > oldLevel) {
          const unlockBadge = get().unlockBadge;
          if (newLevel >= 2) unlockBadge('reached-intermediate');
          if (newLevel >= 3) unlockBadge('reached-advanced');
          if (newLevel >= 4) unlockBadge('reached-expert');
          if (newLevel >= 5) unlockBadge('reached-master');
        }
      },
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
      hasUsedPronunciation: false,
      setHasUsedPronunciation: (v) => set({ hasUsedPronunciation: v }),

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
          // All locked_* contexts are intentional taps; also settings_upgrade, custom_text_limit, trial_expired, generic
          const isIntentional = ctx.startsWith('locked_') || ctx === 'settings_upgrade'
            || ctx === 'custom_text_limit' || ctx === 'trial_expired' || ctx === 'generic';
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

      // Free user text limit (1 text, expires after 24h)
      cleanupExpiredFreeTexts: () => {
        const state = get();
        if (state.isPremium) return; // Premium users keep everything

        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        const expiredIds = state.customTexts
          .filter((t) => {
            const createdTime = new Date(t.createdAt).getTime();
            return now - createdTime > TWENTY_FOUR_HOURS;
          })
          .map((t) => t.id);

        if (expiredIds.length > 0) {
          set({
            customTexts: state.customTexts.filter((t) => !expiredIds.includes(t.id)),
          });
        }
      },

      canFreeUserUpload: () => {
        const state = get();
        if (state.isPremium) return true;

        // Free users can only have 1 text at a time
        // Check if they have any non-expired texts
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        const activeTexts = state.customTexts.filter((t) => {
          const createdTime = new Date(t.createdAt).getTime();
          return now - createdTime < TWENTY_FOUR_HOURS;
        });

        return activeTexts.length === 0;
      },

      getFreeTextExpiry: () => {
        const state = get();
        if (state.isPremium) return null;
        if (state.customTexts.length === 0) return null;

        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        // Get the most recent text
        const sortedTexts = [...state.customTexts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const activeText = sortedTexts[0];
        const createdTime = new Date(activeText.createdAt).getTime();
        const expiryTime = createdTime + TWENTY_FOUR_HOURS;
        const now = Date.now();

        if (now >= expiryTime) return 0; // Already expired
        return expiryTime - now; // Milliseconds until expiry
      },

      getFreeUserActiveText: () => {
        const state = get();
        if (state.isPremium) return null;
        if (state.customTexts.length === 0) return null;

        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        // Find the active (non-expired) text
        const activeTexts = state.customTexts.filter((t) => {
          const createdTime = new Date(t.createdAt).getTime();
          return now - createdTime < TWENTY_FOUR_HOURS;
        });

        return activeTexts.length > 0 ? activeTexts[0] : null;
      },

      // Daily reset helper (for daily words tracking)
      resetDailyIfNewDay: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastDailyResetDate !== today) {
          set({ dailyWordsToday: 0, lastDailyResetDate: today });
        }
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
        // Reset state if new day
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

      // Favorite Texts (Bundled texts saved to library)
      favoriteTexts: [],
      addFavoriteText: (categoryKey, textId) =>
        set((s) => {
          // Prevent duplicates
          if (s.favoriteTexts.some((f) => f.categoryKey === categoryKey && f.textId === textId)) {
            return s;
          }
          return {
            favoriteTexts: [
              ...s.favoriteTexts,
              { categoryKey, textId, savedAt: new Date().toISOString() },
            ],
          };
        }),
      removeFavoriteText: (categoryKey, textId) =>
        set((s) => ({
          favoriteTexts: s.favoriteTexts.filter(
            (f) => !(f.categoryKey === categoryKey && f.textId === textId)
          ),
        })),
      isFavoriteText: (categoryKey, textId) => {
        const state = get();
        return state.favoriteTexts.some(
          (f) => f.categoryKey === categoryKey && f.textId === textId
        );
      },

      // Difficulty Tracking
      beginnerTextsCompleted: 0,
      intermediateTextsCompleted: 0,
      advancedTextsCompleted: 0,
      incrementDifficultyCount: (difficulty) => {
        const state = get();
        const updates: Partial<SettingsState> = {};
        if (difficulty === 'beginner') {
          updates.beginnerTextsCompleted = state.beginnerTextsCompleted + 1;
        } else if (difficulty === 'intermediate') {
          updates.intermediateTextsCompleted = state.intermediateTextsCompleted + 1;
        } else if (difficulty === 'advanced') {
          updates.advancedTextsCompleted = state.advancedTextsCompleted + 1;
        }
        set(updates);
      },

      // Pronunciation Tracking
      perfectPronunciations: 0,
      incrementPerfectPronunciations: () => {
        const state = get();
        const newCount = state.perfectPronunciations + 1;
        set({ perfectPronunciations: newCount });

        // +5 level progress per perfect pronunciation
        get().addLevelProgress(5);

        // Pronunciation badges
        const unlockBadge = get().unlockBadge;
        if (newCount >= 50) unlockBadge('pronunciation-50');
        if (newCount >= 200) unlockBadge('pronunciation-200');
        if (newCount >= 500) unlockBadge('pronunciation-500');
      },

      // Streak Celebrations
      shownStreakCelebrations: [],
      markStreakCelebrationShown: (milestone) =>
        set((s) => ({
          shownStreakCelebrations: s.shownStreakCelebrations.includes(milestone)
            ? s.shownStreakCelebrations
            : [...s.shownStreakCelebrations, milestone],
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
        isFirstReading: false,
        isPremium: false,
        displayName: null,
        profileImage: null,
        profileColor: '#A78BFA',
        themeMode: 'light',
        backgroundTheme: 'default',
        fontFamily: 'sourceSerif',
        wordSize: 48,
        wordBold: false,
        wordColor: 'default',
        levelProgress: 0,
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
        hasUsedPronunciation: false,
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
        favoriteTexts: [],
        beginnerTextsCompleted: 0,
        intermediateTextsCompleted: 0,
        advancedTextsCompleted: 0,
        perfectPronunciations: 0,
        shownStreakCelebrations: [],
      }),
    }),
    {
      name: 'articulate-settings',
      version: 19,
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
        if (version < 11) {
          // v11: add favorite texts (bundled texts saved to library)
          persisted.favoriteTexts = persisted.favoriteTexts ?? [];
        }
        if (version < 12) {
          // v12: add maxEarnedLevel — users can only lower their level, not raise it
          persisted.maxEarnedLevel = persisted.maxEarnedLevel ?? (persisted.readingLevel ?? 5);
        }
        if (version < 13) {
          // v13: New 5-level system
          // Initialize levelProgress from existing totalWordsRead
          persisted.levelProgress = persisted.totalWordsRead ?? 0;
          // Old level fields are deprecated but kept for reference (will be ignored)
          // readingLevel, maxEarnedLevel, readingLevelTier, textsCompletedAtLevel,
          // recentQuizScoresAtLevel, levelUpAvailable
        }
        if (version < 14) {
          // v14: Profile customization
          persisted.profileImage = persisted.profileImage ?? null;
          persisted.profileColor = persisted.profileColor ?? '#A78BFA';
        }
        if (version < 15) {
          // v15: Difficulty tracking
          persisted.beginnerTextsCompleted = persisted.beginnerTextsCompleted ?? 0;
          persisted.intermediateTextsCompleted = persisted.intermediateTextsCompleted ?? 0;
          persisted.advancedTextsCompleted = persisted.advancedTextsCompleted ?? 0;
        }
        if (version < 16) {
          // v16: Streak celebration tracking
          persisted.shownStreakCelebrations = persisted.shownStreakCelebrations ?? [];
        }
        if (version < 17) {
          // v17: Pronunciation practice
          persisted.hasUsedPronunciation = persisted.hasUsedPronunciation ?? false;
        }
        if (version < 18) {
          // v18: Pronunciation counter, category renames, lowered thresholds
          persisted.perfectPronunciations = persisted.perfectPronunciations ?? 0;

          // ── Category key renames: article→essay, literature→fiction, mindfulness→wisdom ──
          const keyRenames: Record<string, string> = {
            article: 'essay',
            literature: 'fiction',
            mindfulness: 'wisdom',
          };

          // Migrate categoryReadCounts
          const counts = persisted.categoryReadCounts ?? {};
          for (const [oldKey, newKey] of Object.entries(keyRenames)) {
            if (counts[oldKey] !== undefined) {
              counts[newKey] = (counts[newKey] ?? 0) + counts[oldKey];
              delete counts[oldKey];
            }
          }
          persisted.categoryReadCounts = counts;

          // Migrate readingHistory entries
          if (Array.isArray(persisted.readingHistory)) {
            persisted.readingHistory = persisted.readingHistory.map((entry: any) => {
              if (entry.categoryKey && keyRenames[entry.categoryKey]) {
                return { ...entry, categoryKey: keyRenames[entry.categoryKey] };
              }
              return entry;
            });
          }

          // Migrate weeklyCategoriesRead
          if (Array.isArray(persisted.weeklyCategoriesRead)) {
            persisted.weeklyCategoriesRead = persisted.weeklyCategoriesRead.map(
              (key: string) => keyRenames[key] ?? key
            );
          }

          // Migrate favoriteTexts
          if (Array.isArray(persisted.favoriteTexts)) {
            persisted.favoriteTexts = persisted.favoriteTexts.map((fav: any) => {
              if (fav.categoryKey && keyRenames[fav.categoryKey]) {
                return { ...fav, categoryKey: keyRenames[fav.categoryKey] };
              }
              return fav;
            });
          }

          // Migrate resumePoints keys
          if (persisted.resumePoints && typeof persisted.resumePoints === 'object') {
            const newResumePoints: Record<string, any> = {};
            for (const [key, value] of Object.entries(persisted.resumePoints)) {
              let newKey = key;
              for (const [oldCat, newCat] of Object.entries(keyRenames)) {
                newKey = newKey.replace(oldCat, newCat);
              }
              const entry = value as any;
              if (entry?.categoryKey && keyRenames[entry.categoryKey]) {
                newResumePoints[newKey] = { ...entry, categoryKey: keyRenames[entry.categoryKey] };
              } else {
                newResumePoints[newKey] = entry;
              }
            }
            persisted.resumePoints = newResumePoints;
          }

          // Migrate resumeData
          if (persisted.resumeData?.categoryKey && keyRenames[persisted.resumeData.categoryKey]) {
            persisted.resumeData = {
              ...persisted.resumeData,
              categoryKey: keyRenames[persisted.resumeData.categoryKey],
            };
          }

          // Migrate badge IDs: category-article-* → category-essay-*, etc.
          const badges: string[] = persisted.unlockedBadges ?? [];
          persisted.unlockedBadges = badges.map((id: string) => {
            for (const [oldKey, newKey] of Object.entries(keyRenames)) {
              if (id.includes(`category-${oldKey}-`)) {
                return id.replace(`category-${oldKey}-`, `category-${newKey}-`);
              }
            }
            return id;
          });

          // Auto-unlock badges from lowered thresholds
          // (Note: v19 migration below adds displayName)
          const updatedBadges = persisted.unlockedBadges;
          const unlockIfEarned = (id: string) => {
            if (!updatedBadges.includes(id)) updatedBadges.push(id);
          };

          // Level badges (new thresholds: 750, 2500, 5500, 10000)
          const lp = persisted.levelProgress ?? 0;
          if (lp >= 750) unlockIfEarned('reached-intermediate');
          if (lp >= 2500) unlockIfEarned('reached-advanced');
          if (lp >= 5500) unlockIfEarned('reached-expert');
          if (lp >= 10000) unlockIfEarned('reached-master');

          // Gold category badges (new threshold: 15, using NEW key names)
          const newCatKeys = ['story', 'essay', 'speech', 'philosophy', 'science', 'fiction', 'poetry', 'history', 'wisdom'];
          for (const key of newCatKeys) {
            const count = persisted.categoryReadCounts[key] ?? 0;
            if (count >= 15) unlockIfEarned(`category-${key}-gold`);
          }
        }
        if (version < 19) {
          // v19: Display name for profile
          persisted.displayName = persisted.displayName ?? null;
        }
        return persisted;
      },
    }
  )
);
