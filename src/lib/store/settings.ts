import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import type { FontFamilyKey, WordColorKey } from '../../design/theme';

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

export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';
export type TTSSpeed = 'slow' | 'normal' | 'fast';

export type PaywallContext =
  | 'post_onboarding' | 'locked_category' | 'custom_text_limit'
  | 'locked_font' | 'locked_color' | 'locked_size' | 'locked_bold'
  | 'locked_background' | 'locked_autoplay' | 'locked_chunk'
  | 'locked_breathing' | 'locked_tts' | 'locked_quiz'
  | 'trial_expired' | 'settings_upgrade' | 'generic';

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
}

export interface ResumeData {
  categoryKey: string;
  textId?: string;
  customTextId?: string;
  wordIndex: number;
  totalWords: number;
  startTime: number;
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

  // Reading
  readingLevel: ReadingLevel;
  setReadingLevel: (v: ReadingLevel) => void;
  sentenceRecap: boolean;
  setSentenceRecap: (v: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (v: boolean) => void;
  breathingAnimation: boolean;
  setBreathingAnimation: (v: boolean) => void;

  // Audio
  ttsSpeed: TTSSpeed;
  setTtsSpeed: (v: TTSSpeed) => void;
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

  // Baseline WPM
  baselineWPM: number | null;
  setBaselineWPM: (v: number) => void;

  // Chunk Reading
  chunkSize: 1 | 2 | 3;
  setChunkSize: (v: 1 | 2 | 3) => void;

  // Comprehension
  avgComprehension: number;
  totalQuizzesTaken: number;
  updateComprehension: (score: number, totalQuestions: number) => void;

  // Achievements
  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  reminderHour: number;
  reminderMinute: number;
  setReminderTime: (hour: number, minute: number) => void;

  // Accessibility
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;

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

      // Reading
      readingLevel: 'intermediate',
      setReadingLevel: (v) => set({ readingLevel: v }),
      sentenceRecap: false,
      setSentenceRecap: (v) => set({ sentenceRecap: v }),
      hapticFeedback: true,
      setHapticFeedback: (v) => set({ hapticFeedback: v }),
      breathingAnimation: true,
      setBreathingAnimation: (v) => set({ breathingAnimation: v }),

      // Audio
      ttsSpeed: 'normal',
      setTtsSpeed: (v) => set({ ttsSpeed: v }),
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
          // Within same 24h window — already counted, no change
          return;
        }

        if (elapsed <= HOURS_48) {
          // 24h–48h: consecutive day, increment streak
          set({
            currentStreak: state.currentStreak + 1,
            lastReadDate: new Date(now).toISOString(),
          });
        } else {
          // >48h: streak broken, reset
          set({
            currentStreak: 1,
            lastReadDate: new Date(now).toISOString(),
          });
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

      // Baseline WPM
      baselineWPM: null,
      setBaselineWPM: (v) => set({ baselineWPM: v }),

      // Chunk Reading
      chunkSize: 1,
      setChunkSize: (v) => set({ chunkSize: v }),

      // Comprehension
      avgComprehension: 0,
      totalQuizzesTaken: 0,
      updateComprehension: (score, totalQuestions) => {
        const state = get();
        const pct = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        const newTotal = state.totalQuizzesTaken + 1;
        const newAvg =
          (state.avgComprehension * state.totalQuizzesTaken + pct) / newTotal;
        set({
          avgComprehension: Math.round(newAvg),
          totalQuizzesTaken: newTotal,
        });
      },

      // Achievements
      unlockedAchievements: [],
      unlockAchievement: (id) =>
        set((s) => ({
          unlockedAchievements: s.unlockedAchievements.includes(id)
            ? s.unlockedAchievements
            : [...s.unlockedAchievements, id],
        })),

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
      highContrast: false,
      setHighContrast: (v) => set({ highContrast: v }),

      // Paywall
      showPaywall: false,
      setShowPaywall: (v) => set({ showPaywall: v }),
      paywallContext: null,
      setPaywallContext: (ctx) => {
        if (ctx === null) {
          set({ paywallContext: null, showPaywall: false });
        } else {
          const state = get();
          // Frequency limiting
          if (!state.canShowPaywall()) return;
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
        readingLevel: 'intermediate',
        sentenceRecap: false,
        hapticFeedback: true,
        breathingAnimation: true,
        ttsSpeed: 'normal',
        autoPlay: false,
        autoPlayWPM: 250,
        totalWordsRead: 0,
        textsCompleted: 0,
        currentStreak: 0,
        lastReadDate: null,
        resumeData: null,
        resumePoints: {},
        customTexts: [],
        baselineWPM: null,
        chunkSize: 1 as 1 | 2 | 3,
        avgComprehension: 0,
        totalQuizzesTaken: 0,
        unlockedAchievements: [],
        notificationsEnabled: false,
        reminderHour: 20,
        reminderMinute: 0,
        reduceMotion: false,
        highContrast: false,
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
      }),
    }),
    {
      name: 'articulate-settings',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
