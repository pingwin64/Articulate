import * as Speech from 'expo-speech';
import type { TTSSpeed, VoiceGender } from './store/settings';

const RATE_MAP: Record<TTSSpeed, number> = {
  slow: 0.8,
  normal: 1.0,
  fast: 1.3,
};

// iOS voice identifiers for English
const VOICE_MAP: Record<VoiceGender, string> = {
  female: 'com.apple.voice.compact.en-US.Samantha',
  male: 'com.apple.voice.compact.en-US.Aaron',
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
    voice: VOICE_MAP[gender],
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
