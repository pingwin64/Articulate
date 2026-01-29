import React, { useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassButton } from '../components/GlassButton';
import { Spacing } from '../design/theme';
import { extractArticle } from '../lib/extractArticle';
import { parseFile } from '../lib/parseFile';

const URL_REGEX = /^https?:\/\/[^\s]+$/;

export default function PasteScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const { addCustomText, hapticFeedback, isPremium, customTexts } = useSettingsStore();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = text.trim() ? words.length : 0;

  const isUrl = URL_REGEX.test(text.trim());

  const handleStartReading = useCallback(() => {
    if (wordCount === 0) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const customText = {
      id,
      title: title.trim() || 'My Text',
      text: text.trim(),
      wordCount,
      createdAt: new Date().toISOString(),
    };

    addCustomText(customText);

    router.replace({
      pathname: '/reading',
      params: { customTextId: id },
    });
  }, [wordCount, title, text, hapticFeedback, addCustomText, router]);

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
        type: ['text/plain', 'application/epub+zip'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      setIsLoading(true);
      setLoadingMessage('Reading file...');

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
      }
    } catch (error: any) {
      Alert.alert('Import Failed', error.message || "Couldn't read that file");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [hapticFeedback]);

  const handleClose = () => {
    router.back();
  };

  const limitMessage = !isPremium && customTexts.length >= 1
    ? 'Free accounts can save 1 text at a time. Starting will replace your previous text.'
    : null;

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
              Paste Text
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
                    .txt or .epub
                  </Text>
                </View>
                <Feather name="upload" size={18} color={colors.muted} />
              </Pressable>
            </Animated.View>

            {/* Title field */}
            <Animated.View entering={FadeIn.delay(100).duration(300)}>
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
              />
            </Animated.View>

            {/* Text input */}
            <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.textInputContainer}>
              <Text style={[styles.label, { color: colors.secondary }]}>
                Paste your text or URL
              </Text>
              <TextInput
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
              <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.statsRow}>
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

            {/* Limit message */}
            {limitMessage && (
              <Text style={[styles.limitMessage, { color: colors.muted }]}>
                {limitMessage}
              </Text>
            )}
          </ScrollView>

          {/* CTA */}
          <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.ctaContainer}>
            <GlassButton
              title="Start Reading"
              onPress={handleStartReading}
              disabled={wordCount === 0 || isUrl || isLoading}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  limitMessage: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});
