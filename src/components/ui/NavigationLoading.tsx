'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

export default function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);
      // Simulate progress
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90; // Don't go to 100% until the page is actually loaded
          }
          return prev + 10;
        });
      }, 100);
    };
    
    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    };

    // Handle Next.js route changes
    const handleRouteChangeStart = () => handleStart();
    const handleRouteChangeComplete = () => handleComplete();

    // Set up event listeners
    window.addEventListener('beforeunload', handleStart);
    window.addEventListener('load', handleComplete);
    window.addEventListener('routeChangeStart', handleRouteChangeStart);
    window.addEventListener('routeChangeComplete', handleRouteChangeComplete);

    // Clean up event listeners
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('load', handleComplete);
      window.removeEventListener('routeChangeStart', handleRouteChangeStart);
      window.removeEventListener('routeChangeComplete', handleRouteChangeComplete);
    };
  }, []);

  // Reset loading state when pathname changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[100] shadow-lg"
          initial={{ width: '0%' }}
          animate={{
            width: `${progress}%`,
            transition: { duration: 0.3, ease: 'easeInOut' }
          }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.3 }
          }}
        >
          <motion.div 
            className="h-full w-1/3 bg-white opacity-30 absolute right-0"
            animate={{
              x: ['-100%', '300%'],
              transition: { 
                repeat: Infinity, 
                duration: 1.5,
                ease: 'easeInOut'
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
