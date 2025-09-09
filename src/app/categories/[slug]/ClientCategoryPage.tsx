'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { InstantLink } from '@/components/ui/InstantLink';
import { useCategoryData } from '@/hooks/useCategoryData';
import { ProductListSkeleton } from '@/components/ui/ProductSkeleton';
import styles from '@/styles/CategoryPage.module.scss';
import { useRouter } from 'next/router';
import { Product } from '@/types';

// Dynamically import heavy components
const ProductList = dynamic(
  () => import('@/components/ui/ProductList').then(mod => mod.default),
  { 
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-80" />
        ))}
      </div>
    )
  }
);

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

// Dynamically import PriceRangeFilter
const PriceRangeFilter = dynamic(
  () => import('@/components/ui/PriceRangeFilter')
);

export default function ClientCategoryPage({ 
  initialData,
  slug
}: { 
  initialData?: {
    categoryInfo: CategoryInfo;
    products: any[];
  };
  slug: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  
  // Use client-side data fetching with initial data for instant loading
  const { data: categoryData, isLoading } = useCategoryData(slug);
  
  // Use initial data if available, otherwise use client-side data
  const { categoryInfo, products } = useMemo(() => {
    if (categoryData) {
      return {
        categoryInfo: categoryData.categoryInfo,
        products: categoryData.products
      };
    }
    return initialData || { categoryInfo: null, products: [] };
  }, [categoryData, initialData]);

  // Handle category not found
  useEffect(() => {
    if (!isLoading && !categoryInfo) {
      router.replace('/404');
    }
  }, [categoryInfo, isLoading, router]);

  // Show loading state
  if (isLoading && !initialData) {
    return (
      <div className="container mx-auto p-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
        <ProductListSkeleton count={8} />
      </div>
    );
  }

  // Memoize breadcrumb to prevent unnecessary re-renders
  const Breadcrumb = useMemo(() => {
    return function Breadcrumb({ items }: { items: Array<{ name: string; slug: string }> }) {
      return (
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <InstantLink href="/" prefetchStrategy="viewport">
                Home
              </InstantLink>
            </li>
            {items.map((item, index) => (
              <li key={item.slug}>
                <span className={styles.separator} aria-hidden="true">&gt;</span>
                {index === items.length - 1 ? (
                  <span className={styles.currentCategory}>{item.name}</span>
                ) : (
                  <InstantLink 
                    href={`/categories/${item.slug}`}
                    prefetchStrategy="viewport"
                    className="hover:text-primary transition-colors"
                  >
                    {item.name}
                  </InstantLink>
                )}
              </li>
            ))}
          </ol>
        </nav>
      );
    };
  }, []);
  
  // Memoize child category items to prevent unnecessary re-renders
  const renderChildCategories = useCallback((children: Array<{id: number; name: string; slug: string}>) => {
    return children.map((child) => (
      <InstantLink
        key={child.id}
        href={`/categories/${child.slug}`}
        prefetchStrategy="viewport"
        className={`${styles.subcategoryLink} ${
          searchParams?.get('category') === child.slug ? styles.active : ''
        }`}
      >
        <span className={styles.subcategoryName}>
          {child.name}
          <span className={styles.subcategoryArrow}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        </span>
      </InstantLink>
    ));
  }, [searchParams]);

  // Memoize breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(() => {
    const items: Array<{name: string; slug: string}> = [];
    
    // Add parent hierarchy if available
    if (categoryInfo.parentHierarchy?.length) {
      items.push(...categoryInfo.parentHierarchy.map((parent: {name: string; slug: string}) => ({
        name: parent.name,
        slug: parent.slug
      })));
    }
    
    // Add current category
    if (categoryInfo.name && categoryInfo.slug) {
      items.push({
        name: categoryInfo.name,
        slug: categoryInfo.slug
      });
    }
    
    return items;
  }, [categoryInfo.parentHierarchy, categoryInfo.name, categoryInfo.slug]);

  // Memoize filtered products with active state
  const filteredProducts = useMemo(() => {
    if (!products?.length) return [];
    
    const minPriceFilter = searchParams?.get('minPrice');
    const maxPriceFilter = searchParams?.get('maxPrice');
    
    return (products as Product[])
      .filter((product) => {
        const price = product.price;
        const minPrice = minPriceFilter ? parseFloat(minPriceFilter) : -Infinity;
        const maxPrice = maxPriceFilter ? parseFloat(maxPriceFilter) : Infinity;
        
        return price >= minPrice && price <= maxPrice;
      })
      .map((product) => ({
        ...product,
        isActive: product.categoryId === categoryInfo?.id
      }));
  }, [products, searchParams, categoryInfo?.id]);

  return (
    <div className={`${styles.container} ${isPending ? styles.pageTransition : ''}`}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <h1 className={styles.categoryTitle}>{categoryInfo.name}</h1>

      {categoryInfo.children?.length > 0 && (
        <div className={styles.subcategories}>
          <div className={styles.subcategoriesInner}>
            {renderChildCategories(categoryInfo.children)}
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.filters}>
          <PriceRangeFilter />
        </div>
        <div className={styles.products}>
          <ProductList 
            products={filteredProducts.map((product) => ({
              ...product,
              isActive: (product as any).isActive ?? false
            }))} 
            emptyMessage="No products found in this category"
          />
        </div>
      </div>
    </div>
  );
}
