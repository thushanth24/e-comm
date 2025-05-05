'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import CategoryCard from '@/components/ui/CategoryCard';
import styles from '@/styles/Home.module.scss';

type Category = {
  id?: number;
  name: string;
  slug: string;
};

export default function CategorySection({ categories }: { categories: Category[] }) {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? categories : categories.slice(0, 4);

  return (
    <section className={styles.featuredCategories}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>Shop by Category</h2>
          {categories.length > 4 && (
            <button onClick={() => setShowAll((prev) => !prev)} className={styles.sectionLink}>
              {showAll ? 'Show Less' : 'View All'} <ChevronRight className={styles.linkIcon} />
            </button>
          )}
        </div>
        <div className={styles.categoryGrid}>
          {visibleCategories.map((category, index) => (
            <CategoryCard
              key={category.id ?? category.name + index}
              category={{ name: category.name, slug: category.slug }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
