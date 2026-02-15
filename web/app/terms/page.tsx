import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — Articulate',
  description:
    'Terms of Service for the Articulate reading app.',
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="Last updated: January 2026">
      <section>
        <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          By downloading, installing, or using Articulate (&ldquo;the
          App&rdquo;), you agree to be bound by these Terms of Service. If you
          do not agree to these terms, please do not use the App.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Service Description</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          Articulate is a reading practice application that displays text one
          word at a time, designed to improve reading focus, fluency, and
          comprehension. The App may include free and premium features.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Subscriptions &amp; Payments
        </h2>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          Articulate offers optional auto-renewing subscriptions and one-time
          purchases to unlock premium features. Subscriptions automatically
          renew unless cancelled at least 24 hours before the end of the current
          billing period.
        </p>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          Payment is charged to your Apple ID account at confirmation of
          purchase. Your account will be charged for renewal within 24 hours
          prior to the end of the current period at the same price.
        </p>
        <p className="text-[var(--secondary)] leading-relaxed">
          You can manage and cancel your subscriptions by going to your App
          Store account settings after purchase. Any unused portion of a free
          trial period will be forfeited when you purchase a subscription.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Free Trial</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          Articulate may offer a free trial period for premium features. If you
          do not cancel before the trial ends, your subscription will begin and
          you will be charged the applicable subscription fee.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">User Content</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          You may paste or import text into the App for personal reading
          practice. You are solely responsible for ensuring you have the right
          to use any content you add to the App. All user-added content is
          stored locally on your device.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
        <p className="text-[var(--secondary)] leading-relaxed mb-3">
          The App, including its design, code, and built-in reading content, is
          the intellectual property of the developer. You may not copy, modify,
          distribute, or reverse-engineer any part of the App.
        </p>
        <p className="text-[var(--secondary)] leading-relaxed">
          Built-in reading passages are sourced from works in the public domain.
          Original short texts included in the App are copyright of the
          developer.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          Certain features use cloud processing (quiz generation, text
          extraction) powered by third-party services. Your use of these
          features is subject to our{' '}
          <a
            href="/privacy"
            className="text-[var(--primary)] underline underline-offset-2"
          >
            Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Disclaimer of Warranties
        </h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          The App is provided &ldquo;as is&rdquo; without warranties of any
          kind, either express or implied. We do not guarantee that the App will
          be error-free or uninterrupted.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Limitation of Liability
        </h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          To the maximum extent permitted by law, the developer shall not be
          liable for any indirect, incidental, special, or consequential damages
          arising from your use of the App.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          We may update these Terms of Service from time to time. Continued use
          of the App after changes constitutes acceptance of the updated terms.
          We will update the revision date at the top of this page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        <p className="text-[var(--secondary)] leading-relaxed">
          If you have questions about these Terms of Service, please contact us
          at{' '}
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
