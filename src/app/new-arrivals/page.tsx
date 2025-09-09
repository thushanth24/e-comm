'use client';

import { cache, useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { ArrowRight } from 'lucide-react';

// Import Button component with default import
import Button from '@/components/ui/Button';

// Import site config
import { siteConfig } from '@/config/site';

// Import styles
import styles from '@/styles/NewArrivals.module.scss';

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  inventory: number;
  featured: boolean;
  category_id: string;
  created_at: string;
  images: ProductImage[];
}

interface CategoryWithProducts extends Category {
  products: Product[];
}

// Type for the RPC response row
interface NewArrivalsRow {
  category_id: string;
  category_name: string;
  category_slug: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_description: string | null;
  product_price: number;
  product_inventory: number;
  product_featured: boolean;
  product_created_at: string;
  product_images: Array<{
    id: string;
    url: string;
    public_url: string;
    productId: string;
  }>;
}

const getNewArrivalsByCategory = cache(async (): Promise<CategoryWithProducts[]> => {
  noStore();
  
  try {
    console.log('Fetching new arrivals...');
    
    // First, verify Supabase is properly initialized
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Database connection error');
    }
    
    // Check if the function exists
    const { data: functionExists, error: checkError } = await supabase
      .rpc('get_new_arrivals_by_category', { category_limit: 1, products_per_category: 1 })
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('Error checking RPC function:', checkError);
      throw new Error(`Database function error: ${checkError.message}`);
    }
    
    console.log('RPC function exists, proceeding with full query...');
    
    // Fetch categories with their products in a single query using Supabase
    const { data, error } = await supabase
      .rpc('get_new_arrivals_by_category', {
        category_limit: 6,
        products_per_category: 4
      });

    if (error) {
      console.error('Supabase RPC error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    if (!data) {
      console.log('No data returned from new arrivals query');
      return [];
    }
    
    console.log('Received data from RPC:', data);
    
    // Transform the data to match our expected format
    const categoriesMap = new Map<string, CategoryWithProducts>();
    
    data.forEach((row: any, index: number) => {
      try {
        if (!row.category_id) {
          console.warn('Row missing category_id:', row);
          return;
        }
        
        const categoryId = row.category_id;
        
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, {
            id: categoryId,
            name: row.category_name || `Category ${categoryId}`,
            slug: row.category_slug || `category-${categoryId}`,
            products: []
          });
        }
        
        const category = categoriesMap.get(categoryId)!;
        
        // Only add the product if we don't have enough products yet
        if (category.products.length < 4 && row.product_id) {
          const productImages = Array.isArray(row.product_images) 
            ? row.product_images.filter((img: any) => img && (img.url || img.public_url))
            : [];
            
          category.products.push({
            id: row.product_id,
            name: row.product_name || 'Unnamed Product',
            slug: row.product_slug || `product-${row.product_id}`,
            description: row.product_description,
            price: Number(row.product_price) || 0,
            inventory: Number(row.product_inventory) || 0,
            featured: Boolean(row.product_featured),
            category_id: categoryId,
            created_at: row.product_created_at || new Date().toISOString(),
            images: productImages.map((img: any) => ({
              id: img.id || `img-${Math.random().toString(36).substr(2, 9)}`,
              url: img.public_url || img.url,
              productId: row.product_id
            }))
          });
        }
      } catch (rowError) {
        console.error(`Error processing row ${index}:`, rowError, 'Row data:', row);
      }
    });
    
    const result = Array.from(categoriesMap.values())
      .filter(category => category.products.length > 0);
      
    console.log('Processed categories:', result);
    return result;
      
  } catch (error) {
    console.error('Error in getNewArrivalsByCategory:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error; // Re-throw to be caught by the component
  }
});

// Import skeleton components from the components directory
import { CategorySectionSkeleton } from './components/CategorySectionSkeleton';

// Client component that will be hydrated on the client
function NewArrivalsContent() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching new arrivals data...');
      const data = await getNewArrivalsByCategory();
      console.log('Fetched data:', data);
      setCategories(data);
    } catch (err) {
      console.error('Error in fetchData:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      setError(err instanceof Error ? err.message : 'Failed to load new arrivals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, retryCount]);
  
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeletonGrid}>
            {[1, 2, 3].map((i) => (
              <CategorySectionSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Oops! Something went wrong</h2>
          <p>We couldn't load the new arrivals. {error}</p>
          <div className={styles.errorActions}>
            <button 
              onClick={handleRetry}
              className={styles.retryButton}
            >
              Try Again
            </button>
            <Link href="/" className={styles.homeButton}>
              Back to Home
            </Link>
          </div>
          <div className={styles.errorDetails}>
            <p>If the problem persists, please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>New Arrivals</h1>
        <p>Discover our latest products, carefully selected and organized by category</p>
      </div>
      
      {categories.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h2>No new arrivals at the moment</h2>
          <p>Check back soon for our latest products!</p>
          <Link href="/products" className={styles.browseButton}>
            Browse All Products
          </Link>
        </div>
      ) : (
        <Suspense fallback={[1, 2, 3].map((i) => <CategorySectionSkeleton key={i} />)}>
          <div className={styles.categoriesContainer}>
            {categories.map((category) => (
              <section key={category.id} className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <h2>{category.name}</h2>
                  <Link href={`/categories/${category.slug}`} className={styles.viewAllButton}>
                    View all <ArrowRight className={styles.arrowIcon} />
                  </Link>
                </div>
                
                <div className={styles.productsGrid}>
                  {category.products.map((product) => {
                    // Calculate discount for demo purposes
                    const hasDiscount = Math.random() > 0.7;
                    const discountPercent = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0;
                    const originalPrice = hasDiscount 
                      ? Math.round((product.price * 100) / (100 - discountPercent))
                      : product.price;
                    
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className={styles.productCard}
                      >
                        <div className={styles.imageContainer}>
                          <Image
                            src={product.images[0]?.url || '/images/placeholder-product.jpg'}
                            alt={product.name}
                            width={400}
                            height={400}
                            className={styles.productImage}
                            priority={false}
                          />
                          {hasDiscount && (
                            <div className={styles.discountBadge}>
                              -{discountPercent}%
                            </div>
                          )}
                        </div>
                        <div className={styles.productInfo}>
                          <h3 className={styles.productName}>
                            {product.name}
                          </h3>
                          <div className={styles.priceContainer}>
                            {hasDiscount && (
                              <span className={styles.originalPrice}>
                                LKR {originalPrice.toLocaleString('en-LK')}
                              </span>
                            )}
                            <span className={styles.currentPrice}>
                              LKR {product.price.toLocaleString('en-LK')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </Suspense>
      )}
    </main>
  );
}

// Page component that will be rendered on the server
export default function NewArrivalsPage() {
  return <NewArrivalsContent />;
}

// Add display names for better debugging
NewArrivalsPage.displayName = 'NewArrivalsPage';
NewArrivalsContent.displayName = 'NewArrivalsContent';
