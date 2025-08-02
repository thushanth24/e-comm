import React from 'react';
import { ProductListSkeleton } from '@/components/ui/ProductSkeleton';
import styles from '@/styles/Home.module.scss';

export default function Loading() {
  return (
    <main className={styles.page}>
      {/* Hero Skeleton */}
      <section className={styles.hero}>
        <div className={styles.heroSkeleton} />
      </section>

      {/* Value Propositions Skeleton */}
      <section className={styles.values}>
        <div className={styles.container}>
          <div className={styles.valueGrid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.valueSkeleton}>
                <div className={styles.valueSkeletonIcon} />
                <div>
                  <div className={styles.valueSkeletonTitle} />
                  <div className={styles.valueSkeletonText} />
                </div>
              </div>
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
  );
}
