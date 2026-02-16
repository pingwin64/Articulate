import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LogoMark from '@/components/LogoMark';
import WordDemo from '@/components/WordDemo';
import Reveal from '@/components/Reveal';
import Section from '@/components/Section';
import FeatureSection from '@/components/FeatureSection';
import FAQItem from '@/components/FAQItem';
import HeroHeadline from '@/components/HeroHeadline';
import InteractiveWordCard from '@/components/InteractiveWordCard';
import PronunciationMock from '@/components/PronunciationMock';
import WaitlistForm from '@/components/WaitlistForm';

/* ─── Data ─── */

const STEPS = [
  {
    num: '01',
    title: 'Pick a text',
    desc: 'Curated stories, articles, speeches — or paste your own.',
  },
  {
    num: '02',
    title: 'Read with focus',
    desc: 'One word at a time. No distractions. Just you and the text.',
  },
  {
    num: '03',
    title: 'Prove you understood',
    desc: 'AI quizzes, pronunciation drills, and flashcards that stick.',
  },
];

const BENEFITS = [
  {
    title: 'Sharper focus',
    desc: 'Train your attention one word at a time. No scrolling. No skimming. No wandering.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: 'Bigger vocabulary',
    desc: 'Save words you discover. Review with flashcards. Hear the pronunciation. Words that actually stick.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Real comprehension',
    desc: 'AI quizzes after every reading prove you understood — not just finished.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'A reading habit',
    desc: 'Daily streaks and weekly challenges make consistency feel effortless.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    question: 'What is one-word-at-a-time reading?',
    answer:
      "It's called Rapid Serial Visual Presentation. Instead of scanning lines of text, you see one word at a time in a fixed position. Your eyes stay still. Your brain processes every word. The result is deeper focus and better comprehension — especially for people who struggle with distraction or dense material. You control the pace, so you read at exactly the speed that works for you.",
  },
  {
    question: 'Does this help with ADHD or focus issues?',
    answer:
      "Yes. One-word-at-a-time reading removes the visual clutter that makes traditional reading hard for ADHD brains. There's nothing to skim past, no paragraph to lose your place in, no page to zone out on. Just one word, then the next. We also include OpenDyslexic as a font option for readers with dyslexia.",
  },
  {
    question: 'Is this the same as speed reading?',
    answer:
      "No. Speed reading pushes you to go faster. Articulate helps you go deeper. You control the pace — speed up when you're comfortable, slow down when the content is dense. The goal isn't words per minute. It's comprehension, vocabulary, and focus. AI quizzes after each reading test whether you actually understood what you read.",
  },
  {
    question: 'Can I read my own texts and articles?',
    answer:
      'Yes. Paste any text directly into the app — articles, study materials, book excerpts, anything. You can also scan printed text with your camera. The app includes 30+ curated texts across categories like stories, speeches, philosophy, and science, with new AI-generated texts daily based on your preferences.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No. Articulate works entirely on your device. No account, no sign-up, no email required. Your reading history, saved words, streaks, and progress stay on your phone and are never sent anywhere. No analytics, no tracking, no ads.',
  },
  {
    question: 'Is Articulate actually free?',
    answer:
      "The core reading experience is free — curated texts, daily reading, word-by-word display, and basic features. Premium unlocks unlimited AI quizzes, all fonts and themes, the full word bank with spaced repetition, pronunciation drills, and more. No trial that expires. No surprise charges. Upgrade if and when you want to.",
  },
];

/* ─── Inline Visuals ─── */

