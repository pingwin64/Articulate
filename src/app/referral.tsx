import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { Spacing, Radius } from '../design/theme';

type TabType = 'refer' | 'past';

export default function ReferralScreen() {
  const { colors, glass, isDark } = useTheme();
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);

  const [activeTab, setActiveTab] = useState<TabType>('refer');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Placeholder - would be user-specific from backend
  const userName = 'You';
  const referralCode = 'USER123';
  const referralLink = `https://articulate.app/r?${referralCode}`;
  const pastInvites: { email: string; status: 'pending' | 'completed'; date: string }[] = [];

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    if (hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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

  const handleSendInvite = async () => {
    if (!email.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setSending(true);
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Simulate sending (would connect to backend)
    setTimeout(() => {
      setSending(false);
      setEmail('');
      Alert.alert('Invite Sent', `We sent an invitation to ${email.trim()}`);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Refer and earn rewards
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Give a month of Pro and get <Text style={{ fontWeight: '600' }}>1 month</Text> for each person you refer.
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { borderColor: glass.border }]}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'refer' && [styles.tabActive, { borderColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('refer')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'refer' ? colors.primary : colors.muted },
              ]}
            >
              Refer
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'past' && [styles.tabActive, { borderColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('past')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'past' ? colors.primary : colors.muted },
              ]}
            >
              Past invites ({pastInvites.length})
            </Text>
          </Pressable>
        </View>

        {activeTab === 'refer' ? (
          <Animated.View entering={FadeIn.duration(300)}>
            {/* Promo Card */}
            <View style={styles.promoCardContainer}>
              <LinearGradient
                colors={isDark ? ['#1a4d3a', '#0d3327'] : ['#2d6a4f', '#1b4332']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoCard}
              >
                {/* Decorative wave */}
                <View style={styles.waveContainer}>
                  <View style={[styles.wave, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)' }]} />
                </View>

                {/* Logo and Pro badge */}
                <View style={styles.promoContent}>
                  <View style={styles.logoBadgeRow}>
                    <View style={styles.logoContainer}>
                      <View style={styles.logoBar} />
                      <View style={[styles.logoBar, styles.logoBarShort]} />
                      <View style={styles.logoBar} />
                    </View>
                    <Text style={styles.logoText}>Articulate</Text>
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>Pro</Text>
                    </View>
                  </View>

                  <Text style={styles.promoSubtext}>UNLIMITED WORDS FOR 1 MONTH</Text>

                  <View style={styles.giftedByBadge}>
                    <Text style={styles.giftedByText}>Gifted by {userName}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* How it works */}
            <View style={styles.howItWorks}>
              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                How it works
              </Text>

              <View style={styles.stepRow}>
                <Feather name="send" size={16} color={colors.secondary} />
                <Text style={[styles.stepText, { color: colors.primary }]}>
                  Share your invite link
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Feather name="award" size={16} color={colors.secondary} />
                <Text style={[styles.stepText, { color: colors.primary }]}>
                  They sign up and get a <Text style={{ fontWeight: '600' }}>free month of Pro!</Text>
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Feather name="gift" size={16} color={colors.secondary} />
                <Text style={[styles.stepText, { color: colors.primary }]}>
                  You get <Text style={{ fontWeight: '600' }}>a free month</Text> when they read 2,000 words!
                </Text>
              </View>
            </View>

            {/* Invite Link */}
            <View style={styles.inviteLinkSection}>
              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                Your invite link
              </Text>

              <View style={styles.linkRow}>
                <View
                  style={[
                    styles.linkInputContainer,
                    { backgroundColor: glass.fill, borderColor: glass.border },
                  ]}
                >
                  <Feather name="link" size={16} color={colors.muted} />
                  <Text
                    style={[styles.linkText, { color: colors.primary }]}
                    numberOfLines={1}
                  >
                    {referralLink}
                  </Text>
                </View>
                <Pressable
                  onPress={handleCopyLink}
                  style={[
                    styles.copyButton,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                  ]}
                >
                  <Text style={[styles.copyButtonText, { color: colors.primary }]}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Send Invites */}
            <View style={styles.sendInvitesSection}>
              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                Send invites
              </Text>

              <View style={styles.emailRow}>
                <TextInput
                  style={[
                    styles.emailInput,
                    {
                      backgroundColor: glass.fill,
                      borderColor: glass.border,
                      color: colors.primary,
                    },
                  ]}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={handleSendInvite}
                  disabled={sending || !email.trim()}
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: email.trim() ? colors.primary : colors.muted,
                      opacity: sending ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.sendButtonText, { color: isDark ? colors.bg : '#FFFFFF' }]}>
                    {sending ? 'Sending...' : 'Send'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Share Button */}
            <Pressable
              onPress={handleShare}
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
            >
              <Feather name="share" size={18} color={isDark ? colors.bg : '#FFFFFF'} />
              <Text style={[styles.shareButtonText, { color: isDark ? colors.bg : '#FFFFFF' }]}>
                Share Invite Link
              </Text>
            </Pressable>

            {/* Footer */}
            <Text style={[styles.footer, { color: colors.muted }]}>
              Rewards auto-applied to the next subscription payment.
            </Text>
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Referral Terms',
                  '• Your friend gets 1 free month of Articulate Pro when they sign up with your link.\n\n• You earn 1 free month when they read at least 2,000 words within 30 days.\n\n• Rewards are applied as credit to your next billing cycle.\n\n• There is no limit to how many friends you can refer.\n\n• Offer may be modified or discontinued at any time.',
                  [{ text: 'Got it', style: 'default' }]
                );
              }}
              style={styles.termsLink}
            >
              <Text style={[styles.termsLinkText, { color: colors.secondary }]}>
                See referral terms
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.pastInvitesContainer}>
            {pastInvites.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="users" size={48} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.secondary }]}>
                  No invites yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  Share your link with friends to start earning free months!
                </Text>
              </View>
            ) : (
              pastInvites.map((invite, index) => (
                <View
                  key={index}
                  style={[
                    styles.inviteRow,
                    { borderBottomColor: glass.border },
                  ]}
                >
                  <View style={styles.inviteInfo}>
                    <Text style={[styles.inviteEmail, { color: colors.primary }]}>
                      {invite.email}
                    </Text>
                    <Text style={[styles.inviteDate, { color: colors.muted }]}>
                      {invite.date}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          invite.status === 'completed'
                            ? isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.1)'
                            : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: invite.status === 'completed' ? colors.success : colors.muted },
                      ]}
                    >
                      {invite.status === 'completed' ? 'Earned' : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderBottomWidth: 0.5,
  },
  tab: {
    paddingBottom: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  promoCardContainer: {
    marginBottom: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  },
  promoCard: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    minHeight: 180,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: 20,
    left: -50,
    right: -50,
    height: 100,
    borderRadius: 100,
    transform: [{ rotate: '-5deg' }],
  },
  promoContent: {
    alignItems: 'center',
    gap: 12,
  },
  logoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 24,
  },
  logoBar: {
    width: 4,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  logoBarShort: {
    height: 14,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 4,
  },
  proBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b4332',
    letterSpacing: 0.3,
  },
  promoSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  giftedByBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    marginTop: 12,
  },
  giftedByText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1b4332',
  },
  howItWorks: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
  },
  inviteLinkSection: {
    marginBottom: Spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  linkText: {
    fontSize: 14,
    flex: 1,
  },
  copyButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sendInvitesSection: {
    marginBottom: Spacing.lg,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emailInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    fontSize: 15,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: Spacing.md,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
  },
  termsLink: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  termsLinkText: {
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  pastInvitesContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  inviteInfo: {
    flex: 1,
    gap: 2,
  },
  inviteEmail: {
    fontSize: 15,
    fontWeight: '500',
  },
  inviteDate: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
