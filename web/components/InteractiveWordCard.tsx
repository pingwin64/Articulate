'use client';

import { useState } from 'react';
import WordDemo from './WordDemo';

const MIN_INTERVAL = 250;
const MAX_INTERVAL = 1200;
const DEFAULT = 700;

export default function InteractiveWordCard() {
  const [interval, setInterval_] = useState(DEFAULT);

  // Map slider 0-100 to interval (inverted: left=slow=high interval, right=fast=low interval)
  const sliderValue =
    ((MAX_INTERVAL - interval) / (MAX_INTERVAL - MIN_INTERVAL)) * 100;

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    const mapped = MAX_INTERVAL - (v / 100) * (MAX_INTERVAL - MIN_INTERVAL);
    setInterval_(Math.round(mapped));
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-md overflow-hidden">
      <div className="p-6 sm:p-7 flex items-center justify-center min-h-[200px]">
        <WordDemo interval={interval} />
      </div>
      <div className="border-t border-[var(--stroke)] px-6 py-3.5 flex items-center justify-between gap-4">
        <span className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] font-semibold shrink-0">
          Your pace
        </span>
        <div className="flex items-center gap-2.5 flex-1 max-w-[180px]">
          <span className="text-[11px] text-[var(--muted)]">slow</span>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={handleSlider}
            className="flex-1 h-1 accent-[var(--primary)] cursor-pointer appearance-none bg-[var(--stroke)] rounded-full
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[var(--primary)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-150
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[var(--primary)]
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Reading speed"
          />
          <span className="text-[11px] text-[var(--muted)]">fast</span>
        </div>
      </div>
    </div>
  );
}
