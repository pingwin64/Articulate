import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import {
  getCurrentLevel,
  getLevelName,
  getProgressToNextLevel,
  getWordsToNextLevel,
  LEVEL_NAMES,
} from '../lib/store/settings';
import { GlassCard } from './GlassCard';

export function LevelProgress() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();

  const levelProgress = useSettingsStore((s) => s.levelProgress);

  const currentLevel = getCurrentLevel(levelProgress);
  const levelName = getLevelName(levelProgress);
  const progressPercent = getProgressToNextLevel(levelProgress);
  const wordsToNext = getWordsToNextLevel(levelProgress);
  const isMaster = currentLevel >= 5;

  // Next level name for display
  const nextLevelName = currentLevel < 5 ? LEVEL_NAMES[currentLevel] : null;

  return (
    <Animated.View entering={FadeIn.delay(50).duration(400)}>
      <GlassCard onPress={() => router.push('/achievements')}>
        <View style={styles.container}>
          {/* Level badge */}
          <View
            style={[
              styles.levelBadge,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                borderColor: glass.border,
              },
            ]}
          >
            <Text style={[styles.levelNumber, { color: colors.primary }]}>
              {currentLevel}
            </Text>
          </View>

          {/* Progress info */}
          <View style={styles.progressInfo}>
            <View style={styles.levelHeader}>
              <Text style={[styles.levelTitle, { color: colors.primary }]}>
                {levelName}
              </Text>
              <Feather name="chevron-right" size={16} color={colors.muted} />
            </View>

            {/* Progress bar */}
            <View
              style={[
                styles.progressBar,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${progressPercent}%`,
                  },
                ]}
              />
            </View>

            {/* Progress text */}
            <Text style={[styles.progressText, { color: colors.muted }]}>
              {isMaster
                ? 'Mastery Achieved'
                : `${wordsToNext.toLocaleString()} words to ${nextLevelName}`}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  progressInfo: {
    flex: 1,
    gap: 6,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '400',
  },
});
