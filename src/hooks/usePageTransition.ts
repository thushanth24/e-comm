'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Simple in-memory cache for page transitions
const transitionCache = new Map();

export function usePageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeout = useRef<NodeJS.Timeout>();

  const startTransition = useCallback((url?: string) => {
    if (!url || typeof window === 'undefined') return;

    // Clear any pending timeouts
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    // Check cache first
    if (transitionCache.has(url)) {
      router.push(url);
      return;
    }

    // Set loading state with a small delay to prevent flicker on fast connections
    loadingTimeout.current = setTimeout(() => {
      setIsLoading(true);
      document.body.classList.add('page-transition-fade-out');
    }, 100);
    
    // Start navigation
    router.push(url);
  }, [router]);

  const currentPath = usePathname();

  // Handle page load completion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLoad = () => {
      if (isLoading) {
        // Clear any pending timeouts
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current);
        }

        // Cache the current page
        if (pathname) {
          transitionCache.set(pathname, true);
          // Keep cache size in check
          if (transitionCache.size > 10) {
            const firstKey = transitionCache.keys().next().value;
            transitionCache.delete(firstKey);
          }
        }

        // Smooth transition
        document.body.classList.remove('page-transition-fade-out');
        document.body.classList.add('page-transition-fade-in');
        
        // Remove fade-in class after animation completes
        loadingTimeout.current = setTimeout(() => {
          document.body.classList.remove('page-transition-fade-in');
          setIsLoading(false);
        }, 150);
      }
    };

    // Listen for page load
    window.addEventListener('load', handleLoad);
    
    // Initial check in case the page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('load', handleLoad);
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [isLoading, currentPath, pathname]);

  return {
    startTransition,
    isLoading
  };
}
