import { notFound } from 'next/navigation';
import { getCategoryWithProducts } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import OptimizedCategoryPage from './OptimizedCategoryPage';
import { checkEnvVars } from '@/lib/check-env';

// Check environment variables at build time
checkEnvVars();

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate at most every hour

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
  const { slug } = params;
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

    console.log(`[CategoryPage] Successfully loaded category: ${categoryData.name}`);
    console.log(`[CategoryPage] Found ${categoryData.products?.length || 0} products`);
    console.log(`[CategoryPage] Found ${categoryData.childCategories?.length || 0} subcategories`);

    // Process price filters if any
    const minPrice = searchParams?.minPrice ? Number(searchParams.minPrice) : undefined;
    const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined;

    return (
      <OptimizedCategoryPage 
        categoryData={categoryData}
        searchParams={searchParams}
      />
    );
  } catch (error: any) {
    console.error('[CategoryPage] Error loading category page:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    notFound();
  }
}

// Client component is now in a separate file
