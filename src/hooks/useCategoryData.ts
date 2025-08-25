import { useEffect, useState } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/lib/supabase';

export function useCategoryData(slug: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const { executeQuery } = useOptimizedQuery(`category-${slug}`);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data: categoryData, fromCache } = await executeQuery(
          async () => {
            const { data, error } = await supabase
              .from('Category')
              .select(`
                *,
                products:Product(*),
                parentCategory:Category!inner(*),
                childCategories:Category!inner(*)
              `)
              .eq('slug', slug)
              .single();

            if (error) throw error;
            return data;
          },
          { cacheKey: `category-${slug}` }
        );

        if (isMounted) {
          setData(categoryData);
          
          // Prefetch related categories in the background
          if (!fromCache) {
            prefetchRelatedCategories(categoryData);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch category'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [slug, executeQuery]);

  return { data, isLoading, error };
}

async function prefetchRelatedCategories(categoryData: any) {
  if (!categoryData) return;

  const prefetchPromises = [];
  
  // Prefetch parent category
  if (categoryData.parentCategory) {
    prefetchPromises.push(
      supabase
        .from('Category')
        .select('*')
        .eq('id', categoryData.parentCategory.id)
        .single()
    );
  }
  
  // Prefetch sibling categories
  if (categoryData.parentCategory?.id) {
    prefetchPromises.push(
      supabase
        .from('Category')
        .select('*')
        .eq('parentId', categoryData.parentCategory.id)
    );
  }

  // Prefetch child categories
  if (categoryData.childCategories?.length) {
    categoryData.childCategories.forEach((child: any) => {
      prefetchPromises.push(
        supabase
          .from('Category')
          .select('*')
          .eq('id', child.id)
          .single()
      );
    });
  }

  // Execute all prefetches in parallel but don't await
  Promise.allSettled(prefetchPromises).catch(console.error);
}
