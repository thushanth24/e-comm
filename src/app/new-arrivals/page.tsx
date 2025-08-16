'use client';

import { cache, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { ArrowRight } from 'lucide-react';

// Import Button component with default import
import dynamic from 'next/dynamic';
const Button = dynamic(() => import('@/components/ui/Button'), { ssr: false });

// Import site config
import { siteConfig } from '@/config/site';

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
  product_id: string;
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
    product_id: string;
  }>;
}

const getNewArrivalsByCategory = cache(async (): Promise<CategoryWithProducts[]> => {
  noStore();
  
  try {
    // Fetch categories with their products in a single query using Supabase
    const { data, error } = await supabase
      .rpc('get_new_arrivals_by_category', {
        category_limit: 6,
        products_per_category: 4
      }) as { data: NewArrivalsRow[] | null; error: any };

    if (error) throw error;
    if (!data) return [];
    
    // Transform the data to match our expected format
    const categoriesMap = new Map<string, CategoryWithProducts>();
    
    data.forEach((row) => {
      const categoryId = row.category_id;
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: row.category_name,
          slug: row.category_slug,
          products: []
        });
      }
      
      const category = categoriesMap.get(categoryId)!;
      
      // Only add the product if it has images and we don't have enough products yet
      const productImages = Array.isArray(row.product_images) ? row.product_images : [];
      
      if (productImages.length > 0 && category.products.length < 4) {
        category.products.push({
          id: row.product_id,
          name: row.product_name,
          slug: row.product_slug,
          description: row.product_description,
          price: Number(row.product_price),
          inventory: row.product_inventory,
          featured: row.product_featured,
          category_id: categoryId,
          created_at: row.product_created_at,
          images: productImages.map((img) => ({
            id: img.id,
            url: img.url,
            product_id: row.product_id
          }))
        });
      }
    });
    
    // Convert map to array and filter out categories with no products
    return Array.from(categoriesMap.values())
      .filter(category => category.products.length > 0);
      
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
});

// Import skeleton components from the components directory
import { CategorySectionSkeleton } from './components/CategorySectionSkeleton';

// Client component that will be hydrated on the client
function NewArrivalsContent() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNewArrivalsByCategory();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load new arrivals:', err);
        setError('Failed to load new arrivals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="space-y-16">
          {[1, 2, 3].map((i) => (
            <CategorySectionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
          <p className="font-medium">Error loading content</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container py-8 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          New Arrivals
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our latest products, carefully selected and organized by category
        </p>
      </div>
      
      {categories.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-semibold mb-2">No new arrivals at the moment</h2>
          <p className="text-muted-foreground mb-6">Check back soon for our latest products!</p>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      ) : (
        <Suspense fallback={[1, 2, 3].map((i) => <CategorySectionSkeleton key={i} />)}>
          <div className="space-y-16">
            {categories.map((category) => (
              <section key={category.id} className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <Button variant="ghost" asChild>
                    <Link href={`/categories/${category.slug}`} className="flex items-center gap-1">
                      View all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                        className="group block overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={product.images[0]?.url || '/placeholder.svg'}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-90"
                            priority={false}
                          />
                          {hasDiscount && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{discountPercent}%
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <h3 className="font-medium text-gray-900 line-clamp-2 h-12">
                            {product.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            {hasDiscount && (
                              <span className="text-sm text-gray-500 line-through">
                                LKR {originalPrice.toLocaleString('en-LK')}
                              </span>
                            )}
                            <span className="font-semibold">
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
