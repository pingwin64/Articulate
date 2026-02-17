'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReferralDashboard, { type WaitlistData } from '@/components/ReferralDashboard';

export default function StatusPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState<WaitlistData | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotFound(false);

    const email = new FormData(e.currentTarget).get('email') as string;

    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(json.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      setData({
        referral_code: json.referral_code,
        position: json.position ?? 0,
        referral_count: json.referral_count ?? 0,
      });
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          {!data ? (
            <>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-[28px] font-semibold tracking-tight">
                  Check your status
                </h1>
                <p className="text-[15px] text-[var(--muted)]">
                  Enter the email you signed up with.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 w-full"
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your email address"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--primary)] text-[15px] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-[var(--primary)] text-[var(--bg)] text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Checking...' : 'Check Status'}
                </button>
              </form>

              {error && (
                <p className="text-[13px] text-red-500">{error}</p>
              )}

              {notFound && (
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-[14px] text-[var(--muted)]">
                    That email isn&apos;t on the waitlist yet.
                  </p>
                  <Link
                    href="/"
                    className="text-[14px] text-[var(--primary)] underline hover:opacity-80 transition-opacity"
                  >
                    Join the waitlist
                  </Link>
                </div>
              )}
            </>
          ) : (
            <ReferralDashboard data={data} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
