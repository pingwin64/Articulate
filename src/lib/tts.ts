import * as Speech from 'expo-speech';
import type { TTSSpeed, VoiceGender } from './store/settings';

const RATE_MAP: Record<TTSSpeed, number> = {
  slow: 0.8,
  normal: 1.0,
  fast: 1.3,
};

// Cache for voice identifiers
let cachedVoices: { male?: string; female?: string } = {};
let voicesLoaded = false;

// Initialize voices on first use
async function loadVoices(): Promise<void> {
  if (voicesLoaded) return;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const enUSVoices = voices.filter(v =>
      v.language === 'en-US' || v.language?.startsWith('en-US')
    );

    // Find female voice - prefer Samantha (default iOS female) or any female
    const femaleVoice = enUSVoices.find(v =>
      v.identifier?.toLowerCase().includes('samantha') ||
      v.name?.toLowerCase().includes('samantha')
    ) || enUSVoices.find(v =>
      v.identifier?.toLowerCase().includes('female') ||
      v.name?.toLowerCase().includes('female') ||
      // Common female voice names
      v.name?.toLowerCase().includes('victoria') ||
      v.name?.toLowerCase().includes('karen') ||
      v.name?.toLowerCase().includes('moira')
    );

    // Find male voice - prefer Alex (default iOS male) or any male
    const maleVoice = enUSVoices.find(v =>
      v.identifier?.toLowerCase().includes('alex') ||
      v.name?.toLowerCase().includes('alex')
    ) || enUSVoices.find(v =>
      v.identifier?.toLowerCase().includes('male') ||
      v.name?.toLowerCase().includes('male') ||
      // Common male voice names
      v.name?.toLowerCase().includes('daniel') ||
      v.name?.toLowerCase().includes('tom') ||
      v.name?.toLowerCase().includes('fred')
    );

    if (femaleVoice?.identifier) {
      cachedVoices.female = femaleVoice.identifier;
    }
    if (maleVoice?.identifier) {
      cachedVoices.male = maleVoice.identifier;
    }

    voicesLoaded = true;
  } catch (error) {
    // Silently fail - will use pitch fallback
    voicesLoaded = true;
  }
}

// Eagerly load voices when module is imported
loadVoices();

export function speakWord(
  word: string,
  speed: TTSSpeed,
  gender: VoiceGender = 'female'
): void {
  Speech.stop();

  const voiceId = gender === 'male' ? cachedVoices.male : cachedVoices.female;

  Speech.speak(word, {
    rate: RATE_MAP[speed],
    language: 'en-US',
    // Use voice identifier if available, otherwise fall back to pitch adjustment
    ...(voiceId ? { voice: voiceId } : {}),
    // Keep pitch as secondary differentiation
    pitch: gender === 'male' ? 0.9 : 1.05,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
