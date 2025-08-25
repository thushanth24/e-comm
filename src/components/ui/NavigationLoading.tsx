'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from '@/hooks/usePageTransition';
import { useEffect, useState } from 'react';

export default function NavigationLoading() {
  const [mounted, setMounted] = useState(false);
  const { isLoading } = usePageTransition();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
