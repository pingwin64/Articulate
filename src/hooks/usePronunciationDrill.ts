import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { speakWord, stopSpeaking } from '../lib/tts';
import {
  transcribeAudio,
  scoreWord,
  type PronunciationFeedback,
} from '../lib/pronunciation-service';
import type { Recorder } from './useRecording';
import { useSettingsStore } from '../lib/store/settings';
import type { TTSSpeed, VoiceGender } from '../lib/store/settings';

export type DrillPhase = 'idle' | 'listening' | 'recording' | 'processing' | 'result';

interface UsePronunciationDrillOptions {
  ttsSpeed: TTSSpeed;
  voiceGender: VoiceGender;
  hapticFeedback: boolean;
  recorder: Recorder;
}

interface UsePronunciationDrillReturn {
  phase: DrillPhase;
  feedback: PronunciationFeedback | null;
  error: string | null;
  feedbackAnimStyle: { opacity: number; transform: { scale: number }[] };
  startDrill: (word: string) => void;
  stopDrill: () => void;
  dismissFeedback: () => void;
  listenToWord: () => void;
}

/**
 * Shared hook for pronunciation drilling.
 * Manages the full flow: TTS speaks word → delay → record → transcribe → score → show result.
 * Used in both reading.tsx (Listen & Repeat) and word-bank.tsx (Pronunciation drill mode).
 */
export function usePronunciationDrill(
  options: UsePronunciationDrillOptions,
): UsePronunciationDrillReturn {
  const { ttsSpeed, voiceGender, hapticFeedback, recorder } = options;

  const [phase, setPhase] = useState<DrillPhase>('idle');
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentWordRef = useRef<string>('');
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Feedback animation
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);

  const feedbackAnimStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  const showFeedbackAnim = useCallback(() => {
    feedbackOpacity.value = withTiming(1, { duration: 200 });
    feedbackScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [feedbackOpacity, feedbackScale]);

  const hideFeedbackAnim = useCallback(() => {
    feedbackOpacity.value = withTiming(0, { duration: 200 });
    feedbackScale.value = withTiming(0.8, { duration: 200 });
  }, [feedbackOpacity, feedbackScale]);

  const clearTimers = useCallback(() => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
  }, []);

  const dismissFeedback = useCallback(() => {
    hideFeedbackAnim();
    clearTimers();
    setTimeout(() => {
      setPhase('idle');
      setFeedback(null);
      setError(null);
    }, 250);
  }, [hideFeedbackAnim, clearTimers]);

  const handleStopRecording = useCallback(async (word: string) => {
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    try {
      const base64 = await recorder.stop();

      if (base64.length < 1400) {
        setError('Recording too short. Try holding a bit longer.');
        setPhase('result');
        showFeedbackAnim();
        feedbackTimerRef.current = setTimeout(dismissFeedback, 3000);
        return null;
      }

      setPhase('processing');

      const transcribed = await transcribeAudio(base64);

      if (!transcribed) {
        setError('Could not hear anything. Try again.');
        setPhase('result');
        showFeedbackAnim();
        feedbackTimerRef.current = setTimeout(dismissFeedback, 3000);
        return null;
      }

      const result = scoreWord(transcribed, word);
      setFeedback(result);
      setPhase('result');
      showFeedbackAnim();

      // Track in store
      const store = useSettingsStore.getState();
      store.totalPronunciationAttempts = (store.totalPronunciationAttempts || 0) + 1;
      const history = { ...store.pronunciationHistory };
      const wordKey = word.toLowerCase();
      if (!history[wordKey]) {
        history[wordKey] = { attempts: 0, perfects: 0 };
      }
      history[wordKey].attempts += 1;

      if (result.result === 'perfect') {
        if (hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        history[wordKey].perfects += 1;
        store.incrementPerfectPronunciations();
        store.incrementWeeklyChallengeProgress('pronunciation_perfect', 1);
      } else if (result.result === 'close') {
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      useSettingsStore.setState({
        pronunciationHistory: history,
        totalPronunciationAttempts: store.totalPronunciationAttempts,
      });

      return result;
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
      setPhase('result');
      showFeedbackAnim();
      feedbackTimerRef.current = setTimeout(dismissFeedback, 3000);
      return null;
    }
  }, [recorder, hapticFeedback, showFeedbackAnim, dismissFeedback]);

  const startDrill = useCallback((word: string) => {
    // Reset state
    clearTimers();
    recorder.cancel();
    stopSpeaking();
    setPhase('idle');
    setFeedback(null);
    setError(null);
    feedbackOpacity.value = 0;
    feedbackScale.value = 0.8;
    currentWordRef.current = word;

    // Skip very short words
    const cleaned = word.replace(/[^\w'-]/g, '');
    if (cleaned.length < 3) {
      setError('Too short to score');
      setPhase('result');
      showFeedbackAnim();
      feedbackTimerRef.current = setTimeout(dismissFeedback, 2000);
      return;
    }

    // Go straight to recording — user tries to pronounce first
    // They can tap "listen" button if they need help
    (async () => {
      const granted = await recorder.requestMicPermission();
      if (!granted) {
        setError('Microphone permission required');
        setPhase('result');
        showFeedbackAnim();
        feedbackTimerRef.current = setTimeout(dismissFeedback, 3000);
        return;
      }

      try {
        await recorder.start();
        setPhase('recording');
        setError(null);
        setFeedback(null);

        // Auto-stop after 3 seconds
        recordingTimerRef.current = setTimeout(() => {
          handleStopRecording(word);
        }, 3000);
      } catch {
        setPhase('idle');
      }
    })();
  }, [recorder, clearTimers, showFeedbackAnim, dismissFeedback, handleStopRecording, feedbackOpacity, feedbackScale]);

  const listenToWord = useCallback(() => {
    const word = currentWordRef.current;
    if (word) {
      speakWord(word, ttsSpeed, voiceGender);
    }
  }, [ttsSpeed, voiceGender]);

  const stopDrill = useCallback(() => {
    clearTimers();
    recorder.cancel();
    stopSpeaking();
    setPhase('idle');
    setFeedback(null);
    setError(null);
    feedbackOpacity.value = 0;
    feedbackScale.value = 0.8;
  }, [recorder, clearTimers, feedbackOpacity, feedbackScale]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recorder.cancel();
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  return {
    phase,
    feedback,
    error,
    feedbackAnimStyle,
    startDrill,
    stopDrill,
    dismissFeedback,
    listenToWord,
  };
}
