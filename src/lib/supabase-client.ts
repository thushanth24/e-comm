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
    .from('Product')
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
// Type for the product with relations
type ProductWithRelations = Database['public']['Tables']['Product']['Row'] & {
  category: Database['public']['Tables']['Category']['Row'];
  ProductImage: Database['public']['Tables']['ProductImage']['Row'][];
};

export const getProducts = async (filters: ProductFilters = {}) => {
  try {
    console.log('Fetching products with filters:', filters);
    
    // Start building the query
    console.log('Creating Supabase query...');
    let query = supabase
      .from('Product')
      .select(`
        *,
        category:categoryId(*),
        ProductImage(*)
      `);

    // Apply filters if any
    if (filters.categoryId) {
      console.log('Applying category filter:', filters.categoryId);
      query = query.eq('categoryId', filters.categoryId);
    }
    if (filters.featured) {
      console.log('Filtering featured products');
      query = query.eq('featured', true);
    }
    if (filters.limit) {
      console.log('Applying limit:', filters.limit);
      query = query.limit(filters.limit);
    }
    if (filters.excludeId) {
      console.log('Excluding product ID:', filters.excludeId);
      query = query.neq('id', filters.excludeId);
    }

    // Execute the query
    console.log('Executing query...');
    const result = await query.order('createdAt', { ascending: false });
    
    console.log('Query executed. Status:', result.status, 'Status Text:', result.statusText);
    
    if (result.error) {
      console.error('Full error object:', JSON.stringify(result.error, null, 2));
      console.error('Supabase query error details:', {
        message: result.error.message,
        name: result.error.name,
        details: (result.error as any).details,
        hint: (result.error as any).hint,
        code: (result.error as any).code,
        status: (result.error as any).status,
        statusCode: (result.error as any).statusCode
      });
      
      throw new Error(`Failed to fetch products: ${result.error.message}`);
    }
    
    const data = result.data;
    if (!data) {
      console.warn('No products found');
      return [];
    }
    
    // Transform the data to match the expected format
    return data.map(product => ({
      ...product,
      images: product.ProductImage || [],
      category: product.category || null,
      product_images: undefined
    }));
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const getProductBySlug = async (slug: string) => {
  try {
    console.log('Fetching product by slug:', slug);
    
    const { data, error, status, statusText } = await supabase
      .from('Product')
      .select(`
        *,
        category:categoryId(*),
        ProductImage(*)
      `)
      .eq('slug', slug)
      .single();

    console.log('Product by slug query result:', { 
      data: !!data, 
      error, 
      status, 
      statusText 
    });

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        console.log('Product not found for slug:', slug);
        return null;
      }
      console.error('Error fetching product by slug:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    if (!data) {
      console.warn('No product found for slug:', slug);
      return null;
    }

    return {
      ...data,
      images: data.ProductImage || [],
      category: data.category || null,
      product_images: undefined
    };
  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    throw error; // Re-throw to be handled by the caller
  }
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
async function getProductCounts(): Promise<Array<{ categoryId: number; count: number }>> {
  console.log('Getting product counts...');
  
  try {
    // First try to get counts using the RPC function
    console.log('Attempting to use RPC function...');
    const { data: rpcData, error: rpcError, status: rpcStatus } = await supabase
      .rpc('get_products_count_by_category')
      .select()
      .limit(1000);
    
    console.log('RPC function result:', { rpcData, rpcError, rpcStatus });
    
    if (!rpcError && rpcData) {
      console.log('Using RPC function results');
      return rpcData;
    }
    
    console.log('Falling back to manual counting...');
    
    // Fallback to manual counting
    console.log('Starting manual count of products by category...');
    try {
      const { data, error, status, statusText, count } = await supabase
        .from('Product') // Make sure this matches your actual table name
        .select('categoryId', { count: 'exact' })
        .not('categoryId', 'is', null);
        
      console.log('Manual count query result:', { 
        data: data?.length, 
        error, 
        status, 
        statusText,
        count 
      });
      
      if (error) {
        console.error('Error in manual count query:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      if (!data) {
        console.warn('No data returned from manual count query');
        return [];
      }
    
      const counts = data.reduce((acc, { categoryId }) => {
        if (categoryId) {
          acc[categoryId] = (acc[categoryId] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);
      
      const result = Object.entries(counts).map(([categoryId, count]) => ({
        categoryId: parseInt(categoryId, 10),
        count
      }));
      
      console.log('Processed product counts:', result);
      return result;
    } catch (error) {
      console.error('Error in manual counting process:', error);
      return [];
    }
    
    console.warn('No product data available for counting');
    return [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : 'An unknown error occurred';
      
    console.error('Error in getProductCounts:', {
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
    return [];
  }
}

/**
 * Fetches all categories with their hierarchy and product counts
 */
export const getCategories = async (): Promise<CategoryWithCount[]> => {
  try {
    console.log('Initializing Supabase categories fetch...');
    
    // Verify Supabase is initialized
    if (!supabase) {
      const error = new Error('Supabase client is not initialized');
      console.error('Supabase client error:', error);
      throw error;
    }

    // Log Supabase configuration for debugging
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Get all categories with explicit column selection
    const { data, error, status, statusText, count } = await supabase
      .from('Category')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });
      
    console.log('Supabase query result:', {
      data: data?.length,
      error,
      status,
      statusText,
      count
    });
    
    if (error) {
      console.error('Supabase categories query error:', {
        status,
        statusText,
        error,
        timestamp: new Date().toISOString(),
        config: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          table: 'Category'
        }
      });
      throw error;
    }
    
    const categories = data || [];
    console.log(`Fetched ${categories.length} categories`);
    if (!categories.length) {
      console.warn('No categories found in the database');
      return [];
    }

    // Get product counts
    const productCounts = await getProductCounts();

    // Create a map of category_id to product count
    const categoryProductCounts = new Map<number, number>();
    productCounts.forEach(item => {
if (item?.categoryId) {
        categoryProductCounts.set(item.categoryId, item.count);
      }
    });

    // Create a map of categories by ID for easy lookup
    const categoriesMap = new Map<number, CategoryWithCount>();
    const rootCategories: CategoryWithCount[] = [];

    // First pass: create all category nodes with proper field mapping
    categories.forEach(category => {
      const categoryWithCount: CategoryWithCount = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        parent_id: category.parentId, // Map parentId to parent_id
        description: category.description || null,
        created_at: category.createdAt, // Map createdAt to created_at
        updated_at: category.updatedAt, // Map updatedAt to updated_at
        products_count: categoryProductCounts.get(category.id) || 0,
        children: []
      };
      categoriesMap.set(category.id, categoryWithCount);
    });

    // Second pass: build the tree structure
    categories.forEach(category => {
      const categoryNode = categoriesMap.get(category.id);
      if (categoryNode) {
        if (category.parentId) { // Use parentId instead of parent_id
          const parent = categoriesMap.get(category.parentId);
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
