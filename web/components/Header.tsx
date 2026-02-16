import Link from 'next/link';
import LogoMark from './LogoMark';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--bg)]/80 border-b border-[var(--stroke)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <LogoMark className="w-5 h-4 text-[var(--primary)]" />
          <span className="text-[15px] font-medium tracking-tight text-[var(--primary)]">
            articulate
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            Privacy
          </Link>
          <a
            href="https://x.com/m4lph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            X
          </a>
          <Link
            href="/terms"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            Terms
          </Link>
        </nav>
      </div>
    </header>
  );
}
