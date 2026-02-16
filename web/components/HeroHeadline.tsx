'use client';

import { useEffect, useState } from 'react';

export default function HeroHeadline() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStarted(true);
      return;
    }
    const timer = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const lines = [
    ['Read', 'one', 'word'],
    ['at', 'a', 'time.'],
  ];

  let wordIndex = 0;

  return (
    <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-5">
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.map((word) => {
            const idx = wordIndex++;
            return (
              <span
                key={idx}
                className="inline-block overflow-hidden mr-[0.28em] last:mr-0 align-bottom"
              >
                <span
                  className="inline-block"
                  style={{
                    transform: started ? 'translateY(0)' : 'translateY(115%)',
                    transition: `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 120 + 100}ms`,
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
