import type { Metadata, Viewport } from 'next';
import { Onest, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

// Display font for headings - distinctive and memorable
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

// Body font - clean and readable
const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  display: 'swap',
});

const baseUrl = 'https://app.lunaxcode.site';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default: 'Lunaxcode | Web Development Agency in Metro Manila, Philippines',
    template: '%s | Lunaxcode',
  },

  description:
    'Professional web development services for Filipino businesses. AI-powered project management, fixed pricing from PHP8,000. Landing pages, e-commerce, web apps. Serving Metro Manila and nationwide.',

  keywords: [
    'web development Philippines',
    'web developer Metro Manila',
    'website design Philippines',
    'affordable web development',
    'Filipino web agency',
    'landing page development',
    'e-commerce website Philippines',
    'custom web application',
    'AI project management',
    'GCash PayMaya payment',
    'small business website',
    'web design Manila',
  ],

  authors: [{ name: 'Lunaxcode', url: baseUrl }],
  creator: 'Lunaxcode',
  publisher: 'Lunaxcode',

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: [
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'android-chrome',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'android-chrome',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
      },
    ],
  },

  manifest: '/site.webmanifest',

  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: baseUrl,
    siteName: 'Lunaxcode',
    title: 'Lunaxcode | Professional Web Development in Philippines',
    description:
      'Beautiful websites that grow your business. Fixed pricing from PHP8,000. AI-powered project management. Serving Metro Manila and nationwide.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lunaxcode - Web Development Agency Philippines',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Lunaxcode | Web Development Agency Philippines',
    description:
      'Professional web development for Filipino businesses. AI-powered project management, fixed pricing from PHP8,000.',
    images: ['/og-image.png'],
    creator: '@lunaxcode',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: baseUrl,
  },

  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${onest.variable} font-sans`}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
