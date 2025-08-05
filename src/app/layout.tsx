import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import NavigationLoading from '@/components/ui/NavigationLoading';
import '@/styles/globals.scss'; // use .scss instead of Tailwind CSS
import '@/styles/transitions.css'; // Import transitions CSS

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
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="layout">
            <NavigationLoading />
            <Header />
            <main className="mainContent">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
