import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { GlassSlider } from '../components/GlassSlider';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from '../components/GlassCard';
import { GlassToggle } from '../components/GlassToggle';
import { GlassSegmentedControl } from '../components/GlassSegmentedControl';
import { FontPicker } from '../components/FontPicker';
import { WordPreview } from '../components/WordPreview';
import { StatCard } from '../components/StatCard';
import {
  BackgroundThemes,
  WordColors,
  WordSizeRange,
  Spacing,
} from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';
import type { ReadingLevel, TTSSpeed } from '../lib/store/settings';

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: colors.secondary }]}>
      {title}
    </Text>
  );
}

function SettingRow({
  label,
  children,
  noBorder = false,
}: {
  label: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  const { colors, glass } = useTheme();
  return (
    <View style={[noBorder ? styles.settingRowNoBorder : styles.settingRow, { borderBottomColor: glass.border }]}>
      <Text style={[styles.settingLabel, { color: colors.primary }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function LockedSettingRow({
  label,
  children,
  isPremium,
  noBorder = false,
}: {
  label: string;
  children: React.ReactNode;
  isPremium: boolean;
  noBorder?: boolean;
}) {
  const { colors, glass, isDark } = useTheme();

  if (isPremium) {
    return (
      <SettingRow label={label} noBorder={noBorder}>
        {children}
      </SettingRow>
    );
  }

  const handlePress = () => {
    Alert.alert('Pro Feature', 'Upgrade to Pro to unlock this feature');
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={[noBorder ? styles.settingRowNoBorder : styles.settingRow, { borderBottomColor: glass.border }]}>
        <View style={styles.lockedLabelRow}>
          <Text style={[styles.settingLabel, { color: colors.muted }]}>
            {label}
          </Text>
          <View style={[styles.proBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
            <Text style={[styles.proBadgeText, { color: colors.muted }]}>PRO</Text>
          </View>
        </View>
        <Feather name="lock" size={14} color={colors.muted} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors, glass, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Use Zustand selectors to prevent unnecessary re-renders
  const {
    isPremium,
    themeMode, setThemeMode,
    backgroundTheme, setBackgroundTheme,
    fontFamily, setFontFamily,
    wordSize, setWordSize,
    wordBold, setWordBold,
    wordColor, setWordColor,
    readingLevel, setReadingLevel,
    sentenceRecap, setSentenceRecap,
    voiceDetection, setVoiceDetection,
    hapticFeedback, setHapticFeedback,
    breathingAnimation, setBreathingAnimation,
    ttsSpeed, setTtsSpeed,
    autoPlay, setAutoPlay,
    autoPlayWPM, setAutoPlayWPM,
    totalWordsRead, textsCompleted, currentStreak,
  } = useSettingsStore(useShallow((s) => ({
    isPremium: s.isPremium,
    themeMode: s.themeMode, setThemeMode: s.setThemeMode,
    backgroundTheme: s.backgroundTheme, setBackgroundTheme: s.setBackgroundTheme,
    fontFamily: s.fontFamily, setFontFamily: s.setFontFamily,
    wordSize: s.wordSize, setWordSize: s.setWordSize,
    wordBold: s.wordBold, setWordBold: s.setWordBold,
    wordColor: s.wordColor, setWordColor: s.setWordColor,
    readingLevel: s.readingLevel, setReadingLevel: s.setReadingLevel,
    sentenceRecap: s.sentenceRecap, setSentenceRecap: s.setSentenceRecap,
    voiceDetection: s.voiceDetection, setVoiceDetection: s.setVoiceDetection,
    hapticFeedback: s.hapticFeedback, setHapticFeedback: s.setHapticFeedback,
    breathingAnimation: s.breathingAnimation, setBreathingAnimation: s.setBreathingAnimation,
    ttsSpeed: s.ttsSpeed, setTtsSpeed: s.setTtsSpeed,
    autoPlay: s.autoPlay, setAutoPlay: s.setAutoPlay,
    autoPlayWPM: s.autoPlayWPM, setAutoPlayWPM: s.setAutoPlayWPM,
    totalWordsRead: s.totalWordsRead, textsCompleted: s.textsCompleted, currentStreak: s.currentStreak,
  })));

  const themeModes = ['Light', 'Dark'];
  const themeIndex = themeMode === 'dark' ? 1 : 0;

  const readingLevels: ReadingLevel[] = ['beginner', 'intermediate', 'advanced'];
  const readingLevelLabels = ['Beginner', 'Intermediate', 'Advanced'];
  const readingLevelIndex = readingLevels.indexOf(readingLevel);

  const ttsSpeeds: TTSSpeed[] = ['slow', 'normal', 'fast'];
  const ttsLabels = ['Slow', 'Normal', 'Fast'];
  const ttsIndex = ttsSpeeds.indexOf(ttsSpeed);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header - removed close button since formSheet has native swipe-to-dismiss */}
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
          {/* Stats card */}
          <GlassCard>
            <View style={styles.statsRow}>
              <StatCard label="Words" value={totalWordsRead} />
              <StatCard label="Texts" value={textsCompleted} />
              <StatCard label="Streak" value={currentStreak} />
            </View>
          </GlassCard>

          {/* Appearance */}
          <SectionHeader title="Appearance" />
          <GlassCard>
            <SettingRow label="Theme">
              <GlassSegmentedControl
                options={themeModes}
                selectedIndex={themeIndex}
                onSelect={(i) =>
                  setThemeMode(i === 0 ? 'light' : 'dark')
                }
              />
            </SettingRow>
            {isPremium ? (
              <View style={styles.settingRowNoBorder}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Background
                </Text>
                <View style={styles.swatchRow}>
                  {BackgroundThemes.map((theme) => {
                    const bgColor = isDark ? theme.dark : theme.light;
                    const isSelected = backgroundTheme === theme.key;
                    return (
                      <Pressable
                        key={theme.key}
                        onPress={() => setBackgroundTheme(theme.key)}
                        style={[
                          styles.swatch,
                          {
                            backgroundColor: bgColor,
                            borderColor: isSelected
                              ? colors.primary
                              : glass.border,
                            borderWidth: isSelected ? 2 : 0.5,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            ) : (
              <LockedSettingRow label="Background" isPremium={isPremium} noBorder>
                <View />
              </LockedSettingRow>
            )}
          </GlassCard>

          {/* Word Display */}
          <SectionHeader title="Word Display" />
          <GlassCard>
            {/* Live preview */}
            <WordPreview />
            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Font picker - Pro only */}
            {isPremium ? (
              <View style={styles.settingBlock}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Font
                </Text>
                <View style={styles.fontPickerContainer}>
                  <FontPicker
                    selected={fontFamily}
                    onSelect={(key: FontFamilyKey) => setFontFamily(key)}
                  />
                </View>
              </View>
            ) : (
              <LockedSettingRow label="Font" isPremium={isPremium}>
                <View />
              </LockedSettingRow>
            )}

            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Size slider - Pro only */}
            {isPremium ? (
              <View style={styles.settingBlock}>
                <View style={styles.sliderHeader}>
                  <Text style={[styles.settingLabel, { color: colors.primary }]}>
                    Size
                  </Text>
                  <Text style={[styles.sliderValue, { color: colors.muted }]}>
                    {wordSize}px
                  </Text>
                </View>
                <GlassSlider
                  value={wordSize}
                  minimumValue={WordSizeRange.min}
                  maximumValue={WordSizeRange.max}
                  step={1}
                  onValueChange={setWordSize}
                  leftLabel="Small"
                  rightLabel="Large"
                />
              </View>
            ) : (
              <LockedSettingRow label="Size" isPremium={isPremium}>
                <View />
              </LockedSettingRow>
            )}

            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Bold toggle - Pro only */}
            <LockedSettingRow label="Bold" isPremium={isPremium}>
              <GlassToggle
                value={wordBold}
                onValueChange={setWordBold}
              />
            </LockedSettingRow>

            {/* Color picker - Pro only */}
            {isPremium ? (
              <View style={styles.settingRowNoBorder}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Color
                </Text>
                <View style={styles.colorRow}>
                  {WordColors.map((wc) => {
                    const circleColor = wc.color ?? colors.primary;
                    const isSelected = wordColor === wc.key;
                    return (
                      <Pressable
                        key={wc.key}
                        onPress={() => setWordColor(wc.key as WordColorKey)}
                        style={[
                          styles.colorCircle,
                          {
                            backgroundColor: circleColor,
                            borderColor: isSelected
                              ? colors.primary
                              : 'transparent',
                            borderWidth: isSelected ? 2 : 0,
                          },
                        ]}
                      >
                        {isSelected && (
                          <View
                            style={[
                              styles.colorInner,
                              { borderColor: colors.bg },
                            ]}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <LockedSettingRow label="Color" isPremium={isPremium} noBorder>
                <View />
              </LockedSettingRow>
            )}
          </GlassCard>

          {/* Reading */}
          <SectionHeader title="Reading" />
          <GlassCard>
            <View style={styles.settingBlock}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Reading Level
              </Text>
              <View style={styles.segmentedControlWrapper}>
                <GlassSegmentedControl
                  options={readingLevelLabels}
                  selectedIndex={readingLevelIndex}
                  onSelect={(i) => setReadingLevel(readingLevels[i])}
                />
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: glass.border }]} />
            <SettingRow label="Sentence Recap">
              <GlassToggle
                value={sentenceRecap}
                onValueChange={setSentenceRecap}
              />
            </SettingRow>
            <LockedSettingRow label="Voice Detection" isPremium={isPremium}>
              <GlassToggle
                value={voiceDetection}
                onValueChange={setVoiceDetection}
              />
            </LockedSettingRow>
            <SettingRow label="Haptic Feedback">
              <GlassToggle
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
              />
            </SettingRow>
            <LockedSettingRow label="Breathing Animation" isPremium={isPremium} noBorder>
              <GlassToggle
                value={breathingAnimation}
                onValueChange={setBreathingAnimation}
              />
            </LockedSettingRow>
          </GlassCard>

          {/* Audio */}
          <SectionHeader title="Audio" />
          <GlassCard>
            <View style={styles.settingBlock}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                TTS Speed
              </Text>
              <View style={styles.segmentedControlWrapper}>
                <GlassSegmentedControl
                  options={ttsLabels}
                  selectedIndex={ttsIndex}
                  onSelect={(i) => setTtsSpeed(ttsSpeeds[i])}
                />
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: glass.border }]} />
            <LockedSettingRow label="Auto-Play" isPremium={isPremium} noBorder={!isPremium || !autoPlay}>
              <GlassToggle
                value={autoPlay}
                onValueChange={setAutoPlay}
              />
            </LockedSettingRow>
            {isPremium && autoPlay && (
              <>
                <View style={[styles.separator, { backgroundColor: glass.border }]} />
                <View style={styles.settingBlock}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.settingLabel, { color: colors.primary }]}>
                      Auto-Play Speed
                    </Text>
                    <Text style={[styles.sliderValue, { color: colors.muted }]}>
                      {autoPlayWPM} WPM
                    </Text>
                  </View>
                  <GlassSlider
                    value={autoPlayWPM}
                    minimumValue={150}
                    maximumValue={400}
                    step={10}
                    onValueChange={setAutoPlayWPM}
                    leftLabel="150"
                    rightLabel="400"
                  />
                </View>
              </>
            )}
          </GlassCard>

          <View style={{ height: 40 + insets.bottom }} />
        </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: -4,
    paddingLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  settingRowNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  settingBlock: {
    paddingVertical: 12,
  },
  separator: {
    height: 0.5,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderCurve: 'continuous',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  fontPickerContainer: {
    marginTop: 10,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 13,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderCurve: 'continuous',
    borderWidth: 2,
  },
  segmentedControlWrapper: {
    marginTop: 8,
  },
  lockedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
