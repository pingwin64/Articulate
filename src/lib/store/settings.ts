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

export interface ResumeData {
  categoryKey: string;
  customTextId?: string;
  wordIndex: number;
  totalWords: number;
  startTime: number;
}

export interface CustomText {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  categoryKey?: string;
  customTextId?: string;
  title: string;
  wordsRead: number;
  timeSpentSeconds: number;
  wpm: number;
  readAt: string;
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
  bestStreak: number;
  lastReadDate: string | null;
  bestWPM: number;
  firstSessionWPM: number | null;
  totalTimeSpent: number;
  lifetimeWordsRead: number;
  incrementWordsRead: (count: number) => void;
  incrementTextsCompleted: () => void;
  updateStreak: () => void;
  recordSessionWPM: (wpm: number) => void;
  addTimeSpent: (seconds: number) => void;

  // Daily Goal
  dailyGoal: number;
  setDailyGoal: (v: number) => void;
  textsReadToday: number;
  lastGoalDate: string | null;
  incrementTextsReadToday: () => void;
  resetDailyProgressIfNeeded: () => void;
  dailyGoalSet: boolean;
  setDailyGoalSet: (v: boolean) => void;

  // Streak Freezes (Premium)
  streakFreezes: number;
  lastFreezeWeek: string | null;
  useStreakFreeze: () => boolean;

  // Custom Texts
  customTexts: CustomText[];
  addCustomText: (text: CustomText) => void;
  removeCustomText: (id: string) => void;

  // Reading History
  readingHistory: ReadingSession[];
  addReadingSession: (session: ReadingSession) => void;

  // Resume
  resumeData: ResumeData | null;
  setResumeData: (v: ResumeData | null) => void;

  // Paywall
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;

  // Reset
  resetAll: () => void;
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek);
  return getLocalDateString(d);
}

function getLocalDateString(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasOnboarded: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),

      // Premium
      isPremium: false,
      setIsPremium: (v) => set({ isPremium: v }),

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
          set({
            trialActive: false,
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
      bestStreak: 0,
      lastReadDate: null,
      bestWPM: 0,
      firstSessionWPM: null,
      totalTimeSpent: 0,
      lifetimeWordsRead: 0,
      incrementWordsRead: (count) =>
        set((s) => ({
          totalWordsRead: s.totalWordsRead + count,
          lifetimeWordsRead: s.lifetimeWordsRead + count,
        })),
      incrementTextsCompleted: () =>
        set((s) => ({ textsCompleted: s.textsCompleted + 1 })),
      updateStreak: () => {
        const state = get();
        const today = getLocalDateString();
        const lastDate = state.lastReadDate
          ? getLocalDateString(new Date(state.lastReadDate))
          : null;

        if (!lastDate) {
          set({
            currentStreak: 1,
            bestStreak: Math.max(1, state.bestStreak),
            lastReadDate: new Date().toISOString(),
          });
          return;
        }

        if (lastDate === today) {
          // Already read today, just update timestamp
          set({ lastReadDate: new Date().toISOString() });
          return;
        }

        // Check if last read was yesterday (local time)
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = getLocalDateString(yesterdayDate);

        if (lastDate === yesterday) {
          const newStreak = state.currentStreak + 1;
          set({
            currentStreak: newStreak,
            bestStreak: Math.max(newStreak, state.bestStreak),
            lastReadDate: new Date().toISOString(),
          });
        } else {
          // Streak broken
          set({
            currentStreak: 1,
            lastReadDate: new Date().toISOString(),
          });
        }
      },
      recordSessionWPM: (wpm) => {
        const state = get();
        const updates: Partial<SettingsState> = {};
        if (wpm > state.bestWPM) {
          updates.bestWPM = wpm;
        }
        if (state.firstSessionWPM === null) {
          updates.firstSessionWPM = wpm;
        }
        if (Object.keys(updates).length > 0) {
          set(updates as any);
        }
      },
      addTimeSpent: (seconds) =>
        set((s) => ({ totalTimeSpent: s.totalTimeSpent + seconds })),

      // Daily Goal
      dailyGoal: 3,
      setDailyGoal: (v) => set({ dailyGoal: v }),
      textsReadToday: 0,
      lastGoalDate: null,
      dailyGoalSet: false,
      setDailyGoalSet: (v) => set({ dailyGoalSet: v }),
      incrementTextsReadToday: () => {
        const state = get();
        const today = getLocalDateString();
        if (state.lastGoalDate !== today) {
          set({ textsReadToday: 1, lastGoalDate: today });
        } else {
          set((s) => ({ textsReadToday: s.textsReadToday + 1 }));
        }
      },
      resetDailyProgressIfNeeded: () => {
        const state = get();
        const today = getLocalDateString();
        if (state.lastGoalDate !== today) {
          set({ textsReadToday: 0, lastGoalDate: today });
        }
      },

      // Streak Freezes
      streakFreezes: 1,
      lastFreezeWeek: null,
      useStreakFreeze: () => {
        const state = get();
        if (!state.isPremium) return false;
        const currentWeek = getWeekKey(new Date());
        if (state.lastFreezeWeek === currentWeek) return false;
        if (state.streakFreezes <= 0) return false;
        set({
          lastFreezeWeek: currentWeek,
          lastReadDate: new Date().toISOString(),
        });
        return true;
      },

      // Custom Texts
      customTexts: [],
      addCustomText: (text) => {
        const state = get();
        if (!state.isPremium && state.customTexts.length >= 1) {
          set({ customTexts: [text] });
        } else {
          set((s) => ({ customTexts: [text, ...s.customTexts] }));
        }
      },
      removeCustomText: (id) =>
        set((s) => ({ customTexts: s.customTexts.filter((t) => t.id !== id) })),

      // Reading History
      readingHistory: [],
      addReadingSession: (session) =>
        set((s) => ({
          readingHistory: [session, ...s.readingHistory].slice(0, 500),
        })),

      // Resume
      resumeData: null,
      setResumeData: (v) => set({ resumeData: v }),

      // Paywall
      showPaywall: false,
      setShowPaywall: (v) => set({ showPaywall: v }),

      // Reset
      resetAll: () => set({
        hasOnboarded: false,
        isPremium: false,
        trialStartDate: null,
        trialActive: false,
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
        bestStreak: 0,
        lastReadDate: null,
        bestWPM: 0,
        firstSessionWPM: null,
        totalTimeSpent: 0,
        lifetimeWordsRead: 0,
        dailyGoal: 3,
        textsReadToday: 0,
        lastGoalDate: null,
        dailyGoalSet: false,
        streakFreezes: 1,
        lastFreezeWeek: null,
        customTexts: [],
        readingHistory: [],
        resumeData: null,
        showPaywall: false,
      }),
    }),
    {
      name: 'articulate-settings',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
