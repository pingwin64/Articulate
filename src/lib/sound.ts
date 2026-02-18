import { AudioPlayer, createAudioPlayer } from 'expo-audio';

let tickPlayer: AudioPlayer | null = null;

/**
 * Preload the tick sound so playback is instant.
 * Uses a short system-style click via an oscillator-generated silent buffer.
 * Since we don't have a bundled .wav, we use Haptics as the primary feedback
 * and this module is a no-op stub that can be replaced with a real audio file later.
 */
export function preloadTickSound() {
  // No-op for now — tick feedback is handled via Haptics.
  // To add a real tick sound:
  // 1. Add a .wav file to assets/sounds/tick.wav
  // 2. Use: tickPlayer = createAudioPlayer(require('../../assets/sounds/tick.wav'));
}

export function playTick() {
  // No-op for now — tick feedback is handled via Haptics in reading.tsx.
  // Replace with tickPlayer?.seekTo(0); tickPlayer?.play(); when a sound file is added.
}
