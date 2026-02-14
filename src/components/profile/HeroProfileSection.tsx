import React, { useState, useRef, useMemo } from 'react';
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
import { Radius } from '../../design/theme';

interface HeroProfileSectionProps {
  onEditProfile: () => void;
  reduceMotion: boolean;
}

export function HeroProfileSection({ onEditProfile, reduceMotion }: HeroProfileSectionProps) {
  const { colors, glass, isDark } = useTheme();

  const profileImage = useSettingsStore((s) => s.profileImage);
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
  const nameBeforeEdit = useRef(displayName);

  // Accent color derived from theme primary — always matches the background theme
  const accent = colors.primary;

  const initials = useMemo(() => {
    if (!displayName) return null;
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }, [displayName]);

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

  const handleNameCancel = () => {
    setNameInput(nameBeforeEdit.current ?? '');
    setIsEditing(false);
  };

  const handleNameTap = () => {
    nameBeforeEdit.current = displayName;
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
          <View style={[styles.orb, { backgroundColor: accent + '15', borderColor: glass.border }]}>
            {initials ? (
              <Text style={[styles.initialsText, { color: accent }]}>{initials}</Text>
            ) : (
              <Feather name="user" size={40} color={accent} />
            )}
          </View>
        )}
        <View style={[styles.editBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)', borderColor: glass.border }]}>
          <Feather name="edit-2" size={14} color={colors.primary} />
        </View>
      </Pressable>

      {/* Display Name */}
      <View style={styles.nameRow}>
        {isEditing ? (
          <View style={styles.nameEditRow}>
            <Pressable onPress={handleNameCancel} hitSlop={12} style={styles.nameAction}>
              <Feather name="x" size={16} color={colors.muted} />
            </Pressable>
            <TextInput
              ref={inputRef}
              value={nameInput}
              onChangeText={(text) => setNameInput(text.slice(0, 24))}
              onSubmitEditing={handleNameSubmit}
              returnKeyType="done"
              maxLength={24}
              placeholder="Your name"
              placeholderTextColor={colors.muted + '80'}
              style={[styles.nameInput, { color: colors.primary }]}
              autoFocus
            />
            <Pressable onPress={handleNameSubmit} hitSlop={12} style={styles.nameAction}>
              <Feather name="check" size={16} color={colors.primary} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={handleNameTap} style={styles.nameTapTarget}>
            {displayName ? (
              <>
                <Text style={[styles.displayName, { color: colors.primary }]}>
                  {displayName}
                </Text>
                <Feather name="edit-2" size={13} color={colors.muted} style={{ marginLeft: 6 }} />
              </>
            ) : (
              <View style={[styles.addNamePill, { borderColor: colors.muted + '40' }]}>
                <Feather name="plus" size={14} color={colors.muted} />
                <Text style={[styles.addNameText, { color: colors.muted }]}>Add your name</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

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
  initialsText: {
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1,
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
  nameRow: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  nameTapTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 8,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    textAlign: 'center',
    minWidth: 120,
    paddingVertical: 4,
  },
  addNamePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addNameText: {
    fontSize: 15,
    fontWeight: '500',
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
