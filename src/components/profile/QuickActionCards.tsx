import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { GlassCard } from '../GlassCard';
import type { PaywallContext } from '../../lib/store/settings';

interface QuickActionCardsProps {
  reduceMotion: boolean;
  onPaywall: (ctx: PaywallContext) => void;
}

export function QuickActionCards({ reduceMotion, onPaywall }: QuickActionCardsProps) {
  const { colors, glass, isDark } = useTheme();
  const router = useRouter();
  const isPremium = useSettingsStore((s) => s.isPremium);

  const entering = reduceMotion ? undefined : FadeIn.delay(240).duration(400);

  return (
    <Animated.View entering={entering} style={styles.container}>
      {/* Achievements Card */}
      <Pressable onPress={() => router.push('/achievements')}>
        <GlassCard>
          <View style={styles.row}>
            <View style={styles.left}>
              <Feather name="award" size={20} color={colors.primary} />
              <View style={styles.text}>
                <Text style={[styles.title, { color: colors.primary }]}>
                  Achievements
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  View your badges and progress
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </View>
        </GlassCard>
      </Pressable>

      {/* My Library Card */}
      <Pressable onPress={() => {
        if (isPremium) {
          router.push('/library');
        } else {
          onPaywall('locked_library');
        }
      }}>
        <GlassCard>
          <View style={styles.row}>
            <View style={styles.left}>
              <Feather name="book" size={20} color={colors.primary} />
              <View style={styles.text}>
                <Text style={[styles.title, { color: colors.primary }]}>
                  My Library
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  {isPremium ? 'Favorites, texts & saved words' : 'Your personal collection'}
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

      {/* Get a Free Month - Referral */}
      <Pressable onPress={() => router.push('/referral')}>
        <GlassCard>
          <View style={styles.row}>
            <View style={styles.left}>
              <Feather name="gift" size={20} color={colors.primary} />
              <View style={styles.text}>
                <Text style={[styles.title, { color: colors.primary }]}>
                  Get a free month
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  Refer friends and earn rewards
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
});
