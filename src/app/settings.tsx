import React, { useCallback } from 'react';
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
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from '../components/GlassCard';
import { GlassToggle } from '../components/GlassToggle';
import { Paywall } from '../components/Paywall';
import { Spacing } from '../design/theme';
import type { PaywallContext } from '../lib/store/settings';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  requestNotificationPermissions,
  scheduleStreakReminder,
  cancelAllReminders,
} from '../lib/notifications';
import { restorePurchases } from '../lib/purchases';

// Shared helpers
import { SectionHeader, SettingRow } from '../components/settings/SettingsHelpers';

// Profile Zone Components
import { HeroProfileSection } from '../components/profile/HeroProfileSection';
import { StatsDashboard } from '../components/profile/StatsDashboard';
import { AchievementShowcase } from '../components/profile/AchievementShowcase';
import { QuickActionCards } from '../components/profile/QuickActionCards';
import { ReadingHistorySection } from '../components/profile/ReadingHistorySection';
import { TopCategoriesSection } from '../components/profile/TopCategoriesSection';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, glass } = useTheme();
  const router = useRouter();

  const {
    isPremium,
    trialActive,
    profileImage, setProfileImage,
    profileColor, setProfileColor,
    hapticFeedback,
    showPaywall,
    setPaywallContext,
    paywallContext,
    currentStreak,
    notificationsEnabled, setNotificationsEnabled,
    reminderHour, reminderMinute, setReminderTime,
    reduceMotion,
    resetAll,
  } = useSettingsStore(useShallow((s) => ({
    isPremium: s.isPremium,
    trialActive: s.trialActive,
    profileImage: s.profileImage, setProfileImage: s.setProfileImage,
    profileColor: s.profileColor, setProfileColor: s.setProfileColor,
    hapticFeedback: s.hapticFeedback,
    showPaywall: s.showPaywall,
    setPaywallContext: s.setPaywallContext,
    paywallContext: s.paywallContext,
    currentStreak: s.currentStreak,
    notificationsEnabled: s.notificationsEnabled, setNotificationsEnabled: s.setNotificationsEnabled,
    reminderHour: s.reminderHour, reminderMinute: s.reminderMinute, setReminderTime: s.setReminderTime,
    reduceMotion: s.reduceMotion,
    resetAll: s.resetAll,
  })));

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
            PROFILE ZONE
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

        <TopCategoriesSection reduceMotion={reduceMotion} />

        {/* ═══════════════════════════════════════════════════════════════════
            SETTINGS
            ═══════════════════════════════════════════════════════════════════ */}

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
