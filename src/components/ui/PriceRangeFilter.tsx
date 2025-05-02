'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from '@/styles/PriceRangeFilter.module.scss';

export default function PriceRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }

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
      <h3 className={styles.heading}>Price Range</h3>

      <div className={styles.form}>
        <div className={styles.inputRow}>
          <span className={styles.symbol}>$</span>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
          />
          <span className={styles.to}>to</span>
          <span className={styles.symbol}>$</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
          />
        </div>

        <div className={styles.actions}>
          <button onClick={applyFilter} className={styles.apply}>
            Apply
          </button>
          <button onClick={resetFilter} className={styles.reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
