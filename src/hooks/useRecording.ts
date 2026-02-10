import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

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
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }

  async function stop(): Promise<string> {
    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    if (!uri) throw new Error('No recording URI');
    return FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  }

  function cancel(): void {
    try {
      audioRecorder.stop();
    } catch {}
  }

  return { requestMicPermission, start, stop, cancel };
}
