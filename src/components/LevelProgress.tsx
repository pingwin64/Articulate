import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassCard } from './GlassCard';

// Level titles (more evocative than tier names)
const LEVEL_TITLES: Record<number, string> = {
  1: 'Wanderer',
  2: 'Seeker',
  3: 'Reader',
  4: 'Scholar',
  5: 'Adept',
  6: 'Explorer',
  7: 'Sage',
  8: 'Luminary',
  9: 'Virtuoso',
  10: 'Master',
  11: 'Grandmaster',
  12: 'Archon',
  13: 'Ascendant',
  14: 'Paragon',
  15: 'Transcendent',
};

// Roman numerals for level display
const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
};

function toRomanNumeral(num: number): string {
  if (num <= 15) return ROMAN_NUMERALS[num] ?? String(num);
  // For levels beyond 15, use XV+ format
  return `XV+${num - 15}`;
}

function getLevelTitle(level: number): string {
  if (level > 15) return `Legendary ${level - 15}`;
  return LEVEL_TITLES[level] ?? `Level ${level}`;
}

export function LevelProgress() {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();

  const readingLevel = useSettingsStore((s) => s.readingLevel);
  const textsCompletedAtLevel = useSettingsStore((s) => s.textsCompletedAtLevel);

  const textsRequired = 8;
  const progressPercent = Math.min(100, (textsCompletedAtLevel / textsRequired) * 100);
  const textsRemaining = Math.max(0, textsRequired - textsCompletedAtLevel);

  const levelTitle = getLevelTitle(readingLevel);
  const nextLevelTitle = getLevelTitle(readingLevel + 1);

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
              {toRomanNumeral(readingLevel)}
            </Text>
          </View>

          {/* Progress info */}
          <View style={styles.progressInfo}>
            <View style={styles.levelHeader}>
              <Text style={[styles.levelTitle, { color: colors.primary }]}>
                Level {readingLevel} · {levelTitle}
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
              {textsRemaining > 0
                ? `${textsRemaining} ${textsRemaining === 1 ? 'text' : 'texts'} to ${nextLevelTitle}`
                : 'Complete quizzes to level up'}
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
    fontSize: 20,
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
