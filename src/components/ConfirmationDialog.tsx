import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Springs } from '../design/theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmationDialogProps) {
  const { colors, glass, isDark } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(200)}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(28,28,30,0.98)' : 'rgba(255,255,255,0.98)',
            borderColor: glass.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
        {message && (
          <Text style={[styles.message, { color: colors.secondary }]}>{message}</Text>
        )}

        <View style={styles.buttons}>
          <Pressable
            onPress={onCancel}
            style={[styles.button, styles.cancelButton]}
          >
            <Text style={[styles.cancelText, { color: colors.muted }]}>
              {cancelLabel}
            </Text>
          </Pressable>

          <Pressable
            onPress={onConfirm}
            style={[
              styles.button,
              styles.confirmButton,
              {
                backgroundColor: destructive
                  ? (colors.error ?? '#FF3B30') + '15'
                  : colors.primary + '15',
              },
            ]}
          >
            <Text
              style={[
                styles.confirmText,
                { color: destructive ? (colors.error ?? '#FF3B30') : colors.primary },
              ]}
            >
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {},
  confirmButton: {},
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
