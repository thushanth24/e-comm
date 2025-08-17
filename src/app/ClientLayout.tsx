'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Providers } from './Providers';

// Import client components with SSR disabled
const Header = dynamic(() => import('@/components/ui/Header'), { 
  ssr: false,
  loading: () => <div className="h-16 bg-background" />
});

const Footer = dynamic(() => import('@/components/ui/Footer'), { 
  ssr: false,
  loading: () => <div className="h-24 bg-background" />
});

const NavigationLoading = dynamic(
  () => import('@/components/ui/NavigationLoading'), 
  { ssr: false }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<div className="h-16 bg-background" />}>
          <Header />
        </Suspense>
        
        <main className="flex-1">
          <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        
        <NavigationLoading />
      </div>
    </Providers>
  );
}
