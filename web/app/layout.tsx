import type { Metadata } from 'next';
import { Source_Serif_4, Inter } from 'next/font/google';
import './globals.css';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Articulate — Read One Word at a Time',
  description:
    'Articulate transforms how you read. One word at a time for deeper focus, better comprehension, and vocabulary that sticks. AI quizzes, pronunciation practice, and flashcards built in.',
  metadataBase: new URL('https://articulateapp.com'),
  openGraph: {
    title: 'Articulate — Read One Word at a Time',
    description:
      'One word at a time. Understand everything. AI quizzes, pronunciation practice, and flashcards built in.',
    type: 'website',
    siteName: 'Articulate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articulate — Read One Word at a Time',
    description:
      'One word at a time. Understand everything. AI quizzes, pronunciation practice, and flashcards built in.',
  },
  keywords: [
    'speed reading',
    'RSVP reader',
    'reading app',
    'comprehension',
    'vocabulary',
    'pronunciation',
    'flashcards',
    'focus reading',
    'dyslexia',
    'word by word',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-sans)]">{children}</body>
    </html>
  );
}
