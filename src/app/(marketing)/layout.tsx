import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lunaxcode - Web Development Agency for Filipino Businesses',
  description: 'Professional web development services with AI-powered project management. Build your landing page, business website, or custom application with our expert team.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
