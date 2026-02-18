import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { GlassSlider } from '../components/GlassSlider';
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
  scheduleWindDownReminder,
  cancelWindDownReminder,
} from '../lib/notifications';

// Shared helpers
import {
  SectionHeader,
  SettingRow,
  LockedSettingRow,
  SettingsUpgradeCTA,
  settingsStyles,
} from '../components/settings/SettingsHelpers';

// Profile Zone Components
import { AppearanceSection } from '../components/profile/AppearanceSection';

export default function CustomizeScreen() {
  const { colors, glass } = useTheme();

  const {
    isPremium,
    trialActive,
    sentenceRecap, setSentenceRecap,
    hapticFeedback, setHapticFeedback,
    soundEffects, setSoundEffects,
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
    reduceMotion, setReduceMotion,
    dailyWordGoal, setDailyWordGoal,
    sleepTimerMinutes, setSleepTimerMinutes,
    windDownReminderEnabled, setWindDownReminderEnabled,
    windDownReminderHour, windDownReminderMinute, setWindDownReminderTime,
  } = useSettingsStore(useShallow((s) => ({
    isPremium: s.isPremium,
    trialActive: s.trialActive,
    sentenceRecap: s.sentenceRecap, setSentenceRecap: s.setSentenceRecap,
    hapticFeedback: s.hapticFeedback, setHapticFeedback: s.setHapticFeedback,
    soundEffects: s.soundEffects, setSoundEffects: s.setSoundEffects,
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
    reduceMotion: s.reduceMotion, setReduceMotion: s.setReduceMotion,
    dailyWordGoal: s.dailyWordGoal, setDailyWordGoal: s.setDailyWordGoal,
    sleepTimerMinutes: s.sleepTimerMinutes, setSleepTimerMinutes: s.setSleepTimerMinutes,
    windDownReminderEnabled: s.windDownReminderEnabled, setWindDownReminderEnabled: s.setWindDownReminderEnabled,
    windDownReminderHour: s.windDownReminderHour, windDownReminderMinute: s.windDownReminderMinute, setWindDownReminderTime: s.setWindDownReminderTime,
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

  // Option arrays
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Upgrade CTA for free users */}
        {!isPremium && !trialActive && (
          <SettingsUpgradeCTA onPress={() => setPaywallContext('settings_upgrade')} />
        )}

        <AppearanceSection
          reduceMotion={reduceMotion}
          peekAndShowPaywall={peekAndShowPaywall}
          handleLockedPress={handleLockedPress}
        />

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
              <View style={[settingsStyles.separator, { backgroundColor: glass.border }]} />
              <View style={settingsStyles.settingBlock}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Sleep Timer
                </Text>
                <View style={settingsStyles.segmentedControlWrapper}>
                  <GlassSegmentedControl
                    options={sleepTimerOptions}
                    selectedIndex={sleepTimerIndex >= 0 ? sleepTimerIndex : 2}
                    onSelect={(i) => setSleepTimerMinutes(sleepTimerValues[i])}
                  />
                </View>
              </View>
              <View style={[settingsStyles.separator, { backgroundColor: glass.border }]} />
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
          <View style={[settingsStyles.separator, { backgroundColor: glass.border }]} />
          <View style={settingsStyles.settingBlock}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>
              Words at a Time
            </Text>
            <View style={settingsStyles.segmentedControlWrapper}>
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
          <View style={[settingsStyles.separator, { backgroundColor: glass.border }]} />
          <SettingRow label="Sentence Recap">
            <GlassToggle
              value={sentenceRecap}
              onValueChange={setSentenceRecap}
            />
          </SettingRow>
          <SettingRow label="Haptic Feedback">
            <GlassToggle
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
            />
          </SettingRow>
          <SettingRow label="Tap Sound" noBorder>
            <GlassToggle
              value={soundEffects}
              onValueChange={setSoundEffects}
            />
          </SettingRow>
        </GlassCard>

        {/* Audio */}
        <SectionHeader title="Audio" icon="volume-2" />
        <GlassCard>
          <View style={settingsStyles.settingBlock}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>
              Voice
            </Text>
            <View style={settingsStyles.segmentedControlWrapper}>
              <GlassSegmentedControl
                options={voiceLabels}
                selectedIndex={voiceIndex}
                onSelect={(i) => setVoiceGender(voiceGenders[i])}
              />
            </View>
          </View>
          <View style={[settingsStyles.separator, { backgroundColor: glass.border }]} />
          {isPremium || trialActive ? (
            <View style={settingsStyles.settingBlock}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                TTS Speed
              </Text>
              <View style={settingsStyles.segmentedControlWrapper}>
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
          <View style={[settingsStyles.separator, { backgroundColor: glass.border }]} />
          <LockedSettingRow label="Auto-Play" isPremium={isPremium || trialActive} noBorder={(!isPremium && !trialActive) || !autoPlay} onLockedPress={() => handleLockedPress('locked_autoplay')}>
            <GlassToggle
              value={autoPlay}
              onValueChange={handleSetAutoPlay}
            />
          </LockedSettingRow>
          {(isPremium || trialActive) && autoPlay && (
            <>
              <View style={[settingsStyles.separator, { backgroundColor: glass.border }]} />
              <View style={settingsStyles.settingBlock}>
                <View style={settingsStyles.sliderHeader}>
                  <Text style={[styles.settingLabel, { color: colors.primary }]}>
                    Auto-Play Speed
                  </Text>
                  <Text style={[settingsStyles.sliderValue, { color: colors.muted }]}>
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

        {/* Daily Goal */}
        <SectionHeader title="Daily Goal" icon="crosshair" />
        <GlassCard>
          <View style={settingsStyles.settingBlock}>
            <View style={settingsStyles.sliderHeader}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Words per Day
              </Text>
              <Text style={[settingsStyles.sliderValue, { color: colors.muted }]}>
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

        {/* Advanced */}
        <SectionHeader title="Advanced" icon="tool" />
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
  settingLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
});
