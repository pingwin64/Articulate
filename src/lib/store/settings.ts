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
  voiceDetection: boolean;
  setVoiceDetection: (v: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (v: boolean) => void;

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
      setIsPremium: (v) => set({ isPremium: v }),

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
      sentenceRecap: true,
      setSentenceRecap: (v) => set({ sentenceRecap: v }),
      voiceDetection: false,
      setVoiceDetection: (v) => set({ voiceDetection: v }),
      hapticFeedback: true,
      setHapticFeedback: (v) => set({ hapticFeedback: v }),

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
        const today = new Date().toDateString();
        const state = get();
        if (state.lastReadDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = state.lastReadDate === yesterday.toDateString();

        set({
          currentStreak: wasYesterday ? state.currentStreak + 1 : 1,
          lastReadDate: today,
        });
      },

      // Resume
      resumeData: null,
      setResumeData: (v) => set({ resumeData: v }),

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
        sentenceRecap: true,
        voiceDetection: false,
        hapticFeedback: true,
        ttsSpeed: 'normal',
        autoPlay: false,
        autoPlayWPM: 250,
        totalWordsRead: 0,
        textsCompleted: 0,
        currentStreak: 0,
        lastReadDate: null,
        resumeData: null,
      }),
    }),
    {
      name: 'articulate-settings',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
