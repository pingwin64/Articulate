import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Spacing } from '../design/theme';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={16}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Privacy Policy
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: colors.muted }]}>
          Last updated: February 2026
        </Text>

        <Section title="Overview">
          <Paragraph colors={colors}>
            Articulate is committed to protecting your privacy. This policy explains how we handle your information when you use our app.
          </Paragraph>
        </Section>

        <Section title="Local Data">
          <Paragraph colors={colors}>
            Articulate stores your reading preferences, statistics, progress, and settings locally on your device using secure on-device storage (MMKV). This includes your reading level, display preferences, streak data, daily goals, and reading history.
          </Paragraph>
          <Paragraph colors={colors}>
            Articulate does not require an account or login. No user-identifying information is collected.
          </Paragraph>
        </Section>

        <Section title="Cloud Processing">
          <Paragraph colors={colors}>
            Certain features send data to cloud services for processing. This data is processed in real-time and is not stored on any server:
          </Paragraph>
          <Paragraph colors={colors}>
            {'\u2022'} Text extraction (OCR, PDF parsing): When you scan text from an image or import a PDF, the image or file data is sent to Supabase-hosted edge functions for processing via OpenAI's API. The extracted text is returned to your device and not retained server-side.
          </Paragraph>
          <Paragraph colors={colors}>
            {'\u2022'} Quiz generation: When you take a comprehension quiz, the reading text is sent to Supabase-hosted edge functions, which use OpenAI as a third-party AI provider to generate quiz questions. The questions are returned to your device and not stored.
          </Paragraph>
          <Paragraph colors={colors}>
            Transmitted text is processed and discarded — it is not stored, logged, or used for model training.
          </Paragraph>
        </Section>

        <Section title="Third-Party Services">
          <Paragraph colors={colors}>
            Articulate uses the following third-party services:
          </Paragraph>
          <Paragraph colors={colors}>
            {'\u2022'} OpenAI: Provides AI-powered text extraction and quiz generation. Data sent to OpenAI is subject to OpenAI's API data usage policies.
          </Paragraph>
          <Paragraph colors={colors}>
            {'\u2022'} RevenueCat: Manages subscription and purchase processing. RevenueCat receives an anonymous app user ID and purchase transaction data from Apple. RevenueCat does not receive your name, email, or other personal information from Articulate.
          </Paragraph>
          <Paragraph colors={colors}>
            {'\u2022'} Apple App Store: Handles all payment processing. We do not collect, store, or have access to your payment information.
          </Paragraph>
        </Section>

        <Section title="Subscriptions & Payments">
          <Paragraph colors={colors}>
            Articulate offers optional in-app purchases and subscriptions processed through Apple's App Store. Payment processing is handled entirely by Apple. We do not collect, store, or have access to your payment information.
          </Paragraph>
          <Paragraph colors={colors}>
            Subscription management, including cancellation and refunds, is handled through your App Store account settings.
          </Paragraph>
        </Section>

        <Section title="Children's Privacy">
          <Paragraph colors={colors}>
            Articulate does not knowingly collect information from children under 13. The app is designed to be safe for users of all ages.
          </Paragraph>
        </Section>

        <Section title="Your Rights (GDPR)">
          <Paragraph colors={colors}>
            If you are in the European Economic Area, you have the right to access, rectify, and erase your personal data. Since all persistent data is stored locally on your device, you have full control over it at all times.
          </Paragraph>
          <Paragraph colors={colors}>
            You can delete all app data by using the "Reset All Data" option in Settings, or by uninstalling Articulate. No personal data is stored on external servers.
          </Paragraph>
        </Section>

        <Section title="California Privacy Rights (CCPA)">
          <Paragraph colors={colors}>
            If you are a California resident, please note that we do not sell, share, or disclose your personal information to third parties for monetary or other valuable consideration.
          </Paragraph>
        </Section>

        <Section title="Changes to This Policy">
          <Paragraph colors={colors}>
            We may update this privacy policy from time to time. Any changes will be reflected in the app with an updated revision date.
          </Paragraph>
        </Section>

        <Section title="Contact">
          <Paragraph colors={colors}>
            If you have questions about this privacy policy, please contact us at admin@ordco.net.
          </Paragraph>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Paragraph({ children, colors }: { children: React.ReactNode; colors: { secondary: string } }) {
  return (
    <Text style={[styles.paragraph, { color: colors.secondary }]}>
      {children}
    </Text>
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
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
});
