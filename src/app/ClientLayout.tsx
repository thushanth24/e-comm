'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Providers } from './Providers';

// Import client components with SSR enabled
const Header = dynamic(() => import('@/components/ui/Header'), { 
  loading: () => <div className="h-16 bg-background" />
});

const Footer = dynamic(() => import('@/components/ui/Footer'), { 
  loading: () => <div className="h-24 bg-background" />
});

const NavigationLoading = dynamic(
  () => import('@/components/ui/NavigationLoading')
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 relative">
          {/* Main content with loading state */}
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
        
        <Footer />
        
        {/* Navigation loading overlay */}
        <NavigationLoading />
      </div>
    </Providers>
  );
}
