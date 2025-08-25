import { notFound } from 'next/navigation';
import { getCategoryWithProducts } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import OptimizedCategoryPage from './OptimizedCategoryPage';
import { checkEnvVars } from '@/lib/check-env';

// Check environment variables at build time
checkEnvVars();

// Enable experimental optimizations
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 3600; // Revalidate at most every hour

// Prefetch category data for better performance
async function prefetchCategoryData(slug: string) {
  try {
    // Use a more efficient query with proper indexing
    const { data: categoryData, error } = await supabase.rpc('get_category_with_products', {
      category_slug: slug,
      page_size: 24, // Adjust based on your needs
      page: 1
    });

    if (error) throw error;
    return categoryData;
  } catch (error) {
    console.error('Error prefetching category data:', error);
    return null;
  }
}

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Generate static params at build time
export async function generateStaticParams() {
  // Fetch all categories to pre-render at build time
  const { data: categories } = await supabase
    .from('Category')
    .select('slug');
  
  return categories?.map(({ slug }) => ({ slug })) || [];
}

// Main Category Page - Server Component
export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  if (!slug) {
    console.error('No slug provided in URL');
    notFound();
  }

  console.log(`[CategoryPage] Loading category: ${slug}`);
  
  try {
    // Fetch all category data in a single optimized query
    const categoryData = await getCategoryWithProducts(slug.toLowerCase());
    
    if (!categoryData) {
      console.error(`[CategoryPage] Category not found: ${slug}`);
      notFound();
    }

    // Prefetch sibling categories for faster navigation
    const parentId = categoryData.parentCategory?.id;
    if (parentId && typeof window !== 'undefined') {
      // Prefetch sibling categories in the background
      (async () => {
        try {
          const { data } = await supabase
            .from('Category')
            .select('*')
            .eq('parentId', parentId);

          // Cache the results
          data?.forEach(cat => {
            const cacheKey = `category-${cat.slug}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(cat));
          });
        } catch (err) {
          console.error('Error prefetching sibling categories:', err);
        }
      })();
    }

    console.log(`[CategoryPage] Successfully loaded category: ${categoryData.name}`);
    console.log(`[CategoryPage] Found ${categoryData.products?.length || 0} products`);
    console.log(`[CategoryPage] Found ${categoryData.childCategories?.length || 0} subcategories`);

    return (
      <OptimizedCategoryPage 
        categoryData={categoryData} 
        searchParams={searchParams}
      />
    );
  } catch (error: unknown) {
    console.error('Error in CategoryPage:', error);
    if (error && typeof error === 'object') {
      if ('request' in error) {
        console.error('No response received:', (error as any).request);
      } else if ('message' in error) {
        console.error('Error message:', (error as Error).message);
      }
    }
    notFound();
  }
}

// Client component is now in a separate file
