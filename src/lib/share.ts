import { Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

/**
 * Capture a ref as PNG and open the native share sheet.
 * Falls back to a plain text share if capture fails.
 */
export async function captureAndShare(
  ref: RefObject<View | null>,
  fallbackMessage: string,
  dialogTitle?: string
): Promise<void> {
  try {
    const uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
    });

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: dialogTitle ?? 'Share',
    });
  } catch {
    await Share.share({ message: fallbackMessage });
  }
}
