'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

// Import client components with SSR disabled
const Header = dynamic(() => import('@/components/ui/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/ui/Footer'), { ssr: false });
const NavigationLoading = dynamic(
  () => import('@/components/ui/NavigationLoading'), 
  { ssr: false }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="layout">
        <NavigationLoading />
        <Header />
        <main className="mainContent">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </ThemeProvider>
  );
}
