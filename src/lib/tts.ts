import * as Speech from 'expo-speech';
import type { TTSSpeed, VoiceGender } from './store/settings';

const RATE_MAP: Record<TTSSpeed, number> = {
  slow: 0.8,
  normal: 1.0,
  fast: 1.3,
};

export function speakWord(
  word: string,
  speed: TTSSpeed,
  gender: VoiceGender = 'female'
): void {
  Speech.stop();
  Speech.speak(word, {
    rate: RATE_MAP[speed],
    language: 'en-US',
    pitch: gender === 'male' ? 0.85 : 1.1,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
