'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Price Range</h3>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm">$</span>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
            min="0"
          />
          <span className="text-sm">to</span>
          <span className="text-sm">$</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
            min="0"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={applyFilter}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Apply
          </button>
          <button
            onClick={resetFilter}
            className="px-3 py-2 border rounded-md text-sm hover:bg-secondary"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
