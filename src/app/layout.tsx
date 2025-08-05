import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from './ClientLayout';
import '@/styles/globals.scss';
import '@/styles/transitions.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SRI RAM SELECTION',
  description: 'Discover trendy clothing and accessories for men, women, and kids at StyleStore.',
  keywords: 'fashion, clothing, accessories, mens clothing, womens clothing, kids clothing',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <meta name="robots" content="noindex" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
