'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CategoryLink } from '@/components/ui/CategoryLink';
import ProductList from '@/components/ui/ProductList';
import styles from '@/styles/CategoryPage.module.scss';
import { Product } from '@/types';

// Dynamically import PriceRangeFilter
const PriceRangeFilter = dynamic(
  () => import('@/components/ui/PriceRangeFilter')
);

interface OptimizedCategoryPageProps {
  categoryData: {
    id: number;
    name: string;
    slug: string;
    parentCategory: {
      id: number;
      name: string;
      slug: string;
    } | null;
    childCategories: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    products: Product[];
    parentHierarchy?: Array<{ id: number; name: string; slug: string }>;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function OptimizedCategoryPage({ 
  categoryData,
  searchParams 
}: OptimizedCategoryPageProps) {
  const [isClient, setIsClient] = useState(false);
  const params = useSearchParams();
  const minPrice = params?.get('minPrice');
  const maxPrice = params?.get('maxPrice');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Transform products to match the expected format and filter by price range
  const filteredProducts = categoryData.products
    .filter(product => {
      if (minPrice && product.price < Number(minPrice)) return false;
      if (maxPrice && product.price > Number(maxPrice)) return false;
      return true;
    })
    .map(product => ({
      ...product,
      images: product.images || []
    }));

  // Prepare breadcrumb items with proper hierarchy
  const breadcrumbItems = [];
  
  // Always add Home first
  breadcrumbItems.push({ name: 'Home', slug: '' });
  
  // Helper function to build breadcrumb hierarchy
  const buildBreadcrumbs = (category: any): { name: string; slug: string }[] => {
    if (!category) return [];
    
    const crumbs: { name: string; slug: string }[] = [];
    
    // Add parent crumbs first (if any)
    if (category.parentCategory) {
      const parentCrumbs = buildBreadcrumbs(category.parentCategory);
      crumbs.push(...parentCrumbs);
    }
    
    // Add current category if not already added
    if (!crumbs.some(crumb => crumb.slug === category.slug)) {
      crumbs.push({
        name: category.name,
        slug: category.slug
      });
    }
    
    return crumbs;
  };
  
  // Build breadcrumbs for current category
  const categoryCrumbs = buildBreadcrumbs(categoryData);
  breadcrumbItems.push(...categoryCrumbs);

  // Function to generate breadcrumb items
  const Breadcrumb = ({ items }: { items: Array<{ name: string; slug: string }> }) => (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href = item.slug ? `/categories/${item.slug}` : '/';
          
          return (
            <li key={`${item.slug}-${index}`}>
              {index > 0 && <span className={styles.separator} aria-hidden="true">&gt;</span>}
              {isLast ? (
                <span className={styles.currentCategory}>{item.name}</span>
              ) : (
                <CategoryLink href={href}>
                  {item.name}
                </CategoryLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {categoryData.childCategories.length > 0 && (
        <div className={styles.subcategories}>
          <div className={styles.subcategoriesInner}>
            {categoryData.childCategories.map((sub) => (
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
            products={filteredProducts} 
            emptyMessage="No products found in this category"
          />
          
          {/* Pagination */}
          {categoryData.pagination && categoryData.pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {((categoryData.pagination.page - 1) * categoryData.pagination.pageSize) + 1} to{' '}
                {Math.min(categoryData.pagination.page * categoryData.pagination.pageSize, categoryData.pagination.total)} of{' '}
                {categoryData.pagination.total} products
              </div>
              <div className={styles.paginationControls}>
                {categoryData.pagination.page > 1 && (
                  <a 
                    href={`/categories/${categoryData.slug}?page=${categoryData.pagination.page - 1}`}
                    className={styles.paginationButton}
                  >
                    Previous
                  </a>
                )}
                <span className={styles.paginationPage}>
                  Page {categoryData.pagination.page} of {categoryData.pagination.totalPages}
                </span>
                {categoryData.pagination.page < categoryData.pagination.totalPages && (
                  <a 
                    href={`/categories/${categoryData.slug}?page=${categoryData.pagination.page + 1}`}
                    className={styles.paginationButton}
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
