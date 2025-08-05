'use client';

import { useCallback, useState, useEffect } from 'react';
import { usePathname, useRouter, usePathname as useCurrentPath } from 'next/navigation';

export function usePageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const startTransition = useCallback((url?: string) => {
    if (url && typeof window !== 'undefined') {
      // Set loading state
      setIsLoading(true);
      // Add fade-out class to body
      document.body.classList.add('page-transition-fade-out');
      
      // Start navigation
      router.push(url);
    }
  }, [router]);

  const currentPath = useCurrentPath();

  // Handle page load completion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLoad = () => {
      if (isLoading) {
        // Add a small delay to ensure all content is rendered
        setTimeout(() => {
          document.body.classList.remove('page-transition-fade-out');
          document.body.classList.add('page-transition-fade-in');
          // Remove fade-in class after animation completes
          setTimeout(() => {
            document.body.classList.remove('page-transition-fade-in');
            setIsLoading(false);
          }, 300);
        }, 100);
      }
    };

    // Listen for page load
    window.addEventListener('load', handleLoad);
    
    // Initial check in case the page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    }
    
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [isLoading, pathname]);

  return {
    startTransition,
    isLoading
  };
}
