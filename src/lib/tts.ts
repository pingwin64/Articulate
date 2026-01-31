import * as Speech from 'expo-speech';
import type { TTSSpeed } from './store/settings';

const RATE_MAP: Record<TTSSpeed, number> = {
  slow: 0.8,
  normal: 1.0,
  fast: 1.3,
};

export function speakWord(word: string, speed: TTSSpeed): void {
  Speech.stop();
  Speech.speak(word, {
    rate: RATE_MAP[speed],
    language: 'en-US',
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
