import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { Spacing } from '../../design/theme';
import type { FeatherIconName } from '../../types/icons';

// ─── Section Header ─────────────────────────────────────────────────────────

export function SectionHeader({ title, icon }: { title: string; icon?: FeatherIconName }) {
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

// ─── Setting Row ────────────────────────────────────────────────────────────

export function SettingRow({
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

// ─── Locked Setting Row ─────────────────────────────────────────────────────

export function LockedSettingRow({
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
      // Default fallback — shouldn't normally be reached
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

// ─── Upgrade CTA Card ───────────────────────────────────────────────────────

export function SettingsUpgradeCTA({ onPress }: { onPress: () => void }) {
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

// ─── Styles ─────────────────────────────────────────────────────────────────

export const settingsStyles = StyleSheet.create({
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
});

const styles = StyleSheet.create({
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
});
