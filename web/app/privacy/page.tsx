import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Articulate',
  description:
    'Articulate is committed to protecting your privacy. Learn how we handle your information.',
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="Last updated: February 2026">
      <section>
        <h2 className="text-xl font-semibold mb-3">Overview</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          Articulate is committed to protecting your privacy. This policy
          explains how we handle your information when you use our app.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Local Data</h2>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          Articulate stores your reading preferences, statistics, progress, and
          settings locally on your device using secure on-device storage (MMKV).
          This includes your reading level, display preferences, streak data,
          daily goals, and reading history.
        </p>
        <p className="text-[var(--secondary)] leading-relaxed">
          Articulate does not require an account or login. No user-identifying
          information is collected.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Cloud Processing</h2>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          Certain features send data to cloud services for processing. This data
          is processed in real-time and is not stored on any server:
        </p>
        <ul className="space-y-2 text-[var(--secondary)] leading-relaxed list-disc pl-5">
          <li>
            <strong className="text-[var(--primary)]">
              Text extraction (OCR, PDF parsing):
            </strong>{' '}
            When you scan text from an image or import a PDF, the image or file
            data is sent to Supabase-hosted edge functions for processing via
            OpenAI&apos;s API. The extracted text is returned to your device and
            not retained server-side.
          </li>
          <li>
            <strong className="text-[var(--primary)]">Quiz generation:</strong>{' '}
            When you take a comprehension quiz, the reading text is sent to
            Supabase-hosted edge functions, which use OpenAI as a third-party AI
            provider to generate quiz questions. The questions are returned to
            your device and not stored.
          </li>
          <li>
            <strong className="text-[var(--primary)]">
              Audio transcription:
            </strong>{' '}
            When you use the pronunciation practice feature, your recorded audio
            is sent to OpenAI&apos;s Whisper API for transcription. The audio is
            processed and discarded immediately.
          </li>
        </ul>
        <p className="text-[var(--secondary)] leading-relaxed mt-3">
          Transmitted data is processed and discarded — it is not stored,
          logged, or used for model training.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          Articulate uses the following third-party services:
        </p>
        <ul className="space-y-2 text-[var(--secondary)] leading-relaxed list-disc pl-5">
          <li>
            <strong className="text-[var(--primary)]">OpenAI:</strong> Provides
            AI-powered text extraction, quiz generation, and audio
            transcription. Data sent to OpenAI is subject to OpenAI&apos;s API
            data usage policies.
          </li>
          <li>
            <strong className="text-[var(--primary)]">RevenueCat:</strong>{' '}
            Manages subscription and purchase processing. RevenueCat receives an
            anonymous app user ID and purchase transaction data from Apple.
            RevenueCat does not receive your name, email, or other personal
            information from Articulate.
          </li>
          <li>
            <strong className="text-[var(--primary)]">Apple App Store:</strong>{' '}
            Handles all payment processing. We do not collect, store, or have
            access to your payment information.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Subscriptions &amp; Payments
        </h2>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          Articulate offers optional in-app purchases and subscriptions
          processed through Apple&apos;s App Store. Payment processing is
          handled entirely by Apple. We do not collect, store, or have access to
          your payment information.
        </p>
        <p className="text-[var(--secondary)] leading-relaxed">
          Subscription management, including cancellation and refunds, is
          handled through your App Store account settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Children&apos;s Privacy
        </h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          Articulate does not knowingly collect information from children under
          13. The app is designed to be safe for users of all ages.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your Rights (GDPR)</h2>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          If you are in the European Economic Area, you have the right to
          access, rectify, and erase your personal data. Since all persistent
          data is stored locally on your device, you have full control over it
          at all times.
        </p>
        <p className="text-[var(--secondary)] leading-relaxed">
          You can delete all app data by using the &ldquo;Reset All Data&rdquo;
          option in Settings, or by uninstalling Articulate. No personal data is
          stored on external servers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          California Privacy Rights (CCPA)
        </h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          If you are a California resident, please note that we do not sell,
          share, or disclose your personal information to third parties for
          monetary or other valuable consideration.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Changes to This Policy
        </h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          We may update this privacy policy from time to time. Any changes will
          be reflected in the app and on this page with an updated revision
          date.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          If you have questions about this privacy policy, please contact us at{' '}
          <a
            href="mailto:admin@ordco.net"
            className="text-[var(--primary)] underline underline-offset-2"
          >
            admin@ordco.net
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
