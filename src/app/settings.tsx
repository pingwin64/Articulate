import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassSlider } from '../components/GlassSlider';
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
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors, glass } = useTheme();
  return (
    <View style={[styles.settingRow, { borderBottomColor: glass.border }]}>
      <Text style={[styles.settingLabel, { color: colors.primary }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const store = useSettingsStore();

  const themeModes = ['Light', 'Dark'];
  const themeIndex = store.themeMode === 'dark' ? 1 : 0;

  const readingLevels: ReadingLevel[] = ['beginner', 'intermediate', 'advanced'];
  const readingLevelLabels = ['Beginner', 'Intermediate', 'Advanced'];
  const readingLevelIndex = readingLevels.indexOf(store.readingLevel);

  const ttsSpeeds: TTSSpeed[] = ['slow', 'normal', 'fast'];
  const ttsLabels = ['Slow', 'Normal', 'Fast'];
  const ttsIndex = ttsSpeeds.indexOf(store.ttsSpeed);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Settings
          </Text>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={[styles.closeIcon, { color: colors.primary }]}>
              {'\u2715'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats card */}
          <GlassCard>
            <View style={styles.statsRow}>
              <StatCard label="Words" value={store.totalWordsRead} />
              <StatCard label="Texts" value={store.textsCompleted} />
              <StatCard label="Streak" value={store.currentStreak} />
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
                  store.setThemeMode(i === 0 ? 'light' : 'dark')
                }
              />
            </SettingRow>
            <View style={styles.settingRowNoBorder}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Background
              </Text>
              <View style={styles.swatchRow}>
                {BackgroundThemes.map((theme) => {
                  const bgColor = isDark ? theme.dark : theme.light;
                  const isSelected = store.backgroundTheme === theme.key;
                  return (
                    <Pressable
                      key={theme.key}
                      onPress={() => store.setBackgroundTheme(theme.key)}
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
          </GlassCard>

          {/* Word Display */}
          <SectionHeader title="Word Display" />
          <GlassCard>
            {/* Live preview */}
            <WordPreview />
            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Font picker */}
            <View style={styles.settingBlock}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Font
              </Text>
              <View style={styles.fontPickerContainer}>
                <FontPicker
                  selected={store.fontFamily}
                  onSelect={(key: FontFamilyKey) => store.setFontFamily(key)}
                />
              </View>
            </View>

            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Size slider */}
            <View style={styles.settingBlock}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Size
                </Text>
                <Text style={[styles.sliderValue, { color: colors.muted }]}>
                  {store.wordSize}px
                </Text>
              </View>
              <GlassSlider
                value={store.wordSize}
                minimumValue={WordSizeRange.min}
                maximumValue={WordSizeRange.max}
                step={1}
                onValueChange={store.setWordSize}
                leftLabel="Small"
                rightLabel="Large"
              />
            </View>

            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Bold toggle */}
            <SettingRow label="Bold">
              <GlassToggle
                value={store.wordBold}
                onValueChange={store.setWordBold}
              />
            </SettingRow>

            {/* Color picker */}
            <View style={styles.settingRowNoBorder}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Color
              </Text>
              <View style={styles.colorRow}>
                {WordColors.map((wc) => {
                  const circleColor = wc.color ?? colors.primary;
                  const isSelected = store.wordColor === wc.key;
                  return (
                    <Pressable
                      key={wc.key}
                      onPress={() => store.setWordColor(wc.key as WordColorKey)}
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
          </GlassCard>

          {/* Reading */}
          <SectionHeader title="Reading" />
          <GlassCard>
            <View style={styles.settingBlock}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Reading Level
              </Text>
              <View style={{ marginTop: 8 }}>
                <GlassSegmentedControl
                  options={readingLevelLabels}
                  selectedIndex={readingLevelIndex}
                  onSelect={(i) => store.setReadingLevel(readingLevels[i])}
                />
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: glass.border }]} />
            <SettingRow label="Sentence Recap">
              <GlassToggle
                value={store.sentenceRecap}
                onValueChange={store.setSentenceRecap}
              />
            </SettingRow>
            <SettingRow label="Voice Detection">
              <GlassToggle
                value={store.voiceDetection}
                onValueChange={store.setVoiceDetection}
              />
            </SettingRow>
            <View style={styles.settingRowNoBorder}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Haptic Feedback
              </Text>
              <GlassToggle
                value={store.hapticFeedback}
                onValueChange={store.setHapticFeedback}
              />
            </View>
          </GlassCard>

          {/* Audio */}
          <SectionHeader title="Audio" />
          <GlassCard>
            <View style={styles.settingBlock}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                TTS Speed
              </Text>
              <View style={{ marginTop: 8 }}>
                <GlassSegmentedControl
                  options={ttsLabels}
                  selectedIndex={ttsIndex}
                  onSelect={(i) => store.setTtsSpeed(ttsSpeeds[i])}
                />
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: glass.border }]} />
            <SettingRow label="Auto-Play">
              <GlassToggle
                value={store.autoPlay}
                onValueChange={store.setAutoPlay}
              />
            </SettingRow>
            {store.autoPlay && (
              <>
                <View style={[styles.separator, { backgroundColor: glass.border }]} />
                <View style={styles.settingBlock}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.settingLabel, { color: colors.primary }]}>
                      Auto-Play Speed
                    </Text>
                    <Text style={[styles.sliderValue, { color: colors.muted }]}>
                      {store.autoPlayWPM} WPM
                    </Text>
                  </View>
                  <GlassSlider
                    value={store.autoPlayWPM}
                    minimumValue={150}
                    maximumValue={400}
                    step={10}
                    onValueChange={store.setAutoPlayWPM}
                    leftLabel="150"
                    rightLabel="400"
                  />
                </View>
              </>
            )}
          </GlassCard>

          <View style={styles.bottomPadding} />
        </ScrollView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '300',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
