import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
});

export const metadata: Metadata = {
  title: 'Lunaxcode - AI-Powered Project Management',
  description: 'AI-powered project management system for Filipino web development agencies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${onest.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
