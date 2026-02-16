'use client';

import { useEffect, useRef, useState } from 'react';

type Animation =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'blur';

interface RevealProps {
  children: React.ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

const INITIAL: Record<Animation, React.CSSProperties> = {
  'fade-up': { opacity: 0, transform: 'translateY(48px)' },
  'fade-down': { opacity: 0, transform: 'translateY(-32px)' },
  'fade-left': { opacity: 0, transform: 'translateX(-48px)' },
  'fade-right': { opacity: 0, transform: 'translateX(48px)' },
  scale: { opacity: 0, transform: 'scale(0.88)' },
  blur: { opacity: 0, filter: 'blur(12px)', transform: 'translateY(24px)' },
};

const REVEALED: React.CSSProperties = {
  opacity: 1,
  transform: 'none',
  filter: 'none',
};

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function Reveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 900,
  className = '',
  threshold = 0.1,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(revealed ? REVEALED : INITIAL[animation]),
        transition: [
          `opacity ${duration}ms ${EASING} ${delay}ms`,
          `transform ${duration}ms ${EASING} ${delay}ms`,
          `filter ${duration}ms ${EASING} ${delay}ms`,
        ].join(', '),
        willChange: revealed ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
