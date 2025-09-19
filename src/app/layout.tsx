import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from './ClientLayout';
import '@/styles/globals.scss';
import '@/styles/transitions.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Site base URL for metadata and canonical URLs
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-netlify-site-url.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SRI RAM SELECTION',
    template: '%s | SRI RAM SELECTION',
  },
  description: 'Discover trendy clothing and accessories for men, women, and kids at StyleStore.',
  keywords: 'fashion, clothing, accessories, mens clothing, womens clothing, kids clothing',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    // Use string form for advanced Googlebot directives
    googleBot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'SRI RAM SELECTION',
    siteName: 'SRI RAM SELECTION',
    description: 'Discover trendy clothing and accessories for men, women, and kids at StyleStore.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SRI RAM SELECTION',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SRI RAM SELECTION',
    description: 'Discover trendy clothing and accessories for men, women, and kids at StyleStore.',
    images: ['/og-image.jpg'],
  },
  // Replace with your real code after you add the property in Search Console
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
  icons: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.ico', // Fallback to .ico if .svg is not available
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Structured Data: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'SRI RAM SELECTION',
              url: siteUrl,
              logo: `${siteUrl}/apple-touch-icon.png`,
              sameAs: [
                // Add your social profiles here
              ],
            }),
          }}
        />
        {/* Structured Data: WebSite with potentialAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'SRI RAM SELECTION',
              url: siteUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
