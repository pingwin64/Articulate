import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore, getCurrentLevel } from '../../lib/store/settings';
import { GlassCard } from '../GlassCard';
import { GlassToggle } from '../GlassToggle';
import { GlassSegmentedControl } from '../GlassSegmentedControl';
import { GlassSlider } from '../GlassSlider';
import { FontPicker } from '../FontPicker';
import { WordPreview } from '../WordPreview';
import {
  BackgroundThemes,
  WordColors,
  WordSizeRange,
} from '../../design/theme';
import { ALL_BADGES } from '../../lib/data/badges';
import type { FontFamilyKey, WordColorKey } from '../../design/theme';
import type { PaywallContext } from '../../lib/store/settings';

interface AppearanceSectionProps {
  reduceMotion: boolean;
  peekAndShowPaywall: (
    context: PaywallContext,
    previewFn?: () => void,
    revertFn?: () => void,
  ) => void;
  handleLockedPress: (ctx: PaywallContext) => void;
}

export function AppearanceSection({
  reduceMotion,
  peekAndShowPaywall,
  handleLockedPress,
}: AppearanceSectionProps) {
  const { colors, glass, isDark } = useTheme();

  const isPremium = useSettingsStore((s) => s.isPremium);
  const trialActive = useSettingsStore((s) => s.trialActive);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const backgroundTheme = useSettingsStore((s) => s.backgroundTheme);
  const setBackgroundTheme = useSettingsStore((s) => s.setBackgroundTheme);
  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const setFontFamily = useSettingsStore((s) => s.setFontFamily);
  const wordSize = useSettingsStore((s) => s.wordSize);
  const setWordSize = useSettingsStore((s) => s.setWordSize);
  const wordBold = useSettingsStore((s) => s.wordBold);
  const setWordBold = useSettingsStore((s) => s.setWordBold);
  const wordColor = useSettingsStore((s) => s.wordColor);
  const setWordColor = useSettingsStore((s) => s.setWordColor);
  const unlockedRewards = useSettingsStore((s) => s.unlockedRewards);
  const addTrialFeatureUsed = useSettingsStore((s) => s.addTrialFeatureUsed);
  const levelProgress = useSettingsStore((s) => s.levelProgress);
  const currentLevel = getCurrentLevel(levelProgress);

  const canAccess = isPremium || trialActive;

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

  const themeModes = ['Light', 'Dark', 'System'];
  const themeIndex = themeMode === 'dark' ? 1 : themeMode === 'system' ? 2 : 0;

  const entering = reduceMotion ? undefined : FadeIn.delay(400).duration(400);

  return (
    <Animated.View entering={entering}>
      <View style={styles.headerRow}>
        <Feather name="eye" size={14} color={colors.secondary} />
        <Text style={[styles.headerText, { color: colors.secondary }]}>
          APPEARANCE
        </Text>
      </View>
      <GlassCard>
        {/* Theme Mode */}
        <View style={styles.settingBlock}>
          <Text style={[styles.settingLabel, { color: colors.primary }]}>
            Theme
          </Text>
          <View style={styles.segmentedControlWrapper}>
            <GlassSegmentedControl
              options={themeModes}
              selectedIndex={themeIndex}
              onSelect={(i) => {
                const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
                setThemeMode(modes[i]);
              }}
            />
          </View>
        </View>
        <View style={[styles.separator, { backgroundColor: glass.border }]} />

        {/* Live Word Preview */}
        <View style={styles.wordPreviewContainer}>
          <WordPreview />
        </View>
        <View style={[styles.separator, { backgroundColor: glass.border }]} />

        {/* Font picker - Pro only */}
        {canAccess ? (
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
          <LockedSettingRow label="Font" onLockedPress={() => {
            const origFont = fontFamily;
            peekAndShowPaywall(
              'locked_font',
              () => setFontFamily('literata'),
              () => setFontFamily(origFont),
            );
          }} />
        )}

        <View style={[styles.separator, { backgroundColor: glass.border }]} />

        {/* Size slider - Pro only */}
        {canAccess ? (
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
          <LockedSettingRow label="Size" onLockedPress={() => {
            const origSize = wordSize;
            peekAndShowPaywall(
              'locked_size',
              () => setWordSize(56),
              () => setWordSize(origSize),
            );
          }} />
        )}

        <View style={[styles.separator, { backgroundColor: glass.border }]} />

        {/* Bold toggle - Pro only */}
        {canAccess ? (
          <View style={[styles.settingRowInline]}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>
              Bold
            </Text>
            <GlassToggle
              value={wordBold}
              onValueChange={handleSetWordBold}
            />
          </View>
        ) : (
          <LockedSettingRow label="Bold" onLockedPress={() => {
            const origBold = wordBold;
            peekAndShowPaywall(
              'locked_bold',
              () => setWordBold(true),
              () => setWordBold(origBold),
            );
          }} />
        )}

        {/* Color picker - Pro only */}
        {canAccess ? (
          <View style={styles.settingBlock}>
            <Text style={[styles.settingLabel, { color: colors.primary }]}>
              Color
            </Text>
            <View style={styles.colorRowBlock}>
              {WordColors.map((wc) => {
                const circleColor = wc.color ?? colors.primary;
                const isSelected = wordColor === wc.key;
                const isRewardColor = 'rewardId' in wc && !!wc.rewardId;
                const isRewardUnlocked = isRewardColor ? unlockedRewards.includes((wc as { rewardId: string }).rewardId) : true;
                const isLevelLockedColor = 'minLevel' in wc && !!wc.minLevel && currentLevel < (wc as { minLevel: number }).minLevel && !canAccess;
                const isColorLocked = (isRewardColor && !isRewardUnlocked) || isLevelLockedColor;
                return (
                  <Pressable
                    key={wc.key}
                    onPress={() => {
                      if (isLevelLockedColor) {
                        Alert.alert(
                          `${wc.label} Color`,
                          `Reach Level ${(wc as { minLevel: number }).minLevel} to unlock this color!`,
                          [{ text: 'OK' }]
                        );
                      } else if (isRewardColor && !isRewardUnlocked) {
                        const rewardBadge = ALL_BADGES.find((b) => b.reward?.id === (wc as { rewardId: string }).rewardId);
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
                        borderColor: isSelected ? colors.primary : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                        opacity: isColorLocked ? 0.4 : 1,
                      },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[styles.colorInner, { borderColor: colors.bg }]}
                      />
                    )}
                    {isColorLocked && (
                      <View style={[styles.swatchLockOverlay, isRewardColor && !isRewardUnlocked && styles.swatchRewardLock, { bottom: -4, right: -4 }]}>
                        <Feather name={isLevelLockedColor ? 'trending-up' : 'award'} size={8} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <LockedSettingRow label="Color" noBorder onLockedPress={() => {
            const origColor = wordColor;
            peekAndShowPaywall(
              'locked_color',
              () => setWordColor('ocean'),
              () => setWordColor(origColor),
            );
          }} />
        )}
        <View style={[styles.separator, { backgroundColor: glass.border }]} />

        {/* Background swatches */}
        <View style={styles.settingRowNoBorder}>
          <Text style={[styles.settingLabel, { color: colors.primary }]}>
            Background
          </Text>
          <View style={styles.swatchRow}>
            {BackgroundThemes.map((theme) => {
              const bgColor = theme.light;
              const isSelected = backgroundTheme === theme.key;
              const isRewardTheme = !!theme.rewardId;
              const isRewardUnlocked = theme.rewardId ? unlockedRewards.includes(theme.rewardId) : false;
              const canProAccess = isRewardTheme && theme.proAccessible && canAccess;
              const isPremiumLocked = theme.premium === true && !canAccess;
              const isRewardLocked = isRewardTheme && !isRewardUnlocked && !canProAccess;
              const isLevelLocked = !!theme.minLevel && currentLevel < theme.minLevel && !canAccess;
              const isLocked = isPremiumLocked || isRewardLocked || isLevelLocked;
              return (
                <Pressable
                  key={theme.key}
                  onPress={() => {
                    if (isLevelLocked) {
                      Alert.alert(
                        `${theme.label} Theme`,
                        `Reach Level ${theme.minLevel} to unlock this theme!`,
                        [{ text: 'OK' }]
                      );
                    } else if (isRewardLocked) {
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
                          borderColor: isSelected ? colors.primary : glass.border,
                          borderWidth: isSelected ? 2 : 0.5,
                        },
                      ]}
                    />
                    {isLocked && (
                      <View style={[styles.swatchLockOverlay, isRewardLocked && styles.swatchRewardLock]}>
                        <Feather name={isRewardLocked ? 'award' : isLevelLocked ? 'trending-up' : 'lock'} size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

// Internal helper component for locked setting rows
function LockedSettingRow({
  label,
  noBorder = false,
  onLockedPress,
}: {
  label: string;
  noBorder?: boolean;
  onLockedPress: () => void;
}) {
  const { colors, glass, isDark } = useTheme();

  return (
    <Pressable onPress={onLockedPress}>
      <View style={[noBorder ? styles.settingRowNoBorder : styles.settingRowInline, { borderBottomColor: glass.border }]}>
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

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  settingBlock: {
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  settingRowInline: {
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
  separator: {
    height: 0.5,
  },
  segmentedControlWrapper: {
    marginTop: 8,
  },
  wordPreviewContainer: {
    paddingVertical: 8,
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
  colorRowBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
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
});
