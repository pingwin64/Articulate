import Link from 'next/link';
import LogoMark from './LogoMark';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--stroke)] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="w-4 h-3.5 text-[var(--muted)]" />
          <span className="text-[13px] text-[var(--muted)]">
            &copy; {new Date().getFullYear()} Articulate
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            Terms
          </Link>
          <a
            href="mailto:admin@ordco.net"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
