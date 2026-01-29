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
          Last updated: January 2025
        </Text>

        <Section title="Overview">
          <Paragraph colors={colors}>
            Articulate is committed to protecting your privacy. This policy explains how we handle your information when you use our app.
          </Paragraph>
        </Section>

        <Section title="Information We Collect">
          <Paragraph colors={colors}>
            Articulate stores your reading preferences, statistics, and settings locally on your device. This includes your reading level, display preferences, and progress data.
          </Paragraph>
          <Paragraph colors={colors}>
            We do not collect, transmit, or store any personal information on external servers. All your data stays on your device.
          </Paragraph>
        </Section>

        <Section title="Data Storage">
          <Paragraph colors={colors}>
            All app data is stored locally using secure on-device storage. Your reading history, settings, and preferences are never uploaded to any server.
          </Paragraph>
        </Section>

        <Section title="Third-Party Services">
          <Paragraph colors={colors}>
            Articulate may use third-party services for app functionality such as text-to-speech. These services process data locally on your device and do not collect personal information.
          </Paragraph>
        </Section>

        <Section title="Analytics">
          <Paragraph colors={colors}>
            We may collect anonymous, aggregated usage statistics to improve the app experience. This data cannot be used to identify you personally.
          </Paragraph>
        </Section>

        <Section title="Children's Privacy">
          <Paragraph colors={colors}>
            Articulate does not knowingly collect information from children under 13. The app is designed to be safe for users of all ages.
          </Paragraph>
        </Section>

        <Section title="Changes to This Policy">
          <Paragraph colors={colors}>
            We may update this privacy policy from time to time. Any changes will be reflected in the app with an updated revision date.
          </Paragraph>
        </Section>

        <Section title="Contact">
          <Paragraph colors={colors}>
            If you have questions about this privacy policy, please contact us through the App Store.
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
