import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { File } from 'expo-file-system';

export interface Recorder {
  requestMicPermission: () => Promise<boolean>;
  start: () => Promise<void>;
  stop: () => Promise<string>;
  cancel: () => void;
}

export function useRecording(): Recorder {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  async function requestMicPermission(): Promise<boolean> {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    return granted;
  }

  async function start(): Promise<void> {
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }

  async function stop(): Promise<string> {
    try {
      await audioRecorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = audioRecorder.uri;
      if (!uri) throw new Error('No recording URI');
      const file = new File(uri);
      return await file.base64();
    } catch (err) {
      await setAudioModeAsync({ allowsRecording: false });
      throw err;
    }
  }

  function cancel(): void {
    try {
      audioRecorder.stop();
      setAudioModeAsync({ allowsRecording: false });
    } catch {}
  }

  return { requestMicPermission, start, stop, cancel };
}
