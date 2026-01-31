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

export default function TermsOfServiceScreen() {
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
          Terms of Service
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
          Last updated: January 2026
        </Text>

        <Section title="Acceptance of Terms">
          <Paragraph colors={colors}>
            By downloading, installing, or using Articulate ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
          </Paragraph>
        </Section>

        <Section title="Service Description">
          <Paragraph colors={colors}>
            Articulate is a reading practice application that displays text one word at a time, designed to improve reading focus, fluency, and comprehension. The App may include free and premium features.
          </Paragraph>
        </Section>

        <Section title="Subscriptions & Payments">
          <Paragraph colors={colors}>
            Articulate offers optional auto-renewing subscriptions and one-time purchases to unlock premium features. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period.
          </Paragraph>
          <Paragraph colors={colors}>
            Payment is charged to your Apple ID account at confirmation of purchase. Your account will be charged for renewal within 24 hours prior to the end of the current period at the same price.
          </Paragraph>
          <Paragraph colors={colors}>
            You can manage and cancel your subscriptions by going to your App Store account settings after purchase. Any unused portion of a free trial period will be forfeited when you purchase a subscription.
          </Paragraph>
        </Section>

        <Section title="Free Trial">
          <Paragraph colors={colors}>
            Articulate may offer a free trial period for premium features. If you do not cancel before the trial ends, your subscription will begin and you will be charged the applicable subscription fee.
          </Paragraph>
        </Section>

        <Section title="User Content">
          <Paragraph colors={colors}>
            You may paste or import text into the App for personal reading practice. You are solely responsible for ensuring you have the right to use any content you add to the App. All user-added content is stored locally on your device.
          </Paragraph>
        </Section>

        <Section title="Intellectual Property">
          <Paragraph colors={colors}>
            The App, including its design, code, and built-in reading content, is the intellectual property of the developer. You may not copy, modify, distribute, or reverse-engineer any part of the App.
          </Paragraph>
          <Paragraph colors={colors}>
            Built-in reading passages are sourced from works in the public domain. Original short texts included in the App are copyright of the developer.
          </Paragraph>
        </Section>

        <Section title="Third-Party Services">
          <Paragraph colors={colors}>
            Certain features may use third-party services (such as OpenAI for quiz generation). Your use of these features is subject to the respective third-party terms. You are responsible for any API keys you provide and any associated costs.
          </Paragraph>
        </Section>

        <Section title="Disclaimer of Warranties">
          <Paragraph colors={colors}>
            The App is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the App will be error-free or uninterrupted.
          </Paragraph>
        </Section>

        <Section title="Limitation of Liability">
          <Paragraph colors={colors}>
            To the maximum extent permitted by law, the developer shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.
          </Paragraph>
        </Section>

        <Section title="Changes to Terms">
          <Paragraph colors={colors}>
            We may update these Terms of Service from time to time. Continued use of the App after changes constitutes acceptance of the updated terms. We will update the revision date at the top of this page.
          </Paragraph>
        </Section>

        <Section title="Contact">
          <Paragraph colors={colors}>
            If you have questions about these Terms of Service, please contact us through the App Store.
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
