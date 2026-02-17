'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReferralDashboard, { type WaitlistData } from './ReferralDashboard';

/* ─── Types ─── */

interface WaitlistFormProps {
  showPill?: boolean;
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
