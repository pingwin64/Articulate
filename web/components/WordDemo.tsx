'use client';

import { useEffect, useState, useCallback } from 'react';

const WORDS = ['One', 'word.', 'Nothing', 'else.', 'Pure', 'focus.'];
const DEFAULT_INTERVAL = 700;
const PAUSE_AT_END = 1500;

interface WordDemoProps {
  interval?: number;
}

export default function WordDemo({ interval = DEFAULT_INTERVAL }: WordDemoProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % WORDS.length);
      setVisible(true);
    }, 200);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const delay = index === WORDS.length - 1 ? PAUSE_AT_END : interval;
    const timer = setTimeout(advance, delay);
    return () => clearTimeout(timer);
  }, [index, advance, interval]);

  return (
    <div className="h-28 flex items-center justify-center" aria-live="polite">
      <span
        className="font-[family-name:var(--font-serif)] text-6xl sm:text-7xl md:text-8xl font-bold text-[var(--primary)] transition-[opacity,transform] duration-200 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        {WORDS[index]}
      </span>
    </div>
  );
}
