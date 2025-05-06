import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import '@/styles/globals.scss'; // use .scss instead of Tailwind CSS

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SRI RAAM SELECTION',
  description: 'Discover trendy clothing and accessories for men, women, and kids at StyleStore.',
  keywords: 'fashion, clothing, accessories, mens clothing, womens clothing, kids clothing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="layout">
            <Header />
            <main className="mainContent">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
