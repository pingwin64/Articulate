'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const WORD = 'ephemeral';
const PHONETIC = 'ih-FEM-er-uhl';
const BARS = 24;

// Deterministic waveform shape (no Math.random — stable across renders)
const BAR_HEIGHTS = Array.from({ length: BARS }, (_, i) => {
  const center = BARS / 2;
  const dist = Math.abs(i - center) / center;
  const base = 0.2 + (1 - dist * dist) * 0.8;
  const variation = 0.7 + 0.3 * Math.abs(Math.sin(i * 2.7));
  return base * variation;
});

type Phase = 'idle' | 'listening' | 'result';

export default function PronunciationMock() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<{
    match: boolean;
    transcript: string;
  } | null>(null);
  const [supported, setSupported] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Check browser support
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Auto-demo loop (only when demoMode is true)
  useEffect(() => {
    if (!demoMode) return;

    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      setPhase('listening');

      const t1 = setTimeout(() => {
        if (cancelled) return;
        setPhase('result');
        setResult({ match: true, transcript: WORD });

        const t2 = setTimeout(() => {
          if (cancelled) return;
          setPhase('idle');
          setResult(null);

          const t3 = setTimeout(() => {
            if (cancelled) return;
            runCycle();
          }, 1500);
          timersRef.current.push(t3);
        }, 2500);
        timersRef.current.push(t2);
      }, 2200);
      timersRef.current.push(t1);
    };

    const initial = setTimeout(runCycle, 800);
    timersRef.current.push(initial);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [demoMode, clearTimers]);

  const stopDemo = useCallback(() => {
    setDemoMode(false);
    clearTimers();
    setPhase('idle');
    setResult(null);
  }, [clearTimers]);

  // TTS — hear the word
  const hearWord = useCallback(() => {
    stopDemo();
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(WORD);
      u.rate = 0.8;
      u.lang = 'en-US';
      speechSynthesis.speak(u);
    }
  }, [stopDemo]);

  // Speech recognition — try saying the word
  const tryIt = useCallback(() => {
    stopDemo();
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => setPhase('listening');

    recognition.onresult = (event: any) => {
      let match = false;
      let bestTranscript = '';

      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i].transcript.toLowerCase().trim();
        if (!bestTranscript) bestTranscript = alt;
        if (alt === WORD || alt.includes(WORD) || WORD.includes(alt)) {
          match = true;
          bestTranscript = alt;
          break;
        }
      }

      setResult({ match, transcript: bestTranscript });
      setPhase('result');
    };

    recognition.onerror = () => {
      setResult({ match: false, transcript: '' });
      setPhase('result');
    };

    recognition.onend = () => {
      setPhase((prev) => {
        if (prev === 'listening') {
          setResult({ match: false, transcript: '' });
          return 'result';
        }
        return prev;
      });
    };

    recognition.start();

    // Auto-stop after 4s
    const t = setTimeout(() => {
      try {
        recognition.stop();
      } catch {}
    }, 4000);
    timersRef.current.push(t);
  }, [stopDemo]);

  const reset = useCallback(() => {
    setPhase('idle');
    setResult(null);
  }, []);

  const isAnimating = phase === 'listening';

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-md p-6 sm:p-7">
      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--muted)] mb-5">
        Pronunciation Drill
      </p>

      {/* Word + phonetic */}
      <div className="text-center mb-6">
        <p className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-bold tracking-tight">
          {WORD}
        </p>
        <p className="text-[13px] text-[var(--muted)] mt-1.5 tracking-wide">
          {PHONETIC}
        </p>
      </div>

      {/* Waveform */}
      <div className="flex items-end justify-center gap-[3px] h-12 mb-5">
        {BAR_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: isAnimating ? `${height * 100}%` : '12%',
              backgroundColor: isAnimating
                ? 'var(--primary)'
                : 'var(--stroke)',
              opacity: isAnimating ? 0.4 + height * 0.6 : 0.4,
              transition: `all ${isAnimating ? 300 : 500}ms ease-out`,
              transitionDelay: isAnimating ? `${i * 15}ms` : '0ms',
            }}
          />
        ))}
      </div>

      {/* Controls / Result */}
      <div className="flex items-center justify-center min-h-[48px]">
        {phase === 'result' && result ? (
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              {result.match ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      fill="var(--bg)"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-semibold">Perfect!</span>
                </>
              ) : (
                <span className="text-[14px] text-[var(--secondary)]">
                  {result.transcript
                    ? <>Heard &ldquo;{result.transcript}&rdquo; — try again</>
                    : 'No input detected — try again'}
                </span>
              )}
            </div>
            {!demoMode && (
              <button
                onClick={reset}
                className="text-[12px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Try again
              </button>
            )}
          </div>
        ) : phase === 'listening' ? (
          <p className="text-[13px] text-[var(--muted)] animate-pulse">
            {demoMode ? 'Listening...' : 'Speak now...'}
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={hearWord}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--stroke)] text-[13px] text-[var(--secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-4 h-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
              Hear it
            </button>
            {supported && (
              <button
                onClick={tryIt}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--primary)] text-[var(--bg)] text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                Try it
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
