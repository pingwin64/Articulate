import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassSlider } from '../components/GlassSlider';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from '../components/GlassCard';
import { GlassToggle } from '../components/GlassToggle';
import { GlassSegmentedControl } from '../components/GlassSegmentedControl';
import { FontPicker } from '../components/FontPicker';
import { WordPreview } from '../components/WordPreview';
import { Paywall } from '../components/Paywall';
import {
  BackgroundThemes,
  WordColors,
  WordSizeRange,
  Spacing,
  Radius,
} from '../design/theme';
import type { FontFamilyKey, WordColorKey } from '../design/theme';
import type { ReadingLevel, TTSSpeed, PaywallContext } from '../lib/store/settings';
import {
  requestNotificationPermissions,
  scheduleStreakReminder,
  cancelAllReminders,
} from '../lib/notifications';
import { restorePurchases } from '../lib/purchases';

function SectionHeader({ title, icon }: { title: string; icon?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeaderRow}>
      {icon && <Feather name={icon as any} size={14} color={colors.secondary} />}
      <Text style={[styles.sectionHeader, { color: colors.secondary }]}>
        {title}
      </Text>
    </View>
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
  onLockedPress,
}: {
  label: string;
  children: React.ReactNode;
  isPremium: boolean;
  noBorder?: boolean;
  onLockedPress?: () => void;
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
    if (onLockedPress) {
      onLockedPress();
    } else {
      Alert.alert('Pro Feature', 'Upgrade to Pro to unlock this feature');
    }
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

function GradientOrb() {
  const { colors, glass, isDark } = useTheme();
  const wordColor = useSettingsStore((s) => s.wordColor);
  const resolved = WordColors.find((c) => c.key === wordColor);
  const accentColor = resolved?.color ?? colors.primary;
  const accentColor44 = accentColor + '44';

  return (
    <View style={styles.orbContainer}>
      <LinearGradient
        colors={[accentColor, accentColor44]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.orb, { borderColor: glass.border }]}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();

  const {
    isPremium,
    trialActive,
    themeMode, setThemeMode,
    backgroundTheme, setBackgroundTheme,
    fontFamily, setFontFamily,
    wordSize, setWordSize,
    wordBold, setWordBold,
    wordColor, setWordColor,
    readingLevel, setReadingLevel,
    sentenceRecap, setSentenceRecap,
    hapticFeedback, setHapticFeedback,
    breathingAnimation, setBreathingAnimation,
    ttsSpeed, setTtsSpeed,
    autoPlay, setAutoPlay,
    autoPlayWPM, setAutoPlayWPM,
    chunkSize, setChunkSize,
    showPaywall,
    setPaywallContext,
    paywallContext,
    addTrialFeatureUsed,
    totalWordsRead,
    currentStreak,
    trialDaysRemaining,
    notificationsEnabled, setNotificationsEnabled,
    reminderHour, reminderMinute, setReminderTime,
    reduceMotion, setReduceMotion,
  } = useSettingsStore(useShallow((s) => ({
    isPremium: s.isPremium,
    trialActive: s.trialActive,
    themeMode: s.themeMode, setThemeMode: s.setThemeMode,
    backgroundTheme: s.backgroundTheme, setBackgroundTheme: s.setBackgroundTheme,
    fontFamily: s.fontFamily, setFontFamily: s.setFontFamily,
    wordSize: s.wordSize, setWordSize: s.setWordSize,
    wordBold: s.wordBold, setWordBold: s.setWordBold,
    wordColor: s.wordColor, setWordColor: s.setWordColor,
    readingLevel: s.readingLevel, setReadingLevel: s.setReadingLevel,
    sentenceRecap: s.sentenceRecap, setSentenceRecap: s.setSentenceRecap,
    hapticFeedback: s.hapticFeedback, setHapticFeedback: s.setHapticFeedback,
    breathingAnimation: s.breathingAnimation, setBreathingAnimation: s.setBreathingAnimation,
    ttsSpeed: s.ttsSpeed, setTtsSpeed: s.setTtsSpeed,
    autoPlay: s.autoPlay, setAutoPlay: s.setAutoPlay,
    autoPlayWPM: s.autoPlayWPM, setAutoPlayWPM: s.setAutoPlayWPM,
    chunkSize: s.chunkSize, setChunkSize: s.setChunkSize,
    showPaywall: s.showPaywall,
    setPaywallContext: s.setPaywallContext,
    paywallContext: s.paywallContext,
    addTrialFeatureUsed: s.addTrialFeatureUsed,
    totalWordsRead: s.totalWordsRead,
    currentStreak: s.currentStreak,
    trialDaysRemaining: s.trialDaysRemaining,
    notificationsEnabled: s.notificationsEnabled, setNotificationsEnabled: s.setNotificationsEnabled,
    reminderHour: s.reminderHour, reminderMinute: s.reminderMinute, setReminderTime: s.setReminderTime,
    reduceMotion: s.reduceMotion, setReduceMotion: s.setReduceMotion,
  })));

  // Peek animation state
  const [peekActive, setPeekActive] = useState(false);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const peekAndShowPaywall = useCallback((
    context: PaywallContext,
    previewFn?: () => void,
    revertFn?: () => void,
  ) => {
    if (previewFn && revertFn) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      previewFn();
      setPeekActive(true);
      peekTimeoutRef.current = setTimeout(() => {
        revertFn();
        setPeekActive(false);
        setPaywallContext(context);
      }, 1500);
    } else {
      setPaywallContext(context);
    }
  }, [hapticFeedback, setPaywallContext]);

  const handleSetFontFamily = useCallback((v: FontFamilyKey) => {
    setFontFamily(v);
    if (trialActive) addTrialFeatureUsed(`font:${v}`);
  }, [setFontFamily, trialActive, addTrialFeatureUsed]);

  const handleSetWordColor = useCallback((v: WordColorKey) => {
    setWordColor(v);
    if (trialActive) addTrialFeatureUsed(`color:${v}`);
  }, [setWordColor, trialActive, addTrialFeatureUsed]);

  const handleSetWordSize = useCallback((v: number) => {
    setWordSize(v);
    if (trialActive) addTrialFeatureUsed(`size:${v}`);
  }, [setWordSize, trialActive, addTrialFeatureUsed]);

  const handleSetWordBold = useCallback((v: boolean) => {
    setWordBold(v);
    if (trialActive && v) addTrialFeatureUsed('bold');
  }, [setWordBold, trialActive, addTrialFeatureUsed]);

  const handleSetBackgroundTheme = useCallback((v: string) => {
    setBackgroundTheme(v);
    if (trialActive) addTrialFeatureUsed(`background:${v}`);
  }, [setBackgroundTheme, trialActive, addTrialFeatureUsed]);

  const handleSetAutoPlay = useCallback((v: boolean) => {
    setAutoPlay(v);
    if (trialActive && v) addTrialFeatureUsed('autoplay');
  }, [setAutoPlay, trialActive, addTrialFeatureUsed]);

  const handleSetBreathingAnimation = useCallback((v: boolean) => {
    setBreathingAnimation(v);
    if (trialActive && v) addTrialFeatureUsed('breathing');
  }, [setBreathingAnimation, trialActive, addTrialFeatureUsed]);

  const handleSetChunkSize = useCallback((v: 1 | 2 | 3) => {
    setChunkSize(v);
    if (trialActive && v > 1) addTrialFeatureUsed('chunk');
  }, [setChunkSize, trialActive, addTrialFeatureUsed]);

  const handleLockedPress = (context: PaywallContext) => {
    setPaywallContext(context);
  };

  const handleToggleNotifications = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permissions Required', 'Please enable notifications in your device settings.');
        return;
      }
      setNotificationsEnabled(true);
      await scheduleStreakReminder(reminderHour, reminderMinute, currentStreak);
    } else {
      setNotificationsEnabled(false);
      await cancelAllReminders();
    }
  }, [setNotificationsEnabled, reminderHour, reminderMinute, currentStreak]);

  const handleSetReminderTime = useCallback(async (hour: number, minute: number) => {
    setReminderTime(hour, minute);
    if (notificationsEnabled) {
      await scheduleStreakReminder(hour, minute, currentStreak);
    }
  }, [setReminderTime, notificationsEnabled, currentStreak]);

  const reminderTimeLabel = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;

  const readingLevelLabel = readingLevel === 'beginner' ? 'Beginner'
    : readingLevel === 'intermediate' ? 'Intermediate' : 'Advanced';

  const formatNumber = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

  const membershipLabel = isPremium ? 'PRO'
    : trialActive ? `TRIAL \u00B7 ${trialDaysRemaining()} days left` : 'FREE';

  const membershipBadgeBg = isPremium
    ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
    : trialActive
      ? isDark ? 'rgba(255,149,0,0.15)' : 'rgba(255,149,0,0.1)'
      : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  const membershipBadgeColor = isPremium ? colors.primary
    : trialActive ? colors.warning : colors.muted;

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
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
          {/* Profile identity */}
          <View style={styles.profileSection}>
            <GradientOrb />
            <Text style={[styles.identityTitle, { color: colors.primary }]}>
              {readingLevelLabel} Reader
            </Text>
            <Text style={[styles.identitySubtitle, { color: colors.muted }]}>
              {formatNumber(totalWordsRead)} words{currentStreak > 0 ? ` \u00B7 ${currentStreak} day streak` : ''}
            </Text>
            {!isPremium ? (
              <Pressable
                onPress={() => setPaywallContext('settings_upgrade')}
                style={[styles.upgradeBadge, { backgroundColor: membershipBadgeBg, borderColor: membershipBadgeColor + '40' }]}
              >
                <Text style={[styles.membershipBadgeText, { color: membershipBadgeColor }]}>
                  {membershipLabel}
                </Text>
                <Feather name="chevron-right" size={12} color={membershipBadgeColor} />
              </Pressable>
            ) : (
              <View style={[styles.proBadgeTop, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
                <Feather name="award" size={12} color={colors.primary} />
                <Text style={[styles.proBadgeTopText, { color: colors.primary }]}>PRO</Text>
              </View>
            )}
          </View>

          {/* Hero: Live Word Preview */}
          <GlassCard>
            <WordPreview />
          </GlassCard>

          {/* Section 1: Appearance */}
          <SectionHeader title="Appearance" icon="eye" />
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

            {/* Font picker - Pro only */}
            {isPremium || trialActive ? (
              <View style={styles.settingBlock}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Font
                </Text>
                <View style={styles.fontPickerContainer}>
                  <FontPicker
                    selected={fontFamily}
                    onSelect={(key: FontFamilyKey) => handleSetFontFamily(key)}
                  />
                </View>
              </View>
            ) : (
              <LockedSettingRow label="Font" isPremium={false} onLockedPress={() => {
                const origFont = fontFamily;
                peekAndShowPaywall(
                  'locked_font',
                  () => setFontFamily('literata'),
                  () => setFontFamily(origFont),
                );
              }}>
                <View />
              </LockedSettingRow>
            )}

            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Size slider - Pro only */}
            {isPremium || trialActive ? (
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
                  onValueChange={handleSetWordSize}
                  leftLabel="Small"
                  rightLabel="Large"
                />
              </View>
            ) : (
              <LockedSettingRow label="Size" isPremium={false} onLockedPress={() => {
                const origSize = wordSize;
                peekAndShowPaywall(
                  'locked_size',
                  () => setWordSize(56),
                  () => setWordSize(origSize),
                );
              }}>
                <View />
              </LockedSettingRow>
            )}

            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Bold toggle - Pro only */}
            <LockedSettingRow label="Bold" isPremium={isPremium || trialActive} onLockedPress={() => {
              const origBold = wordBold;
              peekAndShowPaywall(
                'locked_bold',
                () => setWordBold(true),
                () => setWordBold(origBold),
              );
            }}>
              <GlassToggle
                value={wordBold}
                onValueChange={handleSetWordBold}
              />
            </LockedSettingRow>

            {/* Color picker - Pro only */}
            {isPremium || trialActive ? (
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
                        onPress={() => handleSetWordColor(wc.key as WordColorKey)}
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
              <LockedSettingRow label="Color" isPremium={false} noBorder onLockedPress={() => {
                const origColor = wordColor;
                peekAndShowPaywall(
                  'locked_color',
                  () => setWordColor('ocean'),
                  () => setWordColor(origColor),
                );
              }}>
                <View />
              </LockedSettingRow>
            )}

            {/* Background swatches */}
            {isPremium || trialActive ? (
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
                        onPress={() => handleSetBackgroundTheme(theme.key)}
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
              <LockedSettingRow label="Background" isPremium={false} noBorder onLockedPress={() => {
                const origBg = backgroundTheme;
                peekAndShowPaywall(
                  'locked_background',
                  () => setBackgroundTheme('paper'),
                  () => setBackgroundTheme(origBg),
                );
              }}>
                <View />
              </LockedSettingRow>
            )}
          </GlassCard>

          {/* Section 2: Reading */}
          <SectionHeader title="Reading" icon="book" />
          <GlassCard>
            <View style={styles.settingBlock}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Words at a Time
              </Text>
              <View style={styles.segmentedControlWrapper}>
                <GlassSegmentedControl
                  options={['1', '2', '3']}
                  selectedIndex={chunkSize - 1}
                  onSelect={(i) => {
                    const size = (i + 1) as 1 | 2 | 3;
                    if (size > 1 && !isPremium && !trialActive) {
                      setPaywallContext('locked_chunk');
                      return;
                    }
                    handleSetChunkSize(size);
                  }}
                />
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: glass.border }]} />
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
            <SettingRow label="Haptic Feedback" noBorder>
              <GlassToggle
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
              />
            </SettingRow>
          </GlassCard>

          {/* Section 3: Audio */}
          <SectionHeader title="Audio" icon="volume-2" />
          <GlassCard>
            {isPremium || trialActive ? (
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
            ) : (
              <LockedSettingRow label="TTS Speed" isPremium={false} onLockedPress={() => handleLockedPress('locked_tts')}>
                <View />
              </LockedSettingRow>
            )}
            <View style={[styles.separator, { backgroundColor: glass.border }]} />
            <LockedSettingRow label="Auto-Play" isPremium={isPremium || trialActive} noBorder={(!isPremium && !trialActive) || !autoPlay} onLockedPress={() => handleLockedPress('locked_autoplay')}>
              <GlassToggle
                value={autoPlay}
                onValueChange={handleSetAutoPlay}
              />
            </LockedSettingRow>
            {(isPremium || trialActive) && autoPlay && (
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

          {/* Section 4: Advanced */}
          <SectionHeader title="Advanced" icon="sliders" />
          <GlassCard>
            <LockedSettingRow label="Breathing Animation" isPremium={isPremium || trialActive} onLockedPress={() => handleLockedPress('locked_breathing')}>
              <GlassToggle
                value={breathingAnimation}
                onValueChange={handleSetBreathingAnimation}
              />
            </LockedSettingRow>
            <SettingRow label="Reduce Motion" noBorder>
              <GlassToggle
                value={reduceMotion}
                onValueChange={setReduceMotion}
              />
            </SettingRow>
          </GlassCard>

          {/* Section 5: Notifications */}
          <SectionHeader title="Notifications" icon="bell" />
          <GlassCard>
            <SettingRow label="Daily Reminder" noBorder={!notificationsEnabled}>
              <GlassToggle
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
              />
            </SettingRow>
            {notificationsEnabled && (
              <SettingRow label="Reminder Time" noBorder>
                <View style={styles.reminderTimeRow}>
                  <Pressable
                    onPress={() => {
                      const newHour = (reminderHour + 1) % 24;
                      handleSetReminderTime(newHour, reminderMinute);
                    }}
                    style={styles.timeButton}
                  >
                    <Text style={[styles.timeButtonText, { color: colors.primary }]}>
                      {reminderTimeLabel}
                    </Text>
                  </Pressable>
                </View>
              </SettingRow>
            )}
          </GlassCard>

          {/* Section 6: About */}
          <SectionHeader title="About" icon="info" />
          <GlassCard>
            <Pressable
              onPress={() => router.push('/privacy')}
              style={styles.settingRow}
            >
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Privacy Policy
              </Text>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/tos')}
              style={styles.settingRow}
            >
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Terms of Service
              </Text>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
            {isPremium && (
              <Pressable
                onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
                style={styles.settingRow}
              >
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Manage Subscription
                </Text>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </Pressable>
            )}
            <Pressable
              onPress={async () => {
                const success = await restorePurchases();
                if (success) {
                  Alert.alert('Restored', 'Your purchases have been restored.');
                } else {
                  Alert.alert('No Purchases Found', 'No previous purchases were found.');
                }
              }}
              style={styles.settingRowNoBorder}
            >
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Restore Purchases
              </Text>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          </GlassCard>

          <View style={{ height: 40 }} />
        </ScrollView>

      {/* Paywall */}
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
  profileSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  orbContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderCurve: 'continuous',
    borderWidth: 1,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  identityTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: Spacing.md,
  },
  identitySubtitle: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  membershipBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  proBadgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  proBadgeTopText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: -4,
    paddingLeft: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
    marginHorizontal: -16,
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
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
