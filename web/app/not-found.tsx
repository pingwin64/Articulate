import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-svh flex flex-col items-center justify-center px-6 pt-14">
        <h1 className="font-[family-name:var(--font-serif)] text-6xl sm:text-7xl font-bold tracking-tight mb-4">
          404
        </h1>
        <p className="text-[var(--secondary)] text-lg mb-8">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="text-[15px] font-medium text-[var(--primary)] underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
