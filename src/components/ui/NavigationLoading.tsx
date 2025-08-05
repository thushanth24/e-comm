'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from '@/hooks/usePageTransition';
import { useEffect, useState } from 'react';

export default function NavigationLoading() {
  const [mounted, setMounted] = useState(false);
  const { isLoading } = usePageTransition();

  // This ensures the component only renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          animate={{
            clipPath: [
              'polygon(0 0, 100% 0, 100% 0, 0 0)',
              'polygon(0 0, 100% 0, 100% 30%, 0 20%)',
              'polygon(0 0, 100% 0, 100% 60%, 0 40%)',
              'polygon(0 0, 100% 0, 100% 100%, 0 90%)',
              'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            ]
          }}
          exit={{
            clipPath: [
              'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              'polygon(0 0, 100% 0, 100% 90%, 0 100%)',
              'polygon(0 40%, 100% 60%, 100% 100%, 0 100%)',
              'polygon(0 20%, 100% 30%, 100% 100%, 0 100%)',
              'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            ]
          }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.3, 0.6, 0.9, 1]
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
