'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from '@/styles/PriceRangeFilter.module.scss';

export default function PriceRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(!!minPrice || !!maxPrice);
  }, [minPrice, maxPrice]);

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.filter}>
      <h3 className={styles.heading}>
        <span className={styles.headingText}>Price Range</span>
        {isActive && (
          <span className={styles.activeIndicator}></span>
        )}
      </h3>

      <div className={styles.form}>
        <div className={styles.inputContainer}>
          <div className={styles.inputGroup}>
            <span className={styles.symbol}>LKR</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              className={styles.input}
            />
          </div>
          <div className={styles.divider}></div>
          <div className={styles.inputGroup}>
            <span className={styles.symbol}>LKR</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.rangeSlider}>
          <div 
            className={styles.track}
            style={{
              '--min': minPrice ? Math.min(Number(minPrice), 1000) / 1000 : 0,
              '--max': maxPrice ? Math.min(Number(maxPrice), 1000) / 1000 : 1
            } as React.CSSProperties}
          ></div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={applyFilter} 
            className={styles.apply}
            disabled={!minPrice && !maxPrice}
          >
            <span>Apply Filter</span>
            <div className={styles.arrow}></div>
          </button>
          {isActive && (
            <button onClick={resetFilter} className={styles.reset}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}