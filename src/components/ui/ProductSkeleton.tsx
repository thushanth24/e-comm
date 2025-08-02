import React from 'react';
import styles from '@/styles/ProductList.module.scss';

export function ProductSkeleton() {
  return (
    <div className={styles.productCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonPrice} />
    </div>
  );
}

export function ProductListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.productGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}
