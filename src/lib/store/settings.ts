import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { FontFamilyKey, WordColorKey } from '../../design/theme';
import { getBadgeById } from '../data/badges';
import { getISOWeekId } from '../date';

const storage = new MMKV({ id: 'articulate-mmkv' });

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

function generateDeviceUserId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === 'function') {
    return randomUUID.call(globalThis.crypto);
  }
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

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
// After Level 5, shows progress toward next 10K milestone
export function getProgressToNextLevel(levelProgress: number): number {
  if (!Number.isFinite(levelProgress) || levelProgress <= 0) return 0;

  const level = getCurrentLevel(levelProgress);
  if (level >= 5) {
    // Endgame: show progress toward next 10K milestone (10K, 20K, 30K...)
    // At exact milestones (10K, 20K), show 0% (new cycle started)
    const currentMilestone = Math.floor(levelProgress / 10000) * 10000;
    const nextMilestone = currentMilestone + 10000;
    const progressInMilestone = levelProgress - currentMilestone;
    return Math.min(100, Math.max(0, Math.round((progressInMilestone / (nextMilestone - currentMilestone)) * 100)));
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  const progressInLevel = levelProgress - currentThreshold;
  const levelRange = nextThreshold - currentThreshold;
  return Math.min(100, Math.max(0, Math.round((progressInLevel / levelRange) * 100)));
}

// Get words needed for next level (or next 10K milestone after Level 5)
export function getWordsToNextLevel(levelProgress: number): number {
  const level = getCurrentLevel(levelProgress);
  if (level >= 5) {
    // Endgame: words to next 10K milestone
    const milestone = Math.ceil(levelProgress / 10000) * 10000;
    if (milestone === levelProgress) return 10000; // Exactly at milestone, next is +10K
    return milestone - levelProgress;
  }
  const nextThreshold = LEVEL_THRESHOLDS[level];
  return nextThreshold - levelProgress;
}

// Get total words label for endgame display
export function getTotalWordsLabel(levelProgress: number): string {
  return `${levelProgress.toLocaleString()} words mastered`;
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
  | 'locked_ai_practice'
  | 'locked_wind_down'
  | 'streak_freeze'
  | 'generic';

export interface SavedWord {
  id: string;
  word: string;
  syllables?: string;
  partOfSpeech?: string;
  definition?: string;
  etymology?: string;
  savedAt: string;
  sourceText?: string;
  sourceCategory?: string;
  lastReviewedDate?: string;
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
  soundEffects: boolean;
  setSoundEffects: (v: boolean) => void;
  breathingAnimation: boolean;
  setBreathingAnimation: (v: boolean) => void;
  windDownMode: boolean;
  setWindDownMode: (v: boolean) => void;

  // Wind-down v2: Sleep Timer
  sleepTimerMinutes: number;
  setSleepTimerMinutes: (v: number) => void;

  // Wind-down v2: Bedtime Reminder
  windDownReminderEnabled: boolean;
  windDownReminderHour: number;
  windDownReminderMinute: number;
  setWindDownReminderEnabled: (v: boolean) => void;
  setWindDownReminderTime: (hour: number, minute: number) => void;

  // Wind-down v2: Tonight's Reading
  windDownText: CustomText | null;
  windDownTextDate: string | null;
  setWindDownText: (text: CustomText | null) => void;

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
  streakAtRiskDismissedDate: string | null;
  dismissStreakAtRisk: () => void;

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
  enrichSavedWord: (word: string, data: { syllables?: string; partOfSpeech?: string; definition?: string; etymology?: string }) => void;

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
  totalPronunciationAttempts: number;
  pronunciationHistory: Record<string, { attempts: number; perfects: number }>;

  // Free Pronunciation (3/day)
  freePronunciationsUsedToday: number;
  lastFreePronunciationDate: string | null;
  canUseFreePronunciation: () => boolean;
  useFreePronunciation: () => void;

  // Listen & Repeat
  listenRepeatSessionsCompleted: number;
  freeListenRepeatUsedToday: number;
  lastFreeListenRepeatDate: string | null;
  canUseFreeListenRepeat: () => boolean;
  useFreeListenRepeat: () => void;
  incrementListenRepeatSessions: () => void;

  // AI Daily Practice
  dailyAIText: CustomText | null;
  dailyAITextDate: string | null;
  dailyAITextPersonalizationReason: string | null;
  dailyAITextCategory: string | null;
  recentAITopics: string[];
  setDailyAIText: (text: CustomText | null, reason?: string, category?: string) => void;
  aiTextsRead: number;

  // Vocabulary Tracking
  uniqueWordsEncountered: number;
  uniqueWordSet: string[];
  addEncounteredWords: (words: string[]) => void;
  wordsReviewed: number;
  incrementWordsReviewed: () => void;

  // Daily Goal Streak
  dailyGoalStreak: number;
  lastDailyGoalMetDate: string | null;
  checkDailyGoalMet: () => void;

  // Streak Celebrations
  shownStreakCelebrations: number[];
  markStreakCelebrationShown: (milestone: number) => void;

  // Store Review
  hasRequestedReview: boolean;
  setHasRequestedReview: (v: boolean) => void;

  // Feature Discovery (one-time tooltips)
  discoveredFeatures: { definition: boolean; pronunciation: boolean; wordSave: boolean; tts: boolean };
  setFeatureDiscovered: (feature: keyof SettingsState['discoveredFeatures']) => void;

  // Free Definitions (2/day)
  freeDefinitionsUsedToday: number;
  lastFreeDefinitionDate: string | null;
  canUseFreeDefinition: () => boolean;
  useFreeDefinition: () => void;

  // Word Bank Review Tracking
  lastWordReviewDate: string | null;
  setLastWordReviewDate: (v: string | null) => void;

  // Word Bank Session History
  reviewSessions: { date: string; accuracy: number; wordCount: number; perfects: number; close: number; missed: number; mode: 'pronunciation' | 'flashcard' }[];
  addReviewSession: (session: { accuracy: number; wordCount: number; perfects: number; close: number; missed: number; mode: 'pronunciation' | 'flashcard' }) => void;

  // Device User ID (for server-side rate limiting & analytics)
  deviceUserId: string;

  // Computed helper
  trialDaysRemaining: () => number;

  // Reset
  resetAll: () => void;

  // Dev-only: seed power-user data for App Store screenshots
  seedScreenshotData: () => void;
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
        // Check using levelProgress (which tracks adjusted/XP words) crossing 50K
        const prevLevelProgress = state.levelProgress;
        if (prevLevelProgress < 50000 && newProgress >= 50000) {
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
      soundEffects: true,
      setSoundEffects: (v) => set({ soundEffects: v }),
      breathingAnimation: true,
      setBreathingAnimation: (v) => set({ breathingAnimation: v }),
      windDownMode: false,
      setWindDownMode: (v) => set({ windDownMode: v }),

      // Wind-down v2: Sleep Timer
      sleepTimerMinutes: 10,
      setSleepTimerMinutes: (v) => set({ sleepTimerMinutes: v }),

      // Wind-down v2: Bedtime Reminder
      windDownReminderEnabled: false,
      windDownReminderHour: 21,
      windDownReminderMinute: 30,
      setWindDownReminderEnabled: (v) => set({ windDownReminderEnabled: v }),
      setWindDownReminderTime: (hour, minute) => set({ windDownReminderHour: hour, windDownReminderMinute: minute }),

      // Wind-down v2: Tonight's Reading
      windDownText: null,
      windDownTextDate: null,
      setWindDownText: (text) => set({
        windDownText: text,
        windDownTextDate: text ? new Date().toDateString() : null,
      }),

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
            // Streak broken — set pending restore, reset to 1
            set({
              pendingStreakRestore: {
                previousStreak: state.currentStreak,
                breakDate: new Date(now).toISOString(),
              },
              currentStreak: 1,
              lastReadDate: new Date(now).toISOString(),
              streakFrozenTonight: false,
              streakFreezeActivatedDate: null,
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
            || ctx === 'custom_text_limit' || ctx === 'trial_expired' || ctx === 'generic'
            || ctx === 'streak_freeze';
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

      // Free Definitions (2/day)
      freeDefinitionsUsedToday: 0,
      lastFreeDefinitionDate: null,
      canUseFreeDefinition: () => {
        const state = get();
        if (state.isPremium) return true;
        const today = new Date().toDateString();
        if (state.lastFreeDefinitionDate !== today) return true;
        return state.freeDefinitionsUsedToday < 2;
      },
      useFreeDefinition: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastFreeDefinitionDate !== today) {
          set({ freeDefinitionsUsedToday: 1, lastFreeDefinitionDate: today });
        } else {
          set({ freeDefinitionsUsedToday: state.freeDefinitionsUsedToday + 1 });
        }
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
      streakAtRiskDismissedDate: null,
      dismissStreakAtRisk: () => set({ streakAtRiskDismissedDate: new Date().toISOString().slice(0, 10) }),

      refillStreakAllowancesIfNewMonth: () => {
        const state = get();
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (state.lastStreakRefillDate !== currentMonth) {
          const updates: Partial<SettingsState> = { lastStreakRefillDate: currentMonth };
          if (state.isPremium) {
            updates.streakFreezes = 2;
            updates.streakRestores = 3;
          } else {
            // Free users: 1 restore per month (no freezes)
            updates.streakRestores = 1;
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
        if (state.streakRestores <= 0) return;
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
          // Free users limited to 10 words
          if (!s.isPremium && s.savedWords.length >= 10) return s;
          const newWords = [...s.savedWords, word];
          // Word bank badges
          if (newWords.length >= 25) {
            setTimeout(() => get().unlockBadge('word-bank-25'), 0);
          }
          if (newWords.length >= 100) {
            setTimeout(() => get().unlockBadge('word-bank-100'), 0);
          }
          return { savedWords: newWords };
        }),
      removeSavedWord: (id) =>
        set((s) => ({
          savedWords: s.savedWords.filter((w) => w.id !== id),
        })),
      enrichSavedWord: (word, data) =>
        set((s) => {
          const idx = s.savedWords.findIndex((w) => w.word === word);
          if (idx < 0) return s;
          const existing = s.savedWords[idx];
          // Skip if nothing new to add
          const hasNewDefinition = data.definition && !existing.definition;
          const hasNewEtymology = data.etymology && !existing.etymology;
          if (!hasNewDefinition && !hasNewEtymology && existing.definition) return s;
          const updated = [...s.savedWords];
          const merged = { ...existing };
          if (!existing.definition && data.definition) merged.definition = data.definition;
          if (!existing.syllables && data.syllables) merged.syllables = data.syllables;
          if (!existing.partOfSpeech && data.partOfSpeech) merged.partOfSpeech = data.partOfSpeech;
          if (!existing.etymology && data.etymology) merged.etymology = data.etymology;
          updated[idx] = merged;
          return { savedWords: updated };
        }),

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
      totalPronunciationAttempts: 0,
      pronunciationHistory: {},

      // Free Pronunciation (3/day)
      freePronunciationsUsedToday: 0,
      lastFreePronunciationDate: null,
      canUseFreePronunciation: () => {
        const state = get();
        if (state.isPremium) return true;
        const today = new Date().toDateString();
        if (state.lastFreePronunciationDate !== today) {
          set({ freePronunciationsUsedToday: 0, lastFreePronunciationDate: today });
          return true;
        }
        return state.freePronunciationsUsedToday < 3;
      },
      useFreePronunciation: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastFreePronunciationDate !== today) {
          set({ freePronunciationsUsedToday: 1, lastFreePronunciationDate: today });
        } else {
          set({ freePronunciationsUsedToday: state.freePronunciationsUsedToday + 1 });
        }
        set({ totalPronunciationAttempts: state.totalPronunciationAttempts + 1 });
      },

      // Listen & Repeat
      listenRepeatSessionsCompleted: 0,
      freeListenRepeatUsedToday: 0,
      lastFreeListenRepeatDate: null,
      canUseFreeListenRepeat: () => {
        const state = get();
        if (state.isPremium) return true;
        const today = new Date().toDateString();
        if (state.lastFreeListenRepeatDate !== today) {
          set({ freeListenRepeatUsedToday: 0, lastFreeListenRepeatDate: today });
          return true;
        }
        return state.freeListenRepeatUsedToday < 1;
      },
      useFreeListenRepeat: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastFreeListenRepeatDate !== today) {
          set({ freeListenRepeatUsedToday: 1, lastFreeListenRepeatDate: today });
        } else {
          set({ freeListenRepeatUsedToday: state.freeListenRepeatUsedToday + 1 });
        }
      },
      incrementListenRepeatSessions: () => {
        const state = get();
        const newCount = state.listenRepeatSessionsCompleted + 1;
        set({ listenRepeatSessionsCompleted: newCount });

        // Listen & Repeat badges
        const unlockBadge = get().unlockBadge;
        if (newCount >= 5) unlockBadge('listen-repeat-5');
        if (newCount >= 25) unlockBadge('listen-repeat-25');
      },

      // AI Daily Practice
      dailyAIText: null,
      dailyAITextDate: null,
      dailyAITextPersonalizationReason: null,
      dailyAITextCategory: null,
      recentAITopics: [],
      aiTextsRead: 0,
      setDailyAIText: (text, reason, category) => {
        const state = get();
        const updates: Partial<SettingsState> = {
          dailyAIText: text,
          dailyAITextDate: new Date().toDateString(),
          dailyAITextPersonalizationReason: reason ?? null,
          dailyAITextCategory: category ?? null,
        };
        // Rotate recentAITopics — keep last 7
        if (text?.title) {
          const topics = [text.title, ...state.recentAITopics].slice(0, 7);
          updates.recentAITopics = topics;
        }
        set(updates);
      },

      // Vocabulary Tracking
      uniqueWordsEncountered: 0,
      uniqueWordSet: [],
      addEncounteredWords: (words) => {
        const state = get();
        const existingSet = new Set(state.uniqueWordSet);
        const newWords = words
          .filter((w) => w.length >= 3)
          .map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))
          .filter((w) => w.length >= 3 && !existingSet.has(w));

        if (newWords.length > 0) {
          const updatedSet = [...state.uniqueWordSet, ...newWords];
          set({
            uniqueWordSet: updatedSet,
            uniqueWordsEncountered: updatedSet.length,
          });

          // Vocabulary badges
          const unlockBadge = get().unlockBadge;
          if (updatedSet.length >= 1000) unlockBadge('vocab-1000');
          if (updatedSet.length >= 2500) unlockBadge('vocab-2500');
          if (updatedSet.length >= 5000) unlockBadge('vocab-5000');
        }
      },
      wordsReviewed: 0,
      incrementWordsReviewed: () => {
        const state = get();
        const newCount = state.wordsReviewed + 1;
        set({ wordsReviewed: newCount });

        const unlockBadge = get().unlockBadge;
        if (newCount >= 10) unlockBadge('reviewer-10');
      },

      // Daily Goal Streak
      dailyGoalStreak: 0,
      lastDailyGoalMetDate: null,
      checkDailyGoalMet: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.dailyWordsToday >= state.dailyWordGoal && state.lastDailyGoalMetDate !== today) {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
          const isConsecutive = state.lastDailyGoalMetDate === yesterday;
          const newStreak = isConsecutive ? state.dailyGoalStreak + 1 : 1;
          set({ dailyGoalStreak: newStreak, lastDailyGoalMetDate: today });

          // Daily goal badges
          const unlockBadge = get().unlockBadge;
          if (newStreak >= 7) unlockBadge('daily-goal-7');
          if (newStreak >= 30) unlockBadge('daily-goal-30');
          // Weekly challenge progress
          get().incrementWeeklyChallengeProgress('daily_goal', 1);
        }
      },

      // Streak Celebrations
      shownStreakCelebrations: [],
      markStreakCelebrationShown: (milestone) =>
        set((s) => ({
          shownStreakCelebrations: s.shownStreakCelebrations.includes(milestone)
            ? s.shownStreakCelebrations
            : [...s.shownStreakCelebrations, milestone],
        })),

      // Store Review
      hasRequestedReview: false,
      setHasRequestedReview: (v) => set({ hasRequestedReview: v }),

      // Feature Discovery
      discoveredFeatures: { definition: false, pronunciation: false, wordSave: false, tts: false },
      setFeatureDiscovered: (feature) =>
        set((s) => ({
          discoveredFeatures: { ...s.discoveredFeatures, [feature]: true },
        })),

      // Word Bank Review Tracking
      lastWordReviewDate: null,
      setLastWordReviewDate: (v) => set({ lastWordReviewDate: v }),

      // Word Bank Session History
      reviewSessions: [],
      addReviewSession: (session) => {
        const state = get();
        const entry = { ...session, date: new Date().toISOString() };
        const updated = [entry, ...state.reviewSessions].slice(0, 30);
        set({ reviewSessions: updated });
      },

      // Device User ID (for server-side rate limiting & analytics)
      deviceUserId: generateDeviceUserId(),

      // Computed helper
      trialDaysRemaining: () => {
        const state = get();
        if (!state.trialActive || !state.trialStartDate) return 0;
        const elapsed = Date.now() - new Date(state.trialStartDate).getTime();
        const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
        const remaining = THREE_DAYS - elapsed;
        return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
      },

      // Dev-only: seed power-user data for App Store screenshots
      seedScreenshotData: () => {
        if (!__DEV__) return;

        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const todayStr = now.toDateString();

        // Generate dates going back N days
        const daysAgo = (n: number) => {
          const d = new Date(now);
          d.setDate(d.getDate() - n);
          return d.toISOString();
        };
        const dayKey = (n: number) => {
          const d = new Date(now);
          d.setDate(d.getDate() - n);
          return d.toISOString().slice(0, 10);
        };

        // 25+ beautiful vocabulary words for word bank
        const seedWords: SavedWord[] = [
          { id: 'sw-1', word: 'ephemeral', syllables: 'e-phem-er-al', partOfSpeech: 'adjective', definition: 'Lasting for a very short time', etymology: 'Greek ephemeros "lasting only a day"', savedAt: daysAgo(11), sourceCategory: 'philosophy' },
          { id: 'sw-2', word: 'luminescence', syllables: 'lu-mi-nes-cence', partOfSpeech: 'noun', definition: 'Light produced by chemical or biological means', etymology: 'Latin lumen "light"', savedAt: daysAgo(10), sourceCategory: 'science' },
          { id: 'sw-3', word: 'serendipity', syllables: 'ser-en-dip-i-ty', partOfSpeech: 'noun', definition: 'The occurrence of finding pleasant things by chance', etymology: 'Coined by Horace Walpole in 1754', savedAt: daysAgo(10), sourceCategory: 'story' },
          { id: 'sw-4', word: 'melancholy', syllables: 'mel-an-chol-y', partOfSpeech: 'noun', definition: 'A deep, persistent sadness', etymology: 'Greek melankolia "black bile"', savedAt: daysAgo(9), sourceCategory: 'poetry' },
          { id: 'sw-5', word: 'ethereal', syllables: 'e-the-re-al', partOfSpeech: 'adjective', definition: 'Extremely delicate and light, heavenly', etymology: 'Latin aethereus "of the upper air"', savedAt: daysAgo(9), sourceCategory: 'poetry' },
          { id: 'sw-6', word: 'solitude', syllables: 'sol-i-tude', partOfSpeech: 'noun', definition: 'The state of being alone', etymology: 'Latin solitudo "loneliness"', savedAt: daysAgo(8), sourceCategory: 'philosophy' },
          { id: 'sw-7', word: 'wanderlust', syllables: 'wan-der-lust', partOfSpeech: 'noun', definition: 'A strong desire to travel and explore', etymology: 'German wandern "to wander" + Lust "desire"', savedAt: daysAgo(8), sourceCategory: 'essay' },
          { id: 'sw-8', word: 'resilience', syllables: 're-sil-ience', partOfSpeech: 'noun', definition: 'The capacity to recover quickly from difficulties', etymology: 'Latin resilire "to leap back"', savedAt: daysAgo(7), sourceCategory: 'speech' },
          { id: 'sw-9', word: 'eloquence', syllables: 'el-o-quence', partOfSpeech: 'noun', definition: 'Fluent or persuasive speaking or writing', etymology: 'Latin eloquentia "speaking out"', savedAt: daysAgo(7), sourceCategory: 'speech' },
          { id: 'sw-10', word: 'petrichor', syllables: 'pet-ri-chor', partOfSpeech: 'noun', definition: 'The pleasant earthy smell after rain', etymology: 'Greek petra "stone" + ichor "fluid of the gods"', savedAt: daysAgo(6), sourceCategory: 'science' },
          { id: 'sw-11', word: 'sonder', syllables: 'son-der', partOfSpeech: 'noun', definition: 'The realization that each passerby has a life as vivid as your own', etymology: 'Coined by John Koenig, Dictionary of Obscure Sorrows', savedAt: daysAgo(6), sourceCategory: 'philosophy' },
          { id: 'sw-12', word: 'ineffable', syllables: 'in-ef-fa-ble', partOfSpeech: 'adjective', definition: 'Too great or extreme to be expressed in words', etymology: 'Latin ineffabilis "unutterable"', savedAt: daysAgo(5), sourceCategory: 'poetry' },
          { id: 'sw-13', word: 'verisimilitude', syllables: 've-ri-si-mil-i-tude', partOfSpeech: 'noun', definition: 'The appearance of being true or real', etymology: 'Latin verisimilitudo "likeness to truth"', savedAt: daysAgo(5), sourceCategory: 'fiction' },
          { id: 'sw-14', word: 'cadence', syllables: 'ca-dence', partOfSpeech: 'noun', definition: 'A modulation or inflection of the voice', etymology: 'Latin cadentia "a falling"', savedAt: daysAgo(4), sourceCategory: 'poetry' },
          { id: 'sw-15', word: 'reverie', syllables: 'rev-er-ie', partOfSpeech: 'noun', definition: 'A state of being pleasantly lost in one\'s thoughts', etymology: 'French r\u00eaverie "dreaming"', savedAt: daysAgo(4), sourceCategory: 'fiction' },
          { id: 'sw-16', word: 'quintessence', syllables: 'quin-tes-sence', partOfSpeech: 'noun', definition: 'The most perfect embodiment of something', etymology: 'Latin quinta essentia "fifth essence"', savedAt: daysAgo(3), sourceCategory: 'philosophy' },
          { id: 'sw-17', word: 'iridescent', syllables: 'ir-i-des-cent', partOfSpeech: 'adjective', definition: 'Showing luminous colors that change with angle', etymology: 'Latin iris "rainbow"', savedAt: daysAgo(3), sourceCategory: 'science' },
          { id: 'sw-18', word: 'labyrinthine', syllables: 'lab-y-rin-thine', partOfSpeech: 'adjective', definition: 'Like a labyrinth; irregular and twisting', etymology: 'Greek labyrinthos "maze"', savedAt: daysAgo(2), sourceCategory: 'history' },
          { id: 'sw-19', word: 'palimpsest', syllables: 'pal-imp-sest', partOfSpeech: 'noun', definition: 'Something bearing visible traces of an earlier form', etymology: 'Greek palimpsestos "scraped again"', savedAt: daysAgo(2), sourceCategory: 'history' },
          { id: 'sw-20', word: 'sublime', syllables: 'sub-lime', partOfSpeech: 'adjective', definition: 'Of outstanding spiritual or intellectual worth', etymology: 'Latin sublimis "uplifted, exalted"', savedAt: daysAgo(2), sourceCategory: 'philosophy' },
          { id: 'sw-21', word: 'diaphanous', syllables: 'di-aph-a-nous', partOfSpeech: 'adjective', definition: 'Light, delicate, and translucent', etymology: 'Greek diaphanes "transparent"', savedAt: daysAgo(1), sourceCategory: 'poetry' },
          { id: 'sw-22', word: 'sonorous', syllables: 'so-no-rous', partOfSpeech: 'adjective', definition: 'Imposingly deep and full in sound', etymology: 'Latin sonorus "sounding"', savedAt: daysAgo(1), sourceCategory: 'speech' },
          { id: 'sw-23', word: 'penumbra', syllables: 'pe-num-bra', partOfSpeech: 'noun', definition: 'The partially shaded outer region of a shadow', etymology: 'Latin paene "almost" + umbra "shadow"', savedAt: daysAgo(1), sourceCategory: 'science' },
          { id: 'sw-24', word: 'halcyon', syllables: 'hal-cy-on', partOfSpeech: 'adjective', definition: 'Denoting a period of time that was idyllically happy', etymology: 'Greek halkyon, a mythical bird', savedAt: daysAgo(0), sourceCategory: 'story' },
          { id: 'sw-25', word: 'unconquerable', syllables: 'un-con-quer-a-ble', partOfSpeech: 'adjective', definition: 'Not able to be defeated or overcome', etymology: 'Latin conquirere "to seek out"', savedAt: daysAgo(0), sourceCategory: 'poetry' },
          { id: 'sw-26', word: 'transcendence', syllables: 'tran-scen-dence', partOfSpeech: 'noun', definition: 'Existence beyond the normal physical level', etymology: 'Latin transcendere "to climb beyond"', savedAt: daysAgo(0), sourceCategory: 'philosophy' },
        ];

        // 28 reading history entries across categories
        const historyEntries: ReadingHistoryEntry[] = [
          { id: 'rh-1', categoryKey: 'story', title: 'The Last Leaf', wordsRead: 420, completedAt: daysAgo(11), wpm: 245 },
          { id: 'rh-2', categoryKey: 'story', title: 'The Gift of the Magi', wordsRead: 380, completedAt: daysAgo(11), wpm: 232 },
          { id: 'rh-3', categoryKey: 'essay', title: 'On the Shortness of Life', wordsRead: 510, completedAt: daysAgo(10), wpm: 258 },
          { id: 'rh-4', categoryKey: 'philosophy', title: 'The Allegory of the Cave', wordsRead: 490, completedAt: daysAgo(10), wpm: 241 },
          { id: 'rh-5', categoryKey: 'speech', title: 'I Have a Dream', wordsRead: 440, completedAt: daysAgo(9), wpm: 267 },
          { id: 'rh-6', categoryKey: 'poetry', title: 'The Road Not Taken', wordsRead: 120, completedAt: daysAgo(9), wpm: 198 },
          { id: 'rh-7', categoryKey: 'story', title: 'The Velveteen Rabbit', wordsRead: 350, completedAt: daysAgo(8), wpm: 275 },
          { id: 'rh-8', categoryKey: 'fiction', title: 'The Yellow Wallpaper', wordsRead: 460, completedAt: daysAgo(8), wpm: 251 },
          { id: 'rh-9', categoryKey: 'essay', title: 'Self-Reliance', wordsRead: 530, completedAt: daysAgo(7), wpm: 239 },
          { id: 'rh-10', categoryKey: 'speech', title: 'The Man in the Arena', wordsRead: 280, completedAt: daysAgo(7), wpm: 261 },
          { id: 'rh-11', categoryKey: 'story', title: 'The Necklace', wordsRead: 390, completedAt: daysAgo(6), wpm: 284 },
          { id: 'rh-12', categoryKey: 'philosophy', title: 'Meditations', wordsRead: 470, completedAt: daysAgo(6), wpm: 228 },
          { id: 'rh-13', categoryKey: 'science', title: 'Pale Blue Dot', wordsRead: 360, completedAt: daysAgo(5), wpm: 253 },
          { id: 'rh-14', categoryKey: 'poetry', title: 'Sonnet 18', wordsRead: 110, completedAt: daysAgo(5), wpm: 205 },
          { id: 'rh-15', categoryKey: 'story', title: 'The Secret Life of Walter Mitty', wordsRead: 410, completedAt: daysAgo(5), wpm: 291 },
          { id: 'rh-16', categoryKey: 'history', title: 'The Gettysburg Address', wordsRead: 270, completedAt: daysAgo(4), wpm: 247 },
          { id: 'rh-17', categoryKey: 'essay', title: 'Walden', wordsRead: 480, completedAt: daysAgo(4), wpm: 263 },
          { id: 'rh-18', categoryKey: 'speech', title: 'We Shall Fight on the Beaches', wordsRead: 520, completedAt: daysAgo(3), wpm: 274 },
          { id: 'rh-19', categoryKey: 'philosophy', title: 'On Solitude', wordsRead: 440, completedAt: daysAgo(3), wpm: 236 },
          { id: 'rh-20', categoryKey: 'story', title: 'An Occurrence at Owl Creek Bridge', wordsRead: 400, completedAt: daysAgo(3), wpm: 255 },
          { id: 'rh-21', categoryKey: 'fiction', title: '1984 (Excerpt)', wordsRead: 380, completedAt: daysAgo(2), wpm: 268 },
          { id: 'rh-22', categoryKey: 'poetry', title: 'Still I Rise', wordsRead: 150, completedAt: daysAgo(2), wpm: 212 },
          { id: 'rh-23', categoryKey: 'essay', title: 'A Room of One\'s Own', wordsRead: 500, completedAt: daysAgo(2), wpm: 246 },
          { id: 'rh-24', categoryKey: 'story', title: 'The Tell-Tale Heart', wordsRead: 340, completedAt: daysAgo(1), wpm: 278 },
          { id: 'rh-25', categoryKey: 'philosophy', title: 'The Myth of Sisyphus', wordsRead: 460, completedAt: daysAgo(1), wpm: 241 },
          { id: 'rh-26', categoryKey: 'speech', title: 'Ain\'t I a Woman?', wordsRead: 310, completedAt: daysAgo(1), wpm: 259 },
          { id: 'rh-27', categoryKey: 'story', title: 'The Lottery', wordsRead: 370, completedAt: daysAgo(0), wpm: 287 },
          { id: 'rh-28', categoryKey: 'poetry', title: 'Invictus', wordsRead: 53, completedAt: daysAgo(0), wpm: 195 },
        ];

        // Weekly reading data — hand-crafted for App Store quality visuals
        // Curated values: steady upward progression with natural dips
        const weeklyWordCounts: Record<string, number> = {};
        const weeklyReadingDays: Record<string, string[]> = {};
        const weeklyAvgWPM: Record<string, number> = {};
        const dailyReadingLog: Record<string, number> = {};

        // Target weekly totals (organic growth curve — not a straight line)
        const weeklyTargets = [1850, 2100, 2450, 2300, 2900, 3200, 3650, 4100];
        // Target WPM per week (gradual improvement with a small plateau)
        const wpmTargets =    [228,  234,  239,  241,  248,  253,  261,  268];
        // Reading days per week (fewer early on, more consistent recently)
        const daysPerWeek =   [5,    5,    6,    5,    6,    6,    7,    7];

        // Generate week IDs matching getLast8Weeks() logic in insights.tsx
        const seedWeeks: string[] = [];
        for (let wi = 7; wi >= 0; wi--) {
          const wd = new Date(now);
          wd.setDate(wd.getDate() - wi * 7);
          const wk = getISOWeekId(wd);
          if (!seedWeeks.includes(wk)) seedWeeks.push(wk);
        }

        // Fill each week with daily data that sums to the curated target
        for (let wi = 0; wi < seedWeeks.length; wi++) {
          const wk = seedWeeks[wi];
          const targetWords = weeklyTargets[wi] ?? 2500;
          weeklyAvgWPM[wk] = wpmTargets[wi] ?? 245;
          weeklyReadingDays[wk] = [];

          const readDays = daysPerWeek[wi] ?? 6;
          const weeksFromEnd = seedWeeks.length - 1 - wi;
          let remaining = targetWords;

          for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            if (dayIdx >= readDays) continue; // skip rest days
            const dayDate = new Date(now);
            dayDate.setDate(dayDate.getDate() - weeksFromEnd * 7 - (6 - dayIdx));
            const dk = dayDate.toISOString().slice(0, 10);

            const isLast = dayIdx === readDays - 1;
            const share = remaining / (readDays - dayIdx);
            const dayWords = isLast
              ? remaining
              : Math.max(200, Math.floor(share * (0.8 + Math.random() * 0.4)));
            dailyReadingLog[dk] = Math.min(dayWords, remaining);
            remaining -= dailyReadingLog[dk];
            weeklyReadingDays[wk].push(dk);
          }

          weeklyWordCounts[wk] = targetWords;
        }

        // Unlocked badges (~20)
        const unlockedBadges = [
          'first-steps',
          'reached-intermediate', 'reached-advanced', 'reached-expert',
          'streak-7',
          'texts-10',
          'words-1k', 'words-5k',
          'quiz-first', 'quiz-perfect', 'quiz-10',
          'quiz-scholar',
          'word-bank-25',
          'daily-goal-7',
          'pronunciation-50',
          'category-story-bronze', 'category-story-silver',
          'category-essay-bronze',
          'category-speech-bronze',
          'category-philosophy-bronze',
          'category-poetry-bronze',
          'vocab-1000', 'vocab-2500',
          'listener',
          'custom-creator',
        ];

        // Custom texts — psychologically resonating titles
        const seedCustomTexts: CustomText[] = [
          {
            id: 'ct-1', title: 'My Morning Ritual', wordCount: 280, createdAt: daysAgo(9),
            lastReadAt: daysAgo(1), timesRead: 6, source: 'paste',
            text: 'The alarm is not the start of the day. The first breath is.',
            preview: 'The alarm is not the start of the day. The first breath is...',
          },
          {
            id: 'ct-2', title: 'Wind-Down Routine', wordCount: 210, createdAt: daysAgo(8),
            lastReadAt: daysAgo(2), timesRead: 5, source: 'paste',
            text: 'The screen dims. The thoughts slow. Tonight you rest without rehearsing tomorrow.',
            preview: 'The screen dims. The thoughts slow. Tonight you rest without rehearsing tomorrow...',
          },
          {
            id: 'ct-3', title: 'Letter to My Future Self', wordCount: 350, createdAt: daysAgo(7),
            lastReadAt: daysAgo(3), timesRead: 3, source: 'paste',
            text: 'You are reading this because the version of you that wrote it believed you would become someone worth writing to.',
            preview: 'You are reading this because the version of you that wrote it believed you would become...',
          },
          {
            id: 'ct-4', title: 'The Art of Doing Nothing', wordCount: 190, createdAt: daysAgo(5),
            lastReadAt: daysAgo(4), timesRead: 2, source: 'paste',
            text: 'Stillness is not the absence of motion. It is the presence of intention.',
            preview: 'Stillness is not the absence of motion. It is the presence of intention...',
          },
          {
            id: 'ct-5', title: 'Why I Walk Alone', wordCount: 320, createdAt: daysAgo(4),
            lastReadAt: daysAgo(0), timesRead: 4, source: 'paste',
            text: 'There is a kind of thinking that only happens when your feet are moving and no one is watching.',
            preview: 'There is a kind of thinking that only happens when your feet are moving...',
          },
          {
            id: 'ct-6', title: 'On Losing Track of Time', wordCount: 260, createdAt: daysAgo(3),
            timesRead: 1, source: 'scan',
            text: 'The hours you cannot account for are often the ones you lived most fully.',
            preview: 'The hours you cannot account for are often the ones you lived most fully...',
          },
          {
            id: 'ct-7', title: 'Things I Stopped Apologizing For', wordCount: 240, createdAt: daysAgo(1),
            timesRead: 1, source: 'paste',
            text: 'Needing silence. Leaving early. Choosing the long way home.',
            preview: 'Needing silence. Leaving early. Choosing the long way home...',
          },
        ];

        // Favorite bundled texts
        const seedFavorites: FavoriteText[] = [
          { categoryKey: 'philosophy', textId: 'philosophy-meditations', savedAt: daysAgo(8) },
          { categoryKey: 'speech', textId: 'speech-mlk-dream', savedAt: daysAgo(6) },
          { categoryKey: 'story', textId: 'story-selfish-giant', savedAt: daysAgo(5) },
          { categoryKey: 'philosophy', textId: 'philosophy-seneca', savedAt: daysAgo(3) },
          { categoryKey: 'story', textId: 'story-gift-magi', savedAt: daysAgo(1) },
        ];

        // Resume data: mid-read in a story
        const resumeData: ResumeData = {
          categoryKey: 'story',
          textId: 'story-last-leaf',
          wordIndex: 287,
          totalWords: 487,
          startTime: Date.now() - 120000,
        };

        set({
          // Core user identity
          isPremium: true,
          hasOnboarded: true,
          isFirstReading: false,
          displayName: 'Alex',
          profileColor: '#8B5CF6',
          profileImage: null,
          themeMode: 'light',

          // Reading display
          fontFamily: 'sourceSerif',
          wordSize: 48,
          wordBold: false,
          wordColor: 'default',
          backgroundTheme: 'default',

          // Level & progress
          levelProgress: 6800,
          totalWordsRead: 6800,
          textsCompleted: 28,

          // Streak
          currentStreak: 12,
          longestStreak: 12,
          lastReadDate: now.toISOString(),

          // Daily goal
          dailyWordGoal: 150,
          dailyWordsToday: 87,
          lastDailyResetDate: todayStr,
          dailyGoalStreak: 5,
          lastDailyGoalMetDate: new Date(now.getTime() - 86400000).toDateString(),

          // Quiz stats
          totalQuizzesTaken: 12,
          perfectQuizzes: 3,
          avgComprehension: 82,

          // Vocabulary
          uniqueWordsEncountered: 2400,
          uniqueWordSet: [], // Don't bloat state with 2400 words

          // Pronunciation
          perfectPronunciations: 45,
          totalPronunciationAttempts: 68,
          hasUsedPronunciation: true,
          hasUsedTTS: true,

          // Difficulty
          beginnerTextsCompleted: 10,
          intermediateTextsCompleted: 12,
          advancedTextsCompleted: 6,

          // Word bank
          savedWords: seedWords,

          // Reading history
          readingHistory: historyEntries,

          // Category read counts
          categoryReadCounts: {
            story: 8, essay: 5, speech: 4, philosophy: 4,
            poetry: 3, fiction: 2, science: 1, history: 1,
          },

          // Badges
          unlockedBadges,
          unlockedRewards: [],

          // Resume
          resumeData,
          resumePoints: {
            'story:story-last-leaf': resumeData,
          },

          // Weekly data
          weeklyWordCounts,
          weeklyReadingDays,
          weeklyAvgWPM,
          dailyReadingLog,

          // Weekly challenge (partially complete)
          weeklyChallengeWeek: getISOWeekId(now),
          weeklyChallengeProgress: 3,
          weeklyChallengeCompleted: false,
          weeklyChallengesCompleted: 2,
          weeklyCategoriesRead: ['story', 'essay', 'poetry'],

          // Feature discovery (all discovered)
          discoveredFeatures: { definition: true, pronunciation: true, wordSave: true, tts: true },
          hasRequestedReview: true,

          // Misc
          hapticFeedback: true,
          breathingAnimation: true,
          reduceMotion: false,
          notificationsEnabled: true,
          listenRepeatSessionsCompleted: 8,
          wordsReviewed: 15,
          aiTextsRead: 3,

          // Library content
          customTexts: seedCustomTexts,
          favoriteTexts: seedFavorites,

          // Clear paywall state
          showPaywall: false,
          paywallContext: null,
          lastUnlockedBadgeId: null,
          pendingStreakRestore: null,
        });
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
        soundEffects: true,
        breathingAnimation: true,
        windDownMode: false,
        sleepTimerMinutes: 10,
        windDownReminderEnabled: false,
        windDownReminderHour: 21,
        windDownReminderMinute: 30,
        windDownText: null,
        windDownTextDate: null,
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
        freeDefinitionsUsedToday: 0,
        lastFreeDefinitionDate: null,
        lastUnlockedBadgeId: null,
        streakFreezes: 0,
        streakRestores: 0,
        lastStreakRefillDate: null,
        streakFrozenTonight: false,
        streakFreezeActivatedDate: null,
        pendingStreakRestore: null,
        streakAtRiskDismissedDate: null,
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
        totalPronunciationAttempts: 0,
        pronunciationHistory: {},
        freePronunciationsUsedToday: 0,
        lastFreePronunciationDate: null,
        listenRepeatSessionsCompleted: 0,
        freeListenRepeatUsedToday: 0,
        lastFreeListenRepeatDate: null,
        dailyAIText: null,
        dailyAITextDate: null,
        dailyAITextPersonalizationReason: null,
        dailyAITextCategory: null,
        recentAITopics: [],
        aiTextsRead: 0,
        uniqueWordsEncountered: 0,
        uniqueWordSet: [],
        wordsReviewed: 0,
        dailyGoalStreak: 0,
        lastDailyGoalMetDate: null,
        shownStreakCelebrations: [],
        hasRequestedReview: false,
        discoveredFeatures: { definition: false, pronunciation: false, wordSave: false, tts: false },
        lastWordReviewDate: null,
        reviewSessions: [],
        deviceUserId: generateDeviceUserId(),
      }),
    }),
    {
      name: 'articulate-settings',
      version: 35,
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
        if (version < 20) {
          // v20: FREE_CATEGORY_KEYS change (no user data migration needed, just UI)
          // No data migration required — category swap is UI-only
        }
        if (version < 21) {
          // v21: Free pronunciation (3/day), pronunciation tracking, listen & repeat
          persisted.freePronunciationsUsedToday = persisted.freePronunciationsUsedToday ?? 0;
          persisted.lastFreePronunciationDate = persisted.lastFreePronunciationDate ?? null;
          persisted.totalPronunciationAttempts = persisted.totalPronunciationAttempts ?? 0;
          persisted.pronunciationHistory = persisted.pronunciationHistory ?? {};
          persisted.listenRepeatSessionsCompleted = persisted.listenRepeatSessionsCompleted ?? 0;
          persisted.freeListenRepeatUsedToday = persisted.freeListenRepeatUsedToday ?? 0;
          persisted.lastFreeListenRepeatDate = persisted.lastFreeListenRepeatDate ?? null;
        }
        if (version < 23) {
          // v23: AI Daily Practice
          persisted.dailyAIText = persisted.dailyAIText ?? null;
          persisted.dailyAITextDate = persisted.dailyAITextDate ?? null;
        }
        if (version < 24) {
          // v24: Vocabulary tracking, word bank limits
          persisted.uniqueWordsEncountered = persisted.uniqueWordsEncountered ?? 0;
          persisted.uniqueWordSet = persisted.uniqueWordSet ?? [];
          persisted.wordsReviewed = persisted.wordsReviewed ?? 0;
        }
        if (version < 25) {
          // v25: Daily goal streak, level-gated rewards
          persisted.dailyGoalStreak = persisted.dailyGoalStreak ?? 0;
          persisted.lastDailyGoalMetDate = persisted.lastDailyGoalMetDate ?? null;
        }
        if (version < 26) {
          // v26: Store review, feature discovery tooltips, word bank review tracking
          persisted.hasRequestedReview = persisted.hasRequestedReview ?? false;
          persisted.discoveredFeatures = persisted.discoveredFeatures ?? {
            definition: false,
            pronunciation: false,
            wordSave: false,
            tts: false,
          };
          persisted.lastWordReviewDate = persisted.lastWordReviewDate ?? null;
        }
        if (version < 27) {
          // v27: Free definitions (2/day foot-in-door)
          persisted.freeDefinitionsUsedToday = persisted.freeDefinitionsUsedToday ?? 0;
          persisted.lastFreeDefinitionDate = persisted.lastFreeDefinitionDate ?? null;
        }
        if (version < 28) {
          // v28: Word bank review session history
          persisted.reviewSessions = persisted.reviewSessions ?? [];
        }
        if (version < 29) {
          // v29: AI personalization fields
          persisted.dailyAITextPersonalizationReason = persisted.dailyAITextPersonalizationReason ?? null;
          persisted.dailyAITextCategory = persisted.dailyAITextCategory ?? null;
          persisted.recentAITopics = persisted.recentAITopics ?? [];
        }
        if (version < 30) {
          // v30: Wind-down mode
          persisted.windDownMode = persisted.windDownMode ?? false;
        }
        if (version < 31) {
          // v31: Wind-down v2 — sleep timer, bedtime reminder, tonight's reading
          persisted.sleepTimerMinutes = persisted.sleepTimerMinutes ?? 10;
          persisted.windDownText = persisted.windDownText ?? null;
          persisted.windDownTextDate = persisted.windDownTextDate ?? null;
          persisted.windDownReminderEnabled = persisted.windDownReminderEnabled ?? false;
          persisted.windDownReminderHour = persisted.windDownReminderHour ?? 21;
          persisted.windDownReminderMinute = persisted.windDownReminderMinute ?? 30;
        }
        if (version < 32) {
          // v32: Streak at risk popup dismissal tracking
          persisted.streakAtRiskDismissedDate = persisted.streakAtRiskDismissedDate ?? null;
        }
        if (version < 33) {
          // v33: Device user ID for server-side rate limiting & analytics
          persisted.deviceUserId = persisted.deviceUserId ?? generateDeviceUserId();
        }
        if (version < 34) {
          // v34: Etymology field on SavedWord (optional, no-op migration)
        }
        if (version < 35) {
          // v35: Tap sound effects toggle
          persisted.soundEffects = persisted.soundEffects ?? true;
        }
        return persisted;
      },
    }
  )
);
