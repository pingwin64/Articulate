import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { StreakDisplay } from '../StreakDisplay';
import { DailyGoalRing } from '../DailyGoalRing';
import { Spacing } from '../../design/theme';

export function HomeHeader() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentStreak, dailyGoalSet } = useSettingsStore();

  return (
    <View style={styles.homeHeader}>
      {/* Left side: daily goal */}
      <View style={styles.leftSection}>
        {dailyGoalSet && <DailyGoalRing size={52} />}
      </View>

      {/* Right side: streak + settings */}
      <View style={styles.headerIcons}>
        {currentStreak > 0 && <StreakDisplay compact />}
        <Pressable onPress={() => router.push('/settings')} style={styles.headerButton}>
          <Feather name="settings" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
