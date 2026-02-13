import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../lib/store/settings';
import { getLevelName } from '../../lib/store/settings';
import { Spacing, Radius } from '../../design/theme';

interface HeroProfileSectionProps {
  onEditProfile: () => void;
  reduceMotion: boolean;
}

export function HeroProfileSection({ onEditProfile, reduceMotion }: HeroProfileSectionProps) {
  const { colors, glass, isDark } = useTheme();

  const profileImage = useSettingsStore((s) => s.profileImage);
  const profileColor = useSettingsStore((s) => s.profileColor);
  const displayName = useSettingsStore((s) => s.displayName);
  const setDisplayName = useSettingsStore((s) => s.setDisplayName);
  const levelProgress = useSettingsStore((s) => s.levelProgress);
  const totalWordsRead = useSettingsStore((s) => s.totalWordsRead);
  const currentStreak = useSettingsStore((s) => s.currentStreak);
  const isPremium = useSettingsStore((s) => s.isPremium);
  const trialActive = useSettingsStore((s) => s.trialActive);
  const trialDaysRemaining = useSettingsStore((s) => s.trialDaysRemaining);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(displayName ?? '');
  const inputRef = useRef<TextInput>(null);

  const readingLevelLabel = getLevelName(levelProgress);

  const formatNumber = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

  const membershipLabel = isPremium ? 'PRO'
    : trialActive ? `TRIAL \u00B7 ${trialDaysRemaining()} days left` : 'FREE';

  const membershipBadgeBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  const membershipBadgeColor = isPremium ? colors.primary : colors.secondary;

  const handleNameSubmit = () => {
    const trimmed = nameInput.trim();
    setDisplayName(trimmed.length > 0 ? trimmed : null);
    setIsEditing(false);
  };

  const handleNameTap = () => {
    setNameInput(displayName ?? '');
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const entering = reduceMotion ? undefined : FadeIn.duration(400);

  return (
    <Animated.View entering={entering} style={styles.container}>
      {/* Avatar */}
      <Pressable onPress={onEditProfile} style={styles.orbContainer}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={[styles.orb, { borderColor: glass.border }]}
          />
        ) : (
          <View style={[styles.orb, { backgroundColor: profileColor + '20', borderColor: glass.border }]}>
            <Feather name="user" size={40} color={profileColor} />
          </View>
        )}
        <View style={[styles.editBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)', borderColor: glass.border }]}>
          <Feather name="edit-2" size={14} color={colors.primary} />
        </View>
      </Pressable>

      {/* Display Name */}
      {isEditing ? (
        <TextInput
          ref={inputRef}
          value={nameInput}
          onChangeText={(text) => setNameInput(text.slice(0, 24))}
          onSubmitEditing={handleNameSubmit}
          onBlur={handleNameSubmit}
          returnKeyType="done"
          maxLength={24}
          placeholder="Add your name"
          placeholderTextColor={colors.muted}
          style={[styles.nameInput, { color: colors.primary, borderBottomColor: colors.primary }]}
          autoFocus
        />
      ) : (
        <Pressable onPress={handleNameTap}>
          <Text style={[
            styles.displayName,
            { color: displayName ? colors.primary : colors.muted },
          ]}>
            {displayName ?? 'Add your name'}
          </Text>
        </Pressable>
      )}

      {/* Reading Level */}
      <Text style={[styles.levelLabel, { color: colors.primary }]}>
        {readingLevelLabel}
      </Text>

      {/* Stats Line */}
      <Text style={[styles.statsLine, { color: colors.muted }]}>
        {formatNumber(totalWordsRead)} words read{currentStreak > 0 ? ` \u00B7 ${currentStreak} day streak` : ''}
      </Text>

      {/* Membership Badge */}
      {!isPremium ? (
        <View
          style={[styles.membershipBadge, { backgroundColor: membershipBadgeBg, borderColor: membershipBadgeColor + '40' }]}
        >
          <Text style={[styles.membershipText, { color: membershipBadgeColor }]}>
            {membershipLabel}
          </Text>
        </View>
      ) : (
        <View style={[styles.proBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
          <Feather name="award" size={12} color={colors.primary} />
          <Text style={[styles.proBadgeText, { color: colors.primary }]}>PRO</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  orbContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 16,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 16,
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: 4,
    minWidth: 120,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 4,
  },
  statsLine: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: 8,
  },
  membershipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginTop: 8,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
