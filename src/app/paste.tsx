import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassButton } from '../components/GlassButton';
import { Paywall } from '../components/Paywall';
import { Spacing } from '../design/theme';
import * as ImagePicker from 'expo-image-picker';
import { extractArticle } from '../lib/extractArticle';
import { parseFile } from '../lib/parseFile';
import { scanTextFromImage } from '../lib/scanText';

const URL_REGEX = /^https?:\/\/[^\s]+$/;

export default function PasteScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ editTextId?: string; action?: string }>();
  const {
    addCustomText, hapticFeedback, isPremium, customTexts, updateCustomText, removeCustomText,
    setPaywallContext, showPaywall, paywallContext,
    canFreeUserUpload, getFreeTextExpiry, getFreeUserActiveText, cleanupExpiredFreeTexts,
  } = useSettingsStore();

  const editingText = params.editTextId
    ? customTexts.find((t) => t.id === params.editTextId)
    : undefined;

  // Clean up expired texts on mount
  React.useEffect(() => {
    cleanupExpiredFreeTexts();
  }, [cleanupExpiredFreeTexts]);

  const textInputRef = useRef<TextInput>(null);
  const [title, setTitle] = useState(editingText?.title ?? '');
  const [text, setText] = useState(editingText?.text ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [textSource, setTextSource] = useState<'paste' | 'file' | 'url' | 'scan'>(editingText?.source ?? 'paste');

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = text.trim() ? words.length : 0;

  const isUrl = URL_REGEX.test(text.trim());

  // Check if free user can upload (no active text, or text has expired)
  const canUpload = canFreeUserUpload();
  const activeText = getFreeUserActiveText();

  // Gate: free users with an active (non-expired) text cannot add another
  const isGated = !isPremium && !editingText && !canUpload && activeText !== null;

  // Countdown timer to expiry
  const [timeToExpiry, setTimeToExpiry] = useState('');
  useEffect(() => {
    if (!isGated) return;
    const tick = () => {
      const expiry = getFreeTextExpiry();
      if (expiry === null || expiry <= 0) {
        setTimeToExpiry('0h 0m');
        return;
      }
      const h = Math.floor(expiry / 3600000);
      const m = Math.floor((expiry % 3600000) / 60000);
      setTimeToExpiry(`${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [isGated]);

  // Free user can have 1 text at a time - if they have one, replacing is allowed
  const atLimit = !isPremium && customTexts.length >= 1 && !editingText;

  // Shared helper: create or replace a custom text
  const createOrReplaceText = useCallback(() => {
    const trimmedTitle = title.trim() || 'My Text';
    const trimmedText = text.trim();

    // If at storage limit (free user with existing text), replace it
    if (atLimit && customTexts.length > 0) {
      const existingId = customTexts[0].id;
      removeCustomText(existingId);
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const customText = {
      id,
      title: trimmedTitle,
      text: trimmedText,
      wordCount,
      createdAt: new Date().toISOString(),
      timesRead: 0,
      source: textSource,
      preview: trimmedText.slice(0, 120),
    };
    addCustomText(customText);
    return id;
  }, [title, text, wordCount, atLimit, customTexts, removeCustomText, addCustomText]);

  const handleStartReading = useCallback(() => {
    if (wordCount === 0) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (editingText) {
      updateCustomText(editingText.id, {
        title: title.trim() || 'My Text',
        text: text.trim(),
        wordCount,
      });
      router.replace({
        pathname: '/reading',
        params: { customTextId: editingText.id },
      });
    } else {
      const id = createOrReplaceText();
      router.replace({
        pathname: '/reading',
        params: { customTextId: id },
      });
    }
  }, [wordCount, title, text, hapticFeedback, updateCustomText, editingText, router, createOrReplaceText]);

  const handleSaveToLibrary = useCallback(() => {
    if (wordCount === 0) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (editingText) {
      updateCustomText(editingText.id, {
        title: title.trim() || 'My Text',
        text: text.trim(),
        wordCount,
      });
      Alert.alert('Saved', 'Your text has been updated.');
      router.back();
    } else {
      createOrReplaceText();
      Alert.alert('Saved', atLimit ? 'Your previous text has been replaced.' : 'Your text has been saved to your library.');
      router.back();
    }
  }, [wordCount, title, text, hapticFeedback, updateCustomText, editingText, router, createOrReplaceText, atLimit]);

  const handleExtractUrl = useCallback(async () => {
    const url = text.trim();
    if (!URL_REGEX.test(url)) return;

    setIsLoading(true);
    setLoadingMessage('Extracting article...');

    try {
      const article = await extractArticle(url);

      if (article.wordCount > 50000) {
        Alert.alert(
          'Large Article',
          `This article has ${article.wordCount.toLocaleString()} words (~${Math.round(article.wordCount / 200)} min read). Import anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              onPress: () => {
                setTitle(article.title);
                setText(article.text);
              },
            },
          ]
        );
      } else {
        setTitle(article.title);
        setText(article.text);
        setTextSource('url');
      }
    } catch (error: any) {
      Alert.alert('Extraction Failed', error.message || "Couldn't extract article from that URL");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [text]);

  const handleImportFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      setIsLoading(true);
      setLoadingMessage(file.mimeType === 'application/pdf' ? 'Extracting text...' : 'Reading file...');

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const parsed = await parseFile(file.uri, file.mimeType || '');

      if (parsed.wordCount > 50000) {
        Alert.alert(
          'Large File',
          `This text has ${parsed.wordCount.toLocaleString()} words (~${Math.round(parsed.wordCount / 200 / 60)} hours of reading). Import anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              onPress: () => {
                setTitle(parsed.title);
                setText(parsed.text);
              },
            },
          ]
        );
      } else {
        setTitle(parsed.title);
        setText(parsed.text);
        setTextSource('file');
      }
    } catch (error: any) {
      Alert.alert('Import Failed', error.message || "Couldn't read that file");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [hapticFeedback]);

  const handleScanText = useCallback(async (source: 'camera' | 'library') => {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is needed to scan text.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library permission is needed to scan text.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.8,
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'Could not read the image. Please try again.');
        return;
      }

      setIsLoading(true);
      setLoadingMessage('Scanning text...');

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const scanned = await scanTextFromImage(asset.base64);
      setText(scanned.text);
      setTextSource('scan');

      // Auto-generate title from first line if title is empty
      if (!title.trim()) {
        const firstLine = scanned.text.split('\n').find((l) => l.trim())?.trim() ?? '';
        if (firstLine.length > 0 && firstLine.length <= 100) {
          setTitle(firstLine);
        }
      }
    } catch (error: any) {
      Alert.alert('Scan Failed', error.message || "Couldn't extract text from that image");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [hapticFeedback, title]);

  const handleScanPrompt = useCallback(() => {
    Alert.alert('Scan Text', 'Choose a source', [
      { text: 'Take Photo', onPress: () => handleScanText('camera') },
      { text: 'Choose from Library', onPress: () => handleScanText('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleScanText]);

  // Deep link actions from home hero buttons
  useEffect(() => {
    if (editingText) return;
    const action = typeof params.action === 'string' ? params.action : undefined;
    if (!action) return;
    if (action === 'scan') {
      handleScanPrompt();
      return;
    }
    if (action === 'import') {
      handleImportFile();
      return;
    }
    if (action === 'paste') {
      setTimeout(() => textInputRef.current?.focus(), 50);
    }
  }, [params.action, editingText, handleScanPrompt, handleImportFile]);

  const handleClose = () => {
    router.back();
  };

  // Full-screen gate overlay - free user already has an active text
  if (isGated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={[styles.flex, styles.gateContainer]}>
          <Feather name="clock" size={40} color={colors.muted} />
          <Text style={[styles.gateHeadline, { color: colors.primary }]}>
            You already have a text
          </Text>
          <Text style={[styles.gateCountdown, { color: colors.secondary }]}>
            Your current text expires in {timeToExpiry}
          </Text>
          <Text style={[styles.gateSubtext, { color: colors.muted }]}>
            Free: 1 text at a time (24h access)
          </Text>
          <View style={styles.gateActions}>
            <GlassButton
              title="View My Text"
              variant="outline"
              onPress={() => router.replace({ pathname: '/library', params: { tab: 'myTexts' } })}
            />
            <GlassButton
              title="Unlock Unlimited Texts"
              onPress={() => setPaywallContext('custom_text_limit')}
            />
            <Pressable onPress={() => router.back()} style={styles.gateWaitButton}>
              <Text style={[styles.gateWaitText, { color: colors.muted }]}>
                I'll wait
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
        <Paywall
          visible={showPaywall}
          onDismiss={() => setPaywallContext(null)}
          context={paywallContext}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.headerButton}>
              <Text style={[styles.closeIcon, { color: colors.primary }]}>
                {'\u2715'}
              </Text>
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>
              {editingText ? 'Edit Text' : 'Your Text'}
            </Text>
            <View style={styles.headerButton} />
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Import File Card */}
            <Animated.View entering={FadeIn.delay(50).duration(300)}>
              <Pressable
                onPress={handleImportFile}
                disabled={isLoading}
                style={[
                  styles.importCard,
                  {
                    backgroundColor: glass.fill,
                    borderColor: glass.border,
                  },
                ]}
              >
                <Feather name="file-text" size={20} color={colors.primary} />
                <View style={styles.importCardText}>
                  <Text style={[styles.importCardTitle, { color: colors.primary }]}>
                    Import File
                  </Text>
                  <Text style={[styles.importCardSubtitle, { color: colors.muted }]}>
                    .txt, .pdf, or .docx
                  </Text>
                </View>
                <Feather name="upload" size={18} color={colors.muted} />
              </Pressable>
            </Animated.View>

            {/* Scan Text Card */}
            <Animated.View entering={FadeIn.delay(100).duration(300)}>
              <Pressable
                onPress={handleScanPrompt}
                disabled={isLoading}
                style={[
                  styles.importCard,
                  {
                    backgroundColor: glass.fill,
                    borderColor: glass.border,
                  },
                ]}
              >
                <Feather name="camera" size={20} color={colors.primary} />
                <View style={styles.importCardText}>
                  <Text style={[styles.importCardTitle, { color: colors.primary }]}>
                    Scan Text
                  </Text>
                  <Text style={[styles.importCardSubtitle, { color: colors.muted }]}>
                    Camera or photo library
                  </Text>
                </View>
                <Feather name="image" size={18} color={colors.muted} />
              </Pressable>
            </Animated.View>

            {/* Title field */}
            <Animated.View entering={FadeIn.delay(150).duration(300)}>
              <Text style={[styles.label, { color: colors.secondary }]}>
                Title (optional)
              </Text>
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    color: colors.primary,
                    backgroundColor: glass.fill,
                    borderColor: glass.border,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Morning Article"
                placeholderTextColor={colors.muted}
                maxLength={100}
                returnKeyType="next"
                onSubmitEditing={() => textInputRef.current?.focus()}
              />
            </Animated.View>

            {/* Text input */}
            <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.textInputContainer}>
              <Text style={[styles.label, { color: colors.secondary }]}>
                Paste your text or URL
              </Text>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.textInput,
                  {
                    color: colors.primary,
                    backgroundColor: glass.fill,
                    borderColor: glass.border,
                  },
                ]}
                value={text}
                onChangeText={setText}
                placeholder="Paste an article, book passage, study notes, or a URL to extract..."
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
                scrollEnabled
              />
            </Animated.View>

            {/* URL extraction button */}
            {isUrl && !isLoading && (
              <Animated.View entering={FadeIn.duration(200)}>
                <Pressable
                  onPress={handleExtractUrl}
                  style={[
                    styles.extractButton,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      borderColor: glass.border,
                    },
                  ]}
                >
                  <Feather name="globe" size={18} color={colors.primary} />
                  <Text style={[styles.extractButtonText, { color: colors.primary }]}>
                    Extract Article from URL
                  </Text>
                  <Feather name="arrow-right" size={16} color={colors.muted} />
                </Pressable>
              </Animated.View>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.secondary }]}>
                  {loadingMessage}
                </Text>
              </View>
            )}

            {/* Word count */}
            {!isUrl && (
              <Animated.View entering={FadeIn.delay(350).duration(300)} style={styles.statsRow}>
                <View style={styles.wordCountBadge}>
                  <Feather name="type" size={14} color={colors.secondary} />
                  <Text style={[styles.wordCount, { color: colors.secondary }]}>
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </Text>
                </View>
                {wordCount > 0 && (
                  <Text style={[styles.timeEstimate, { color: colors.muted }]}>
                    ~{Math.max(1, Math.round(wordCount / 200))} min read
                  </Text>
                )}
              </Animated.View>
            )}

            {/* Limit message - show when at storage limit */}
            {atLimit && (
              <View style={styles.limitSection}>
                <Text style={[styles.limitMessage, { color: colors.muted }]}>
                  Starting will replace your saved text
                </Text>
              </View>
            )}
          </ScrollView>

          {/* CTA */}
          <Animated.View entering={FadeIn.delay(450).duration(300)} style={styles.ctaContainer}>
            <GlassButton
              title="Save to Library"
              onPress={handleSaveToLibrary}
              disabled={wordCount === 0 || isUrl || isLoading}
              variant="outline"
            />
            <GlassButton
              title="Start Reading"
              onPress={handleStartReading}
              disabled={wordCount === 0 || isUrl || isLoading}
            />
            {!isPremium && !editingText && (
              <Text style={[styles.dailyLimitHint, { color: colors.muted }]}>
                Free: 1 text for 24 hours
              </Text>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Paywall modal */}
      <Paywall
        visible={showPaywall}
        onDismiss={() => setPaywallContext(null)}
        context={paywallContext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: 16,
    flexGrow: 1,
  },
  // Import file card
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
  },
  importCardText: {
    flex: 1,
    gap: 1,
  },
  importCardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  importCardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titleInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '400',
  },
  textInputContainer: {
    flex: 1,
    minHeight: 200,
  },
  textInput: {
    flex: 1,
    minHeight: 180,
    borderRadius: 12,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
  },
  extractButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeEstimate: {
    fontSize: 13,
    fontWeight: '400',
  },
  limitSection: {
    alignItems: 'center',
  },
  limitMessage: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  // Full-screen daily gate overlay
  gateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: Spacing.lg,
  },
  gateHeadline: {
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginTop: 12,
  },
  gateCountdown: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  gateSubtext: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  gateActions: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  gateWaitButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  gateWaitText: {
    fontSize: 14,
    fontWeight: '400',
  },
  dailyLimitHint: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
  },
});
