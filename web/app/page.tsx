import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LogoMark from '@/components/LogoMark';
import WordDemo from '@/components/WordDemo';
import FadeIn from '@/components/FadeIn';
import Section from '@/components/Section';

const FEATURES = [
  {
    title: 'One-Word Focus',
    desc: 'Eliminate distractions. Read with intention.',
  },
  {
    title: 'AI Quizzes',
    desc: 'Comprehension tests generated after every reading.',
  },
  {
    title: 'Pronunciation',
    desc: 'Speak words aloud, get instant AI feedback.',
  },
  {
    title: 'Word Bank',
    desc: 'Save and review words with spaced-repetition.',
  },
  {
    title: 'Daily Streaks',
    desc: 'Build a reading habit with progress tracking.',
  },
  {
    title: 'Accessibility',
    desc: '5 fonts including OpenDyslexic for every reader.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Choose a text',
    desc: 'Pick from 30+ curated texts or paste your own.',
  },
  {
    num: '02',
    title: 'Read word by word',
    desc: 'One word at a time, at your own pace.',
  },
  {
    num: '03',
    title: 'Test yourself',
    desc: 'AI quizzes, pronunciation practice, flashcards.',
  },
];

const AUDIENCES = [
  {
    title: 'Focus Seekers',
    desc: 'ADHD brains that need one thing at a time.',
  },
  {
    title: 'Language Learners',
    desc: 'Pronunciation practice, vocabulary building.',
  },
  {
    title: 'Students',
    desc: 'Study smarter with comprehension quizzes.',
  },
  {
    title: 'Minimalists',
    desc: 'No accounts, no tracking, no ads.',
  },
];

function AppStoreBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href="https://apps.apple.com/app/articulate-one-word-reader/id6740211626"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block hover:opacity-80 transition-opacity ${className}`}
      aria-label="Download on the App Store"
    >
      <img
        src="/app-store-badge.svg"
        alt="Download on the App Store"
        width={180}
        height={60}
      />
    </a>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="min-h-svh flex flex-col items-center justify-center px-6 pt-14 relative">
          <FadeIn className="flex flex-col items-center text-center">
            <LogoMark className="w-8 h-7 text-[var(--primary)] mb-4" />
            <p className="text-sm tracking-widest uppercase text-[var(--muted)] mb-12">
              articulate
            </p>
            <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-4">
              Read one word
              <br />
              at a time.
            </h1>
            <p className="text-lg sm:text-xl text-[var(--secondary)] mb-12">
              Understand everything.
            </p>
          </FadeIn>

          <FadeIn delay={300} className="mb-12">
            <WordDemo />
          </FadeIn>

          <FadeIn delay={500}>
            <AppStoreBadge />
          </FadeIn>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-px h-8 bg-[var(--stroke)] animate-pulse" />
          </div>
        </section>

        {/* How It Works */}
        <Section className="bg-[var(--surface)]">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-bold tracking-tight text-center mb-16">
              How it works
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px bg-[var(--stroke)]" />
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 150} className="text-center relative">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[var(--stroke)] bg-[var(--bg)] text-sm font-semibold text-[var(--secondary)] mb-5 relative z-10">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-[var(--secondary)] text-[15px] leading-relaxed">
                  {step.desc}
                </p>
              </FadeIn>
            ))}
          </div>
        </Section>

        {/* Features */}
        <Section>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4">
              Everything you need
            </h2>
            <p className="text-[var(--secondary)] text-center text-lg mb-16 max-w-xl mx-auto">
              A complete reading and learning system in your pocket.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 100}>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] p-6 h-full">
                  <h3 className="text-[15px] font-semibold mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-[var(--secondary)] text-[14px] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>

        {/* For Every Reader */}
        <Section className="bg-[var(--surface)]">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-bold tracking-tight text-center mb-16">
              For every reader
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {AUDIENCES.map((a, i) => (
              <FadeIn key={a.title} delay={i * 100}>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg)] p-6">
                  <h3 className="text-[15px] font-semibold mb-1.5">
                    {a.title}
                  </h3>
                  <p className="text-[var(--secondary)] text-[14px] leading-relaxed">
                    {a.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>

        {/* Privacy Signal */}
        <Section>
          <FadeIn className="max-w-3xl mx-auto text-center">
            <blockquote className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold leading-snug tracking-tight">
              &ldquo;Your data stays yours. No account needed. No tracking. No
              ads. Everything stays on your device. Period.&rdquo;
            </blockquote>
          </FadeIn>
        </Section>

        {/* Final CTA */}
        <Section className="bg-[var(--surface)]">
          <FadeIn className="text-center">
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Start reading smarter.
            </h2>
            <p className="text-[var(--secondary)] text-lg mb-8">
              Free to start. Premium when you&apos;re ready.
            </p>
            <AppStoreBadge />
          </FadeIn>
        </Section>
      </main>
      <Footer />
    </>
  );
}
