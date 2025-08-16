'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CategoryLink } from '@/components/ui/CategoryLink';
import ProductList from '@/components/ui/ProductList';
import styles from '@/styles/CategoryPage.module.scss';

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  parentId: string | null;
  parent: {
    id: number;
    name: string;
    slug: string;
  } | null;
  children: { id: number; name: string; slug: string }[];
  parentHierarchy?: Array<{ id: number; name: string; slug: string }>;
}

// Dynamically import PriceRangeFilter with SSR disabled to avoid hydration issues
const PriceRangeFilter = dynamic(
  () => import('@/components/ui/PriceRangeFilter'),
  { ssr: false }
);

export default function ClientCategoryPage({ 
  categoryInfo, 
  products,
  minPrice,
  maxPrice
}: { 
  categoryInfo: CategoryInfo;
  products: any[];
  minPrice?: string;
  maxPrice?: string;
}) {
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Function to generate breadcrumb items
  const Breadcrumb = ({ items }: { items: Array<{ name: string; slug: string }> }) => (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol>
        <li>
          <CategoryLink href="/">Home</CategoryLink>
        </li>
        {items.map((item, index) => (
          <li key={item.slug}>
            <span className={styles.separator} aria-hidden="true">&gt;</span>
            {index === items.length - 1 ? (
              <span className={styles.currentCategory}>{item.name}</span>
            ) : (
              <CategoryLink href={`/categories/${item.slug}`}>
                {item.name}
              </CategoryLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );

  // Prepare breadcrumb items
  const breadcrumbItems = [
    ...(categoryInfo.parentHierarchy || []),
    { name: categoryInfo.name, slug: categoryInfo.slug }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {categoryInfo.children.length > 0 && (
        <div className={styles.subcategories}>
          <div className={styles.subcategoriesInner}>
            {categoryInfo.children.map((sub) => (
              <CategoryLink 
                key={sub.id} 
                href={`/categories/${sub.slug}`}
                className={styles.subcategoryLink}
              >
                <span className={styles.subcategoryName}>
                  {sub.name}
                  <span className={styles.subcategoryArrow}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
              </CategoryLink>
            ))}
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.filters}>
          <PriceRangeFilter />
        </div>
        <div className={styles.products}>
          <ProductList 
            products={products} 
            emptyMessage="No products found in this category"
           
          />
        </div>
      </div>
    </div>
  );
}
