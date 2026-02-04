import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
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
import type { TTSSpeed, PaywallContext, VoiceGender } from '../lib/store/settings';
import { getTierName } from '../lib/store/settings';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  requestNotificationPermissions,
  scheduleStreakReminder,
  cancelAllReminders,
} from '../lib/notifications';
import { restorePurchases } from '../lib/purchases';
import { ALL_BADGES } from '../lib/data/badges';

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

function ReferralCard() {
  const { colors, glass, isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const referralLink = 'https://articulate.app/invite/ABC123'; // Placeholder - will be user-specific

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Try Articulate - the minimalist reading app! Use my invite link to get a free month of Pro: ${referralLink}`,
        url: referralLink,
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <GlassCard>
      <View style={styles.referralContent}>
        <View style={styles.referralHeader}>
          <View style={[styles.referralIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
            <Feather name="gift" size={20} color={colors.primary} />
          </View>
          <View style={styles.referralText}>
            <Text style={[styles.referralTitle, { color: colors.primary }]}>
              Refer and earn rewards
            </Text>
            <Text style={[styles.referralSubtitle, { color: colors.muted }]}>
              Give a month of Pro, get a month free
            </Text>
          </View>
        </View>

        <View style={styles.referralActions}>
          <Pressable
            onPress={handleCopyLink}
            style={[
              styles.referralLinkButton,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: glass.border },
            ]}
          >
            <Text style={[styles.referralLinkText, { color: colors.secondary }]} numberOfLines={1}>
              {referralLink}
            </Text>
            <Feather name={copied ? 'check' : 'copy'} size={16} color={copied ? colors.success ?? colors.primary : colors.muted} />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={[styles.shareButton, { backgroundColor: colors.primary }]}
          >
            <Feather name="share" size={16} color={isDark ? colors.bg : '#FFFFFF'} />
            <Text style={[styles.shareButtonText, { color: isDark ? colors.bg : '#FFFFFF' }]}>
              Invite Friends
            </Text>
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}

function SettingsUpgradeCTA({ onPress }: { onPress: () => void }) {
  const { colors, glass, isDark } = useTheme();
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
    voiceGender, setVoiceGender,
    autoPlay, setAutoPlay,
    autoPlayWPM, setAutoPlayWPM,
    chunkSize, setChunkSize,
    showPaywall,
    setPaywallContext,
    paywallContext,
    addTrialFeatureUsed,
    totalWordsRead,
    currentStreak,
    readingHistory,
    unlockedRewards,
    trialDaysRemaining,
    notificationsEnabled, setNotificationsEnabled,
    reminderHour, reminderMinute, setReminderTime,
    reduceMotion, setReduceMotion,
    dailyWordGoal, setDailyWordGoal,
    resetAll,
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
    voiceGender: s.voiceGender, setVoiceGender: s.setVoiceGender,
    autoPlay: s.autoPlay, setAutoPlay: s.setAutoPlay,
    autoPlayWPM: s.autoPlayWPM, setAutoPlayWPM: s.setAutoPlayWPM,
    chunkSize: s.chunkSize, setChunkSize: s.setChunkSize,
    showPaywall: s.showPaywall,
    setPaywallContext: s.setPaywallContext,
    paywallContext: s.paywallContext,
    addTrialFeatureUsed: s.addTrialFeatureUsed,
    totalWordsRead: s.totalWordsRead,
    currentStreak: s.currentStreak,
    readingHistory: s.readingHistory,
    unlockedRewards: s.unlockedRewards,
    trialDaysRemaining: s.trialDaysRemaining,
    notificationsEnabled: s.notificationsEnabled, setNotificationsEnabled: s.setNotificationsEnabled,
    reminderHour: s.reminderHour, reminderMinute: s.reminderMinute, setReminderTime: s.setReminderTime,
    reduceMotion: s.reduceMotion, setReduceMotion: s.setReduceMotion,
    dailyWordGoal: s.dailyWordGoal, setDailyWordGoal: s.setDailyWordGoal,
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

  const reminderTimeLabel = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;

  const readingLevelLabel = getTierName(readingLevel);

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

  const themeModes = ['Light', 'Dark', 'System'];
  const themeIndex = themeMode === 'dark' ? 1 : themeMode === 'system' ? 2 : 0;

  const textsCompletedAtLevel = useSettingsStore((s) => s.textsCompletedAtLevel);
  const textsToNextLevel = Math.max(0, 8 - textsCompletedAtLevel);

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
              <View
                style={[styles.upgradeBadge, { backgroundColor: membershipBadgeBg, borderColor: membershipBadgeColor + '40' }]}
              >
                <Text style={[styles.membershipBadgeText, { color: membershipBadgeColor }]}>
                  {membershipLabel}
                </Text>
              </View>
            ) : (
              <View style={[styles.proBadgeTop, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
                <Feather name="award" size={12} color={colors.primary} />
                <Text style={[styles.proBadgeTopText, { color: colors.primary }]}>PRO</Text>
              </View>
            )}
          </View>

          {/* Upgrade CTA for free users */}
          {!isPremium && !trialActive && (
            <SettingsUpgradeCTA onPress={() => setPaywallContext('settings_upgrade')} />
          )}

          {/* Achievements Card */}
          <Pressable onPress={() => router.push('/achievements')}>
            <GlassCard>
              <View style={styles.achievementsRow}>
                <View style={styles.achievementsLeft}>
                  <Feather name="award" size={20} color={colors.primary} />
                  <View style={styles.achievementsText}>
                    <Text style={[styles.achievementsTitle, { color: colors.primary }]}>
                      Achievements
                    </Text>
                    <Text style={[styles.achievementsSubtitle, { color: colors.muted }]}>
                      View your badges and progress
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </View>
            </GlassCard>
          </Pressable>

          {/* Word Bank Card */}
          <Pressable onPress={() => {
            router.push({ pathname: '/library', params: { tab: 'words' } });
          }}>
            <GlassCard>
              <View style={styles.achievementsRow}>
                <View style={styles.achievementsLeft}>
                  <Feather name="bookmark" size={20} color={colors.primary} />
                  <View style={styles.achievementsText}>
                    <Text style={[styles.achievementsTitle, { color: colors.primary }]}>
                      Word Bank
                    </Text>
                    <Text style={[styles.achievementsSubtitle, { color: colors.muted }]}>
                      {isPremium ? 'Your saved vocabulary' : 'Save words while reading'}
                    </Text>
                  </View>
                </View>
                {isPremium ? (
                  <Feather name="chevron-right" size={18} color={colors.muted} />
                ) : (
                  <Feather name="lock" size={16} color={colors.muted} />
                )}
              </View>
            </GlassCard>
          </Pressable>

          {/* Reading History */}
          {readingHistory.length > 0 && (
            <>
              <SectionHeader title="Reading History" icon="clock" />
              <GlassCard>
                {readingHistory.slice(0, 5).map((entry, index) => {
                  const date = new Date(entry.completedAt);
                  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  const isLast = index === Math.min(readingHistory.length, 5) - 1;
                  return (
                    <View
                      key={entry.id}
                      style={[
                        styles.historyRow,
                        !isLast && { borderBottomWidth: 0.5, borderBottomColor: glass.border },
                      ]}
                    >
                      <View style={styles.historyInfo}>
                        <Text style={[styles.historyTitle, { color: colors.primary }]} numberOfLines={1}>
                          {entry.title}
                        </Text>
                        <Text style={[styles.historyMeta, { color: colors.muted }]}>
                          {entry.wordsRead} words · {entry.wpm} WPM · {dateStr}
                        </Text>
                      </View>
                      <Feather name="check-circle" size={16} color={colors.success} />
                    </View>
                  );
                })}
                {readingHistory.length > 5 && (
                  <Text style={[styles.historyMore, { color: colors.secondary }]}>
                    +{readingHistory.length - 5} more completed
                  </Text>
                )}
              </GlassCard>
            </>
          )}

          {/* Referral Program — hidden until referral system is live
          <ReferralCard />
          */}

          {/* Section 1: Appearance */}
          <SectionHeader title="Appearance" icon="eye" />
          <GlassCard>
            {/* Live Word Preview - shows font and color */}
            <View style={styles.wordPreviewContainer}>
              <WordPreview />
            </View>
            <View style={[styles.separator, { backgroundColor: glass.border }]} />

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

            {/* Color picker - Pro only (with reward colors visible to all) */}
            {isPremium || trialActive ? (
              <View style={styles.settingBlock}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Color
                </Text>
                <View style={styles.colorRowBlock}>
                  {WordColors.map((wc) => {
                    const circleColor = wc.color ?? colors.primary;
                    const isSelected = wordColor === wc.key;
                    const isRewardColor = 'rewardId' in wc && !!wc.rewardId;
                    const isRewardUnlocked = isRewardColor ? unlockedRewards.includes((wc as any).rewardId) : true;
                    return (
                      <Pressable
                        key={wc.key}
                        onPress={() => {
                          if (isRewardColor && !isRewardUnlocked) {
                            const rewardBadge = ALL_BADGES.find((b) => b.reward?.id === (wc as any).rewardId);
                            const badgeName = rewardBadge?.name ?? 'a special';
                            Alert.alert(
                              `${wc.label} Color`,
                              `Unlock this color by earning the ${badgeName} badge!`,
                              [{ text: 'OK' }]
                            );
                          } else {
                            handleSetWordColor(wc.key as WordColorKey);
                          }
                        }}
                        style={[
                          styles.colorCircle,
                          {
                            backgroundColor: circleColor,
                            borderColor: isSelected
                              ? colors.primary
                              : 'transparent',
                            borderWidth: isSelected ? 2 : 0,
                            opacity: isRewardColor && !isRewardUnlocked ? 0.4 : 1,
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
                        {isRewardColor && !isRewardUnlocked && (
                          <View style={[styles.swatchLockOverlay, styles.swatchRewardLock, { bottom: -4, right: -4 }]}>
                            <Feather name="award" size={8} color="#FFFFFF" />
                          </View>
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
            <View style={[styles.separator, { backgroundColor: glass.border }]} />

            {/* Background swatches — visible to all users */}
            <View style={styles.settingRowNoBorder}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Background
              </Text>
              <View style={styles.swatchRow}>
                {BackgroundThemes.map((theme) => {
                  const bgColor = isDark ? theme.dark : theme.light;
                  const isSelected = backgroundTheme === theme.key;
                  const isDefault = theme.key === 'default';
                  // Check if this is a reward theme
                  const isRewardTheme = !!theme.rewardId;
                  const isRewardUnlocked = theme.rewardId ? unlockedRewards.includes(theme.rewardId) : false;
                  // Hybrid model: Pro users can access proAccessible reward themes
                  const canProAccess = isRewardTheme && theme.proAccessible && (isPremium || trialActive);
                  // Premium themes (paper/stone/sepia) use explicit flag
                  const isPremiumLocked = theme.premium === true && !isPremium && !trialActive;
                  const isRewardLocked = isRewardTheme && !isRewardUnlocked && !canProAccess;
                  const isLocked = isPremiumLocked || isRewardLocked;
                  return (
                    <Pressable
                      key={theme.key}
                      onPress={() => {
                        if (isRewardLocked) {
                          // Show hint about how to unlock via badge name lookup
                          const rewardBadge = ALL_BADGES.find((b) => b.reward?.id === theme.rewardId);
                          const badgeName = rewardBadge?.name ?? 'a special';
                          Alert.alert(
                            `${theme.label} Theme`,
                            `Unlock this theme by earning the ${badgeName} badge!`,
                            [{ text: 'OK' }]
                          );
                        } else if (isPremiumLocked) {
                          const origBg = backgroundTheme;
                          peekAndShowPaywall(
                            'locked_background',
                            () => setBackgroundTheme(theme.key),
                            () => setBackgroundTheme(origBg),
                          );
                        } else {
                          handleSetBackgroundTheme(theme.key);
                        }
                      }}
                    >
                      <View style={styles.swatchContainer}>
                        <View
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
                        {isLocked && (
                          <View style={[styles.swatchLockOverlay, isRewardLocked && styles.swatchRewardLock]}>
                            <Feather name={isRewardLocked ? 'award' : 'lock'} size={10} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
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
              <View style={styles.sliderHeader}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>
                  Reading Level
                </Text>
                <Text style={[styles.sliderValue, { color: colors.muted }]}>
                  Level {readingLevel} — {readingLevelLabel}
                </Text>
              </View>
              <GlassSlider
                value={readingLevel}
                minimumValue={1}
                maximumValue={15}
                step={1}
                onValueChange={(v: number) => setReadingLevel(v)}
                leftLabel="1"
                rightLabel="15"
              />
              <Text style={{ fontSize: 12, fontWeight: '400', textAlign: 'center', marginTop: 4, color: colors.muted }}>
                {textsToNextLevel > 0 ? `${textsCompletedAtLevel}/8 texts to next level` : 'Level up available!'}
              </Text>
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
            {/* Voice Gender - available to all users */}
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

          {/* Section 6: Daily Goal */}
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

          {/* Section 7: About */}
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

          {/* Section 8: Help */}
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
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Rate Articulate
              </Text>
              <Feather name="star" size={18} color={colors.muted} />
            </Pressable>
            <Pressable
              onPress={() => {
                Linking.openURL('mailto:support@articulate.app?subject=Articulate%20Support');
              }}
              style={styles.settingRowNoBorder}
            >
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Contact Support
              </Text>
              <Feather name="mail" size={18} color={colors.muted} />
            </Pressable>
          </GlassCard>

          {/* Section 9: Data */}
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
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  swatchContainer: {
    position: 'relative',
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderCurve: 'continuous',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  swatchLockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRewardLock: {
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
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
  colorRowBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  wordPreviewContainer: {
    paddingVertical: 8,
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
  // Upgrade CTA card
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
  // Achievements card
  achievementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementsText: {
    gap: 2,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  // Reading history
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  historyInfo: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  historyMeta: {
    fontSize: 12,
    fontWeight: '400',
  },
  historyMore: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 8,
  },
  // Referral card
  referralContent: {
    gap: 16,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralText: {
    flex: 1,
    gap: 2,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  referralSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  referralActions: {
    gap: 10,
  },
  referralLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  referralLinkText: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
