import { useRef, useCallback } from 'react';
import { File } from 'expo-file-system';

export interface Recorder {
  requestMicPermission: () => Promise<boolean>;
  start: () => Promise<void>;
  stop: () => Promise<string>;
  cancel: () => void;
}

// Lazy-load expo-audio to avoid module-level prototype patching that crashes
// when the native AudioRecorder SharedObject isn't ready yet.
function getAudioModule() {
  return require('expo-audio') as typeof import('expo-audio');
}

/**
 * Lazy audio recorder — defers all expo-audio access to when recording actually starts,
 * avoiding the "SharedObject<AudioRecorder>" crash at module import time.
 */
export function useRecording(): Recorder {
  const recorderRef = useRef<any>(null);

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    const { AudioModule } = getAudioModule();
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    return granted;
  }, []);

  const start = useCallback(async (): Promise<void> => {
    const { AudioModule, RecordingPresets, setAudioModeAsync } = getAudioModule();
    // Release any previous recorder
    if (recorderRef.current) {
      try { await recorderRef.current.stop(); } catch {}
      recorderRef.current = null;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
    recorderRef.current = recorder;
    await recorder.prepareToRecordAsync();
    recorder.record();
  }, []);

  const stop = useCallback(async (): Promise<string> => {
    const { setAudioModeAsync } = getAudioModule();
    const recorder = recorderRef.current;
    if (!recorder) throw new Error('No active recorder');
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;
      if (!uri) throw new Error('No recording URI');
      const file = new File(uri);
      return await file.base64();
    } catch (err) {
      await setAudioModeAsync({ allowsRecording: false });
      throw err;
    }
  }, []);

  const cancel = useCallback((): void => {
    try {
      const { setAudioModeAsync } = getAudioModule();
      recorderRef.current?.stop();
      setAudioModeAsync({ allowsRecording: false });
    } catch {}
    recorderRef.current = null;
  }, []);

  return { requestMicPermission, start, stop, cancel };
}
