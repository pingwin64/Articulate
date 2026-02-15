import Header from './Header';
import Footer from './Footer';

interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="pt-14">
        <div className="max-w-[680px] mx-auto px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm text-[var(--muted)] mb-10">{updated}</p>
          <div className="space-y-8 legal-content">{children}</div>
          <div className="mt-12 pt-6 border-t border-[var(--stroke)] text-sm text-[var(--muted)]">
            &copy; {new Date().getFullYear()} Articulate. All rights reserved.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
