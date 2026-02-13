import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  ActionSheetIOS,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { GlassSlider } from '../components/GlassSlider';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from '../components/GlassCard';
import { GlassToggle } from '../components/GlassToggle';
import { GlassSegmentedControl } from '../components/GlassSegmentedControl';
import { Paywall } from '../components/Paywall';
import { Spacing } from '../design/theme';
import type { PaywallContext, TTSSpeed, VoiceGender } from '../lib/store/settings';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  requestNotificationPermissions,
  scheduleStreakReminder,
  cancelAllReminders,
  scheduleWindDownReminder,
  cancelWindDownReminder,
} from '../lib/notifications';
import { restorePurchases } from '../lib/purchases';
import type { FeatherIconName } from '../types/icons';

// Profile Zone Components
import { HeroProfileSection } from '../components/profile/HeroProfileSection';
import { StatsDashboard } from '../components/profile/StatsDashboard';
import { AchievementShowcase } from '../components/profile/AchievementShowcase';
import { QuickActionCards } from '../components/profile/QuickActionCards';
import { ReadingHistorySection } from '../components/profile/ReadingHistorySection';
import { AppearanceSection } from '../components/profile/AppearanceSection';
import { ProfileZoneDivider } from '../components/profile/ProfileZoneDivider';

// ─── Settings Zone Helpers ───────────────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon?: FeatherIconName }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeaderRow}>
      {icon && <Feather name={icon} size={14} color={colors.secondary} />}
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