function QuizCardMock() {
  const options = [
    { label: 'To promote faster reading speeds', correct: false },
    { label: 'To improve focus and comprehension', correct: true },
    { label: 'To replace audiobooks entirely', correct: false },
    { label: 'To memorize entire paragraphs', correct: false },
  ];

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-md p-6 sm:p-7">
      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--muted)] mb-4">
        Comprehension Quiz
      </p>
      <p className="text-[15px] font-semibold mb-5 leading-snug">
        What is the main purpose of one-word reading?
      </p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <div
            key={opt.label}
            className={`rounded-xl border px-4 py-3 text-[13px] sm:text-[14px] leading-snug transition-colors ${
              opt.correct
                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--bg)] font-medium'
                : 'border-[var(--stroke)] text-[var(--secondary)]'
            }`}
          >
            <span className="flex items-center gap-2">
              {opt.correct && (
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                </svg>
              )}
              {opt.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakDotsMock() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const filled = [true, true, true, true, true, false, false];

  return (
    <div className="w-full max-w-xs rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-md p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--muted)]">
          This Week
        </p>
        <p className="text-[13px] font-semibold">5 days</p>
      </div>
      <div className="flex items-center justify-between gap-1">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                filled[i]
                  ? 'bg-[var(--primary)] text-[var(--bg)]'
                  : 'border border-[var(--stroke)] text-[var(--muted)]'
              }`}
            >
              {filled[i] && (
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </div>
            <span className="text-[11px] text-[var(--muted)] font-medium">
              {day}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-[var(--stroke)] flex items-center justify-between">
        <span className="text-[13px] text-[var(--secondary)]">Current streak</span>
        <span className="text-[13px] font-semibold">5 days</span>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* ── 1. Hero ── */}
        <section className="min-h-svh flex flex-col items-center justify-center px-6 pt-14 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(120, 130, 255, 0.05), transparent)',
            }}
          />

          <div className="flex flex-col items-center text-center relative z-10">
            <Reveal>
              <div className="flex flex-col items-center mb-12">
                <LogoMark className="w-8 h-7 text-[var(--primary)] mb-4" />
                <p className="text-sm tracking-[0.2em] uppercase text-[var(--muted)]">
                  articulate
                </p>
              </div>
            </Reveal>

            <HeroHeadline />

            <Reveal delay={900}>
              <p className="text-lg sm:text-xl text-[var(--secondary)] mb-14 max-w-md leading-relaxed">
                Deep focus. Real comprehension. Vocabulary that sticks.
              </p>
            </Reveal>
          </div>

          <Reveal delay={1100} className="mb-14">
            <WordDemo />
          </Reveal>

          <Reveal delay={1300} className="flex flex-col items-center gap-3.5">
            <WaitlistForm />
            <p className="text-[13px] text-[var(--muted)]">
              Launching soon on iOS. Join the waitlist.
            </p>
          </Reveal>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-[var(--stroke)] animate-pulse" />
          </div>
        </section>

        {/* ── 2. How It Works ── */}
        <Section className="bg-[var(--surface)]">
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--muted)] text-center mb-4">
              How it works
            </p>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-bold tracking-tight text-center mb-16">
              Three steps to deeper reading
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px bg-[var(--stroke)]" />
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 180} className="text-center relative">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[var(--stroke)] bg-[var(--bg)] text-sm font-semibold text-[var(--secondary)] mb-5 relative z-10">
                  {step.num}
                </span>
                <h3 className="text-[16px] sm:text-lg font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--secondary)] text-[14px] sm:text-[15px] leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── 4. Feature Deep-Dives ── */}
        <Section>
          <div className="flex flex-col gap-28 sm:gap-36">
            <FeatureSection
              number="01"
              title="One word. Nothing else."
              body="One word at a time. Your brain can't skip ahead, can't skim, can't drift. Just pure focus — and it changes how you read everything."
              detail="Five fonts including OpenDyslexic. Your pace. Any text you want."
              visual={<InteractiveWordCard />}
            />
            <FeatureSection
              number="02"
              title="Reading without retention is just scrolling."
              body="After every text, AI generates comprehension questions based on what you just read. Not generic trivia — questions about the ideas you actually encountered."
              detail="Save the words worth remembering. Spaced repetition makes sure they stay."
              visual={<QuizCardMock />}
              reverse
            />
            <FeatureSection
              number="03"
              title="Say it right. Every time."
              body="Speak words aloud and get instant AI feedback on your pronunciation. No guessing, no embarrassment — just you and the mic. Perfect for language learners and anyone building confidence with new vocabulary."
              detail="Powered by Whisper. Works with every word you save."
              visual={<PronunciationMock />}
            />
            <FeatureSection
              number="04"
              title="Two minutes a day changes how you read."
              body="Daily streaks keep you accountable. Weekly challenges keep it interesting. Levels unlock new fonts, themes, and tools — rewards you'll actually use."
              detail="Set a daily word goal. Show up. Watch your vocabulary grow."
              visual={<StreakDotsMock />}
              reverse
            />
          </div>
        </Section>

        {/* ── 5. Benefits ── */}
        <Section>
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--muted)] text-center mb-4">
              What changes
            </p>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-bold tracking-tight text-center mb-16">
              More than a reading app
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} animation="scale" delay={i * 120}>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-sm p-6 h-full hover:border-[var(--stroke)] transition-colors duration-300">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface)] flex items-center justify-center text-[var(--secondary)] mb-4">
                    {b.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold mb-2">
                    {b.title}
                  </h3>
                  <p className="text-[var(--secondary)] text-[14px] leading-[1.65]">
                    {b.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── 7. Privacy Signal ── */}
        <section className="py-28 sm:py-36 px-6 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(120, 130, 255, 0.04), transparent)',
            }}
          />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <Reveal animation="blur">
              <div className="flex justify-center mb-6">
                <div className="w-10 h-10 rounded-full border border-[var(--stroke)] flex items-center justify-center text-[var(--muted)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
              </div>
              <blockquote className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl md:text-[2.25rem] font-semibold leading-[1.35] tracking-tight">
                Your data stays yours.
                <br className="hidden sm:block" />
                {' '}No account. No tracking.
                <br className="hidden sm:block" />
                {' '}No ads. Everything on your device.
              </blockquote>
            </Reveal>
          </div>
        </section>

        {/* ── 8. FAQ ── */}
        <Section className="bg-[var(--surface)]">
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--muted)] text-center mb-4">
              FAQ
            </p>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-bold tracking-tight text-center mb-16">
              Common questions
            </h2>
          </Reveal>
          <div className="max-w-2xl mx-auto">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 80}>
                <FAQItem question={faq.question} answer={faq.answer} />
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── 9. Final CTA ── */}
        <section className="py-28 sm:py-36 px-6 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(120, 130, 255, 0.05), transparent)',
            }}
          />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <Reveal animation="blur">
              <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Your next chapter starts here.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-[var(--secondary)] text-lg mb-10">
                Be the first to know when we launch.
              </p>
            </Reveal>
            <Reveal animation="scale" delay={400}>
              <WaitlistForm showPill={false} />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
