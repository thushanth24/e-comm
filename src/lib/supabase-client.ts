import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);

// Delete a product by ID
export const deleteProduct = async (id: number) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// Types for product filters
type ProductFilters = {
  categoryId?: number;
  featured?: boolean;
  limit?: number;
  excludeId?: number;
};

// Helper functions for common operations
export const getProducts = async (filters: ProductFilters = {}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories!inner(*),
      product_images(*)
    `);

  // Apply filters if any
  if (filters.categoryId) {
    query = query.eq('categories.id', filters.categoryId);
  }
  if (filters.featured) {
    query = query.eq('featured', true);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.excludeId) {
    query = query.neq('id', filters.excludeId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(product => ({
    ...product,
    images: product.product_images,
    category: product.categories,
    product_images: undefined,
    categories: undefined
  }));
};

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(*),
      product_images(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    images: data.product_images,
    category: data.categories,
    product_images: undefined,
    categories: undefined
  };
};

interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  products_count: number;
  children: CategoryWithCount[];
}

// Simple function to count products per category
async function getProductCounts(): Promise<Array<{ category_id: number; count: number }>> {
  try {
    // First try to get counts using the RPC function
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_products_count_by_category')
      .select()
      .limit(1000);
    
    if (!rpcError && rpcData) return rpcData;
    
    // Fallback to manual counting
    const { data, error } = await supabase
      .from('products')
      .select('category_id')
      .not('category_id', 'is', null);
      
    if (error) throw error;
    
    if (data) {
      const counts = data.reduce((acc, { category_id }) => {
        if (category_id) {
          acc[category_id] = (acc[category_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);
      
      return Object.entries(counts).map(([category_id, count]) => ({
        category_id: parseInt(category_id, 10),
        count
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting product counts:', error);
    return [];
  }
}

/**
 * Fetches all categories with their hierarchy and product counts
 */
export const getCategories = async (): Promise<CategoryWithCount[]> => {
  try {
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (categoriesError) throw categoriesError;
    if (!categories?.length) return [];

    // Get product counts
    const productCounts = await getProductCounts();

    // Create a map of category_id to product count
    const categoryProductCounts = new Map<number, number>();
    productCounts.forEach(item => {
      if (item?.category_id) {
        categoryProductCounts.set(item.category_id, item.count);
      }
    });

    // Create a map of categories by ID for easy lookup
    const categoriesMap = new Map<number, CategoryWithCount>();
    const rootCategories: CategoryWithCount[] = [];

    // First pass: create all category nodes
    categories.forEach(category => {
      const categoryWithCount: CategoryWithCount = {
        ...category,
        products_count: categoryProductCounts.get(category.id) || 0,
        children: []
      };
      categoriesMap.set(category.id, categoryWithCount);
    });

    // Second pass: build the tree structure
    categories.forEach(category => {
      const categoryNode = categoriesMap.get(category.id);
      if (categoryNode) {
        if (category.parent_id) {
          const parent = categoriesMap.get(category.parent_id);
          if (parent) {
            parent.children.push(categoryNode);
          }
        } else {
          rootCategories.push(categoryNode);
        }
      }
    });

    // Sort categories alphabetically
    const sortCategories = (categories: CategoryWithCount[]) => {
      categories.sort((a, b) => a.name.localeCompare(b.name));
      categories.forEach(category => {
        if (category.children.length > 0) {
          sortCategories(category.children);
        }
      });
    };

    sortCategories(rootCategories);
    return rootCategories;
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
};

export const uploadFile = async (file: File, bucket = 'product-images') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrl
  };
};

export const deleteFile = async (path: string, bucket = 'product-images') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
    
  if (error) throw error;
  return true;
};