function SettingsUpgradeCTA({ onPress }: { onPress: () => void }) {
  const { colors, glass } = useTheme();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const shimmerOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    if (reduceMotion) return;
    shimmerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion, shimmerOpacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  return (
    <Pressable onPress={onPress}>
      <View style={[
        styles.upgradeCTACard,
        { backgroundColor: glass.fill, borderColor: glass.border },
      ]}>
        <Animated.View style={[
          styles.upgradeCTAAccentLine,
          { backgroundColor: colors.primary },
          shimmerStyle,
        ]} />
        <View style={styles.upgradeCTAContent}>
          <Feather name="zap" size={24} color={colors.primary} />
          <Text style={[styles.upgradeCTATitle, { color: colors.primary }]}>
            Read Your Way
          </Text>
          <Text style={[styles.upgradeCTASubtitle, { color: colors.secondary }]}>
            Unlock all fonts, colors, themes, and more
          </Text>
          <Feather name="arrow-right" size={18} color={colors.muted} style={{ marginTop: 8 }} />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();

  const {
    isPremium,
    trialActive,
    profileImage, setProfileImage,
    profileColor, setProfileColor,
    sentenceRecap, setSentenceRecap,
    hapticFeedback, setHapticFeedback,
    breathingAnimation, setBreathingAnimation,
    windDownMode, setWindDownMode,
    ttsSpeed, setTtsSpeed,
    voiceGender, setVoiceGender,
    autoPlay, setAutoPlay,
    autoPlayWPM, setAutoPlayWPM,
    chunkSize, setChunkSize,
    showPaywall,
    setPaywallContext,
    paywallContext,
    addTrialFeatureUsed,
    currentStreak,
    notificationsEnabled, setNotificationsEnabled,
    reminderHour, reminderMinute, setReminderTime,
    reduceMotion, setReduceMotion,
    dailyWordGoal, setDailyWordGoal,
    sleepTimerMinutes, setSleepTimerMinutes,
    windDownReminderEnabled, setWindDownReminderEnabled,
    windDownReminderHour, windDownReminderMinute, setWindDownReminderTime,
    resetAll,
  } = useSettingsStore(useShallow((s) => ({
    isPremium: s.isPremium,
    trialActive: s.trialActive,
    profileImage: s.profileImage, setProfileImage: s.setProfileImage,
    profileColor: s.profileColor, setProfileColor: s.setProfileColor,
    sentenceRecap: s.sentenceRecap, setSentenceRecap: s.setSentenceRecap,
    hapticFeedback: s.hapticFeedback, setHapticFeedback: s.setHapticFeedback,
    breathingAnimation: s.breathingAnimation, setBreathingAnimation: s.setBreathingAnimation,
    windDownMode: s.windDownMode, setWindDownMode: s.setWindDownMode,
    ttsSpeed: s.ttsSpeed, setTtsSpeed: s.setTtsSpeed,
    voiceGender: s.voiceGender, setVoiceGender: s.setVoiceGender,
    autoPlay: s.autoPlay, setAutoPlay: s.setAutoPlay,
    autoPlayWPM: s.autoPlayWPM, setAutoPlayWPM: s.setAutoPlayWPM,
    chunkSize: s.chunkSize, setChunkSize: s.setChunkSize,
    showPaywall: s.showPaywall,
    setPaywallContext: s.setPaywallContext,
    paywallContext: s.paywallContext,
    addTrialFeatureUsed: s.addTrialFeatureUsed,
    currentStreak: s.currentStreak,
    notificationsEnabled: s.notificationsEnabled, setNotificationsEnabled: s.setNotificationsEnabled,
    reminderHour: s.reminderHour, reminderMinute: s.reminderMinute, setReminderTime: s.setReminderTime,
    reduceMotion: s.reduceMotion, setReduceMotion: s.setReduceMotion,
    dailyWordGoal: s.dailyWordGoal, setDailyWordGoal: s.setDailyWordGoal,
    sleepTimerMinutes: s.sleepTimerMinutes, setSleepTimerMinutes: s.setSleepTimerMinutes,
    windDownReminderEnabled: s.windDownReminderEnabled, setWindDownReminderEnabled: s.setWindDownReminderEnabled,
    windDownReminderHour: s.windDownReminderHour, windDownReminderMinute: s.windDownReminderMinute, setWindDownReminderTime: s.setWindDownReminderTime,
    resetAll: s.resetAll,
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

  // Profile color options
  const PROFILE_COLORS = [
    '#A78BFA', '#60A5FA', '#34D399', '#F472B6',
    '#FBBF24', '#F87171', '#818CF8', '#2DD4BF',
  ];

  const handleEditProfile = useCallback(() => {
    if (isPremium || trialActive) {
      const options = profileImage
        ? ['Choose Photo', 'Change Color', 'Remove Photo', 'Cancel']
        : ['Choose Photo', 'Change Color', 'Cancel'];
      const cancelIndex = profileImage ? 3 : 2;
      const destructiveIndex = profileImage ? 2 : undefined;

      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, destructiveButtonIndex: destructiveIndex },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Please allow access to your photos to set a profile picture.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setProfileImage(result.assets[0].uri);
            }
          } else if (buttonIndex === 1) {
            ActionSheetIOS.showActionSheetWithOptions(
              { options: ['Purple', 'Blue', 'Green', 'Pink', 'Yellow', 'Red', 'Indigo', 'Teal', 'Cancel'], cancelButtonIndex: 8 },
              (colorIndex) => {
                if (colorIndex < 8) {
                  setProfileColor(PROFILE_COLORS[colorIndex]);
                  setProfileImage(null);
                }
              }
            );
          } else if (buttonIndex === 2 && profileImage) {
            setProfileImage(null);
          }
        }
      );
    } else {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Purple', 'Blue', 'Green', 'Pink', 'Yellow', 'Red', 'Indigo', 'Teal', 'Cancel'], cancelButtonIndex: 8 },
        (colorIndex) => {
          if (colorIndex < 8) {
            setProfileColor(PROFILE_COLORS[colorIndex]);
          }
        }
      );
    }
  }, [isPremium, trialActive, profileImage, setProfileImage, setProfileColor]);

  // Settings Zone handlers
  const handleLockedPress = (context: PaywallContext) => {
    setPaywallContext(context);
  };

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

  const handleToggleNotifications = useCallback(async (enabled: boolean) => {
    try {
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
    } catch {
      // Notification scheduling may fail on some devices
    }
  }, [setNotificationsEnabled, reminderHour, reminderMinute, currentStreak]);

  const handleSetReminderTime = useCallback(async (hour: number, minute: number) => {
    setReminderTime(hour, minute);
    if (notificationsEnabled) {
      await scheduleStreakReminder(hour, minute, currentStreak);
    }
  }, [setReminderTime, notificationsEnabled, currentStreak]);

  // Wind-down reminder handlers
  const handleToggleWindDownReminder = useCallback(async (enabled: boolean) => {
    try {
      if (enabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert('Permissions Required', 'Please enable notifications in your device settings.');
          return;
        }
        setWindDownReminderEnabled(true);
        await scheduleWindDownReminder(windDownReminderHour, windDownReminderMinute);
      } else {
        setWindDownReminderEnabled(false);
        await cancelWindDownReminder();
      }
    } catch {
      // Notification scheduling may fail on some devices
    }
  }, [setWindDownReminderEnabled, windDownReminderHour, windDownReminderMinute]);

  const handleSetWindDownReminderTime = useCallback(async (hour: number, minute: number) => {
    setWindDownReminderTime(hour, minute);
    if (windDownReminderEnabled) {
      await scheduleWindDownReminder(hour, minute);
    }
  }, [setWindDownReminderTime, windDownReminderEnabled]);

  // Sleep timer options
  const sleepTimerOptions = ['Off', '5m', '10m', '15m', '20m'];
  const sleepTimerValues = [0, 5, 10, 15, 20];
  const sleepTimerIndex = sleepTimerValues.indexOf(sleepTimerMinutes);

  const ttsSpeeds: TTSSpeed[] = ['slow', 'normal', 'fast'];
  const ttsLabels = ['Slow', 'Normal', 'Fast'];
  const ttsIndex = ttsSpeeds.indexOf(ttsSpeed);

  const voiceGenders: VoiceGender[] = ['female', 'male'];
  const voiceLabels = ['Female', 'Male'];
  const voiceIndex = Math.max(0, voiceGenders.indexOf(voiceGender));

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
        {/* ═══════════════════════════════════════════════════════════════════
            PROFILE & CUSTOMIZATION ZONE
            ═══════════════════════════════════════════════════════════════════ */}

        <HeroProfileSection
          onEditProfile={handleEditProfile}
          reduceMotion={reduceMotion}
        />

        <StatsDashboard reduceMotion={reduceMotion} />

        <AchievementShowcase reduceMotion={reduceMotion} />

        <QuickActionCards
          reduceMotion={reduceMotion}
          onPaywall={(ctx) => setPaywallContext(ctx)}
        />

        <ReadingHistorySection reduceMotion={reduceMotion} />

        {/* Upgrade CTA for free users */}
        {!isPremium && !trialActive && (
          <SettingsUpgradeCTA onPress={() => setPaywallContext('settings_upgrade')} />
        )}

        <AppearanceSection
          reduceMotion={reduceMotion}
          peekAndShowPaywall={peekAndShowPaywall}
          handleLockedPress={handleLockedPress}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            SETTINGS ZONE
            ═══════════════════════════════════════════════════════════════════ */}

        <ProfileZoneDivider />

        {/* Reading */}
        <SectionHeader title="Reading" icon="book" />
        <GlassCard>
          <LockedSettingRow label="Wind Down" isPremium={isPremium || trialActive} onLockedPress={() => handleLockedPress('locked_wind_down')} noBorder={windDownMode && (isPremium || trialActive)}>
            <GlassToggle
              value={windDownMode}
              onValueChange={setWindDownMode}
            />
          </LockedSettingRow>
          {(isPremium || trialActive) && windDownMode && (
            <>
              <View style={[styles.separator, { backgroundColor: glass.border }]} />
              <View style={styles.settingBlock}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Sleep Timer
                </Text>
                <View style={styles.segmentedControlWrapper}>
                  <GlassSegmentedControl
                    options={sleepTimerOptions}
                    selectedIndex={sleepTimerIndex >= 0 ? sleepTimerIndex : 2}
                    onSelect={(i) => setSleepTimerMinutes(sleepTimerValues[i])}
                  />
                </View>
              </View>
              <View style={[styles.separator, { backgroundColor: glass.border }]} />
              <SettingRow label="Bedtime Reminder" noBorder={!windDownReminderEnabled}>
                <GlassToggle
                  value={windDownReminderEnabled}
                  onValueChange={handleToggleWindDownReminder}
                />
              </SettingRow>
              {windDownReminderEnabled && (
                <SettingRow label="Reminder Time" noBorder>
                  <DateTimePicker
                    value={(() => {
                      const d = new Date();
                      d.setHours(windDownReminderHour, windDownReminderMinute, 0, 0);
                      return d;
                    })()}
                    mode="time"
                    display="default"
                    onChange={(_, selectedDate) => {
                      if (selectedDate) {
                        handleSetWindDownReminderTime(selectedDate.getHours(), selectedDate.getMinutes());
                      }
                    }}
                  />
                </SettingRow>
              )}
            </>
          )}
          <View style={[styles.separator, { backgroundColor: glass.border }]} />
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

        {/* Audio */}
        <SectionHeader title="Audio" icon="volume-2" />
        <GlassCard>
          <View style={styles.settingBlock}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>
              Voice
            </Text>
            <View style={styles.segmentedControlWrapper}>
              <GlassSegmentedControl
                options={voiceLabels}
                selectedIndex={voiceIndex}
                onSelect={(i) => setVoiceGender(voiceGenders[i])}
              />
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: glass.border }]} />
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

        {/* Advanced */}
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

        {/* Notifications */}
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
              <DateTimePicker
                value={(() => {
                  const d = new Date();
                  d.setHours(reminderHour, reminderMinute, 0, 0);
                  return d;
                })()}
                mode="time"
                display="default"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    handleSetReminderTime(selectedDate.getHours(), selectedDate.getMinutes());
                  }
                }}
              />
            </SettingRow>
          )}
        </GlassCard>

        {/* Daily Goal */}
        <SectionHeader title="Daily Goal" icon="crosshair" />
        <GlassCard>
          <View style={styles.settingBlock}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Words per Day
              </Text>
              <Text style={[styles.sliderValue, { color: colors.muted }]}>
                {dailyWordGoal}
              </Text>
            </View>
            <GlassSlider
              value={dailyWordGoal}
              minimumValue={50}
              maximumValue={500}
              step={50}
              onValueChange={setDailyWordGoal}
              leftLabel="50"
              rightLabel="500"
            />
          </View>
        </GlassCard>

        {/* About */}
        <SectionHeader title="About" icon="info" />
        <GlassCard>
          <Pressable onPress={() => router.push('/privacy')} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>Privacy Policy</Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
          <Pressable onPress={() => router.push('/tos')} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>Terms of Service</Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
          {isPremium && (
            <Pressable
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
              style={styles.settingRow}
            >
              <Text style={[styles.settingLabel, { color: colors.primary }]}>Manage Subscription</Text>
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
            <Text style={[styles.settingLabel, { color: colors.primary }]}>Restore Purchases</Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
        </GlassCard>

        {/* Help */}
        <SectionHeader title="Help" icon="help-circle" />
        <GlassCard>
          <Pressable
            onPress={async () => {
              try {
                const isAvailable = await StoreReview.isAvailableAsync();
                if (isAvailable) {
                  await StoreReview.requestReview();
                }
              } catch {
                // StoreReview may not be available on all devices
              }
            }}
            style={styles.settingRow}
          >
            <Text style={[styles.settingLabel, { color: colors.primary }]}>Rate Articulate</Text>
            <Feather name="star" size={18} color={colors.muted} />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('mailto:admin@ordco.net?subject=Articulate%20Support')}
            style={styles.settingRowNoBorder}
          >
            <Text style={[styles.settingLabel, { color: colors.primary }]}>Contact Support</Text>
            <Feather name="mail" size={18} color={colors.muted} />
          </Pressable>
        </GlassCard>

        {/* DEV ONLY: Streak Celebration Testing */}
        {__DEV__ && (
          <>
            <SectionHeader title="Dev Testing" icon="code" />
            <GlassCard>
              <View style={styles.devTestRow}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Test Streak Celebration
                </Text>
              </View>
              <View style={styles.devTestButtons}>
                {[3, 7, 14, 30, 50, 100, 365].map((milestone) => (
                  <Pressable
                    key={milestone}
                    onPress={() => {
                      useSettingsStore.setState({
                        currentStreak: milestone,
                        shownStreakCelebrations: [],
                      });
                      Alert.alert('Streak Set', `Streak set to ${milestone}. Complete a reading to see the celebration.`);
                    }}
                    style={({ pressed }) => [
                      styles.devTestButton,
                      { backgroundColor: pressed ? glass.border : glass.fill, borderColor: glass.border },
                    ]}
                  >
                    <Text style={[styles.devTestButtonText, { color: colors.primary }]}>
                      {milestone}d
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={() => {
                  useSettingsStore.setState({ shownStreakCelebrations: [] });
                  Alert.alert('Reset', 'Celebration history cleared.');
                }}
                style={styles.settingRowNoBorder}
              >
                <Text style={[styles.settingLabel, { color: colors.secondary }]}>
                  Clear Celebration History
                </Text>
                <Feather name="refresh-cw" size={16} color={colors.secondary} />
              </Pressable>
            </GlassCard>
          </>
        )}

        {/* Data */}
        <SectionHeader title="Data" icon="trash-2" />
        <GlassCard>
          <Pressable
            onPress={() => {
              Alert.alert(
                'Reset All Data',
                'This will erase all your reading progress, preferences, and settings. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset Everything',
                    style: 'destructive',
                    onPress: () => {
                      resetAll();
                      if (hapticFeedback) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                    },
                  },
                ]
              );
            }}
            style={styles.settingRowNoBorder}
          >
            <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>
              Reset All Data
            </Text>
            <Feather name="trash-2" size={18} color="#FF3B30" />
          </Pressable>
        </GlassCard>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.muted }]}>
          Articulate v{Constants.expoConfig?.version ?? '1.0.0'}{Constants.expoConfig?.ios?.buildNumber ? ` (${Constants.expoConfig.ios.buildNumber})` : ''}
        </Text>

        <View style={{ height: 24 }} />
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
  segmentedControlWrapper: {
    marginTop: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Upgrade CTA
  upgradeCTACard: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  upgradeCTAAccentLine: {
    height: 1,
  },
  upgradeCTAContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
  },
  upgradeCTATitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 4,
  },
  upgradeCTASubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  // Dev testing
  devTestRow: {
    paddingVertical: 8,
  },
  devTestButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  devTestButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  devTestButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
