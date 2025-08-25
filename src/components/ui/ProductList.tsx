'use client';

import ProductCard from './ProductCard';
import { PackageOpen, ArrowRight } from 'lucide-react';
import styles from '@/styles/ProductList.module.scss';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Product } from './ProductCard';

interface ProductListProps {
  products: Product[];
  title?: string;
  emptyMessage?: string;
  viewAllHref?: string;
  viewAllText?: string;
}

export default function ProductList({ 
  products, 
  title,
  emptyMessage = "No products found.",
  viewAllHref,
  viewAllText = "View All Products"
}: ProductListProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render the view all link on the client side after mount
  const showViewAll = isMounted && viewAllHref && products.length > 0;

  return (
    <div className={styles.productList}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <PackageOpen className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Products Available</h3>
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product, index) => {
            const { isActive, ...productData } = product;
            return (
              <ProductCard 
                key={productData.id} 
                product={productData} 
                isActive={isActive}
                priority={index < 4} // Priority for first 4 products
              />
            );
          })}
        </div>
      )}
      
      {showViewAll && (
        <div className={styles.viewAllContainer}>
          <Link href={viewAllHref} className={styles.viewAllButton}>
            {viewAllText}
            <ArrowRight className={styles.arrowIcon} />
          </Link>
        </div>
      )}
    </div>
  );
}
