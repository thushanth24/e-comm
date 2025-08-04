'use client';

import { motion } from 'framer-motion';
import { ProductListSkeleton } from '@/components/ui/ProductSkeleton';
import styles from '@/styles/Home.module.scss';

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Loading Spinner Overlay */}
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Page Content Skeleton */}
      <main className={styles.page}>
        {/* Hero Skeleton */}
        <section className={styles.hero}>
          <div className={`${styles.heroSkeleton} animate-pulse`} />
        </section>

        {/* Value Propositions Skeleton */}
        <section className={styles.values}>
          <div className={styles.container}>
            <div className={styles.valueGrid}>
              {[...Array(4)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className={`${styles.valueSkeleton} animate-pulse`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={styles.valueSkeletonIcon} />
                  <div>
                    <div className={styles.valueSkeletonTitle} />
                    <div className={styles.valueSkeletonText} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop Sections Skeleton */}
        <section className={styles.shopSections}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.shopSectionSkeleton}>
              <div className={styles.shopSectionHeader}>
                <div className={styles.shopSectionTitle} />
                <div className={styles.shopSectionLink} />
              </div>
              <ProductListSkeleton count={4} />
            </div>
          ))}
        </section>
      </main>
    </motion.div>
  );
}
