import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { achievements } from '../lib/data/achievements';
import { AchievementBadge } from '../components/AchievementBadge';
import { GlassCard } from '../components/GlassCard';
import { Spacing } from '../design/theme';

const CATEGORY_LABELS: Record<string, string> = {
  reading: 'Reading',
  speed: 'Speed',
  comprehension: 'Comprehension',
  streak: 'Streak',
  exploration: 'Exploration',
};

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { unlockedAchievements } = useSettingsStore();

  const categories = ['reading', 'speed', 'comprehension', 'streak', 'exploration'];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Achievements
          </Text>
          <View style={styles.headerButton} />
        </View>

        {/* Summary */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.summary}>
          <Text style={[styles.summaryText, { color: colors.secondary }]}>
            {unlockedAchievements.length} of {achievements.length} unlocked
          </Text>
        </Animated.View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((category) => {
            const categoryAchievements = achievements.filter(
              (a) => a.category === category
            );
            return (
              <View key={category} style={styles.categorySection}>
                <Text style={[styles.sectionHeader, { color: colors.secondary }]}>
                  {CATEGORY_LABELS[category]}
                </Text>
                <GlassCard>
                  <View style={styles.badgeGrid}>
                    {categoryAchievements.map((achievement, i) => (
                      <Animated.View
                        key={achievement.id}
                        entering={FadeIn.delay(i * 50).duration(300)}
                        style={styles.badgeCell}
                      >
                        <AchievementBadge
                          achievement={achievement}
                          unlocked={unlockedAchievements.includes(achievement.id)}
                          size="large"
                        />
                      </Animated.View>
                    ))}
                  </View>
                </GlassCard>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  summary: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '400',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  categorySection: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingLeft: 4,
    marginTop: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  badgeCell: {
    width: '28%',
    alignItems: 'center',
  },
});
