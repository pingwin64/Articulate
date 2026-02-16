'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/* ─── Types ─── */

interface WaitlistFormProps {
  showPill?: boolean;
}

interface WaitlistData {
  referral_code: string;
  position: number;
  referral_count: number;
}

const TIERS = [
  { count: 3, label: 'Early access' },
  { count: 5, label: 'Founding member badge' },
  { count: 10, label: '20% lifetime discount' },
  { count: 25, label: 'Free lifetime access' },
];

const SITE_URL = 'https://articulateapp.vercel.app';

/* ─── Referral Dashboard (post-submit) ─── */

function ReferralDashboard({ data }: { data: WaitlistData }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${SITE_URL}?ref=${data.referral_code}`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tweetText = encodeURIComponent(
    `I just joined the waitlist for @m4lph — an app that helps you read deeper, one word at a time. Join me: ${referralLink}`
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      {/* Confirmation */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] flex items-center justify-center text-[var(--primary)]">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
          </svg>
        </div>
        <p className="text-[20px] font-semibold">
          You&apos;re #{data.position} on the waitlist
        </p>
        <p className="text-[14px] text-[var(--muted)] text-center">
          Refer friends to move up and unlock rewards.
        </p>
      </div>

      {/* Referral link */}
      <div className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-fill)] p-3 flex items-center gap-2">
        <span className="flex-1 text-[13px] text-[var(--secondary)] truncate select-all">
          {referralLink}
        </span>
        <button
          onClick={copyLink}
          className="shrink-0 h-8 px-3 rounded-lg bg-[var(--primary)] text-[var(--bg)] text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Share on X */}
      <a
        href={`https://x.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-fill)] text-[14px] font-medium text-[var(--primary)] hover:border-[var(--primary)] transition-colors no-underline"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>

      {/* Referral count */}
      <p className="text-[14px] text-[var(--secondary)]">
        <span className="font-semibold text-[var(--primary)]">{data.referral_count}</span>
        {' '}referral{data.referral_count === 1 ? '' : 's'} so far
      </p>

      {/* Reward tiers */}
      <div className="w-full flex flex-col gap-2">
        {TIERS.map((tier) => {
          const unlocked = data.referral_count >= tier.count;
          return (
            <div
              key={tier.count}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[13px] transition-colors ${
                unlocked
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--muted)]'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                {unlocked ? (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                  </svg>
                ) : (
                  <span className="text-[12px] font-medium">{tier.count}</span>
                )}
              </span>
              <span className={unlocked ? 'font-medium' : ''}>{tier.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Form (inner, uses useSearchParams) ─── */

function WaitlistFormInner({ showPill = true }: WaitlistFormProps) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<WaitlistData | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const email = new FormData(form).get('email') as string;

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...(ref ? { ref } : {}) }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      setData({
        referral_code: json.referral_code,
        position: json.position ?? 0,
        referral_count: json.referral_count ?? 0,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
      setSubmitting(false);
    }
  }

  if (submitted && data) {
    return <ReferralDashboard data={data} />;
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {showPill && (
        <span className="inline-flex items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] px-4 py-1.5 text-[13px] text-[var(--secondary)]">
          Join 100+ early readers
        </span>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className="w-full sm:flex-1 h-12 px-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--primary)] text-[15px] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)] transition-colors"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[var(--primary)] text-[var(--bg)] text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap cursor-pointer"
        >
          {submitting ? 'Joining...' : 'Join the Waitlist'}
        </button>
      </form>
      {error && (
        <p className="text-[13px] text-red-500">{error}</p>
      )}
    </div>
  );
}

/* ─── Exported wrapper with Suspense ─── */

export default function WaitlistForm(props: WaitlistFormProps) {
  return (
    <Suspense>
      <WaitlistFormInner {...props} />
    </Suspense>
  );
}
