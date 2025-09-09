import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { Product } from '@/types';

type FileUploadOptions = {
  bucket?: string;
  path?: string;
  upsert?: boolean;
  cacheControl?: string;
};

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check your .env.local file.');
}

// Initialize Supabase client with auto-refresh and persistence
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

// Test the connection when the module loads
(async () => {
  try {
    const { data, error } = await supabase.from('Category').select('*').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
})();

// Storage functions
export const uploadFile = async (file: File, options: FileUploadOptions = {}) => {
  const {
    bucket = 'product-images',
    path = `${Date.now()}-${file.name}`,
    upsert = false,
    cacheControl = '3600',
  } = options;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl,
        upsert,
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

export const uploadFiles = async (files: File[], options: FileUploadOptions = {}) => {
  const uploadPromises = files.map(file => uploadFile(file, options));
  return Promise.all(uploadPromises);
};

export const deleteFile = async (path: string, bucket = 'product-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
};

export const deleteFiles = async (paths: string[], bucket = 'product-images') => {
  const deletePromises = paths.map(path => deleteFile(path, bucket));
  return Promise.all(deletePromises);
};

export const getPublicUrl = (path: string, bucket = 'product-images') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Helper function for handling Supabase errors
export const handleError = (error: any) => {
  if (!error) return null;
  
  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Supabase Error:', error);
  }
  
  // Return a user-friendly error message
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
  console.error('Supabase error details:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    status: error.status,
    stack: error.stack
  });
  throw error;
};

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    handleError(error);
    return [];
  }

  return data || [];
};

export const getProductById = async (id: number) => {
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    handleError(error);
    return null;
  }

  return data;
};

export const getProductBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from('Product')
      .select(`
        *,
        category:category_id (id, name, slug)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      // If no product found, return null instead of throwing an error
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    const errorDetails = handleError(error);
    console.error('Error in getProductBySlug:', errorDetails);
    throw new Error(errorDetails?.message || 'Failed to fetch product');
  }
};

export const saveProduct = async (productData: any) => {
  const { data, error } = await supabase
    .from('Product')
    .upsert(productData)
    .select()
    .single();

  if (error) {
    handleError(error);
    return null;
  }

  return data;
};

export const deleteProduct = async (id: number) => {
  const { error } = await supabase
    .from('Product')
    .delete()
    .eq('id', id);

  if (error) {
    handleError(error);
    return false;
  }

  return true;
};

// Categories
export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    handleError(error);
    return [];
  }

  if (!data) return [];

  // Create a map of categories by ID for easy lookup
  const categoryMap = new Map<number, Category>();
  const rootCategories: Category[] = [];
  
  // First pass: create all category objects
  data.forEach(cat => {
    const category: Category = {
      ...cat,
      parentId: cat.parentId ? Number(cat.parentId) : null,
      children: []
    };
    categoryMap.set(cat.id, category);
  });

  // Second pass: build the hierarchy and set parent references
  data.forEach(cat => {
    const category = categoryMap.get(cat.id);
    if (!category) return;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        // Set up the parent reference
        category.parent = parent;
        // Add to parent's children
        parent.children = parent.children || [];
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  // Return the root categories with their children
  return rootCategories;
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    if (error) handleError(error);
    return null;
  }

  // Ensure consistent typing with parentId as string | null
  return {
    ...data,
    parentId: data.parent_id?.toString() || null,
    children: []
  };
};

// Formats product data from the database for use in forms
export const formatProductForForm = (product: any) => {
  if (!product) return null;
  
  return {
    ...product,
    price: product.price ? Number(product.price) : 0,
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    stock: product.stock ? Number(product.stock) : 0,
    images: product.images || [],
    categories: product.categories || [],
    specifications: product.specifications || {},
  };
};

// Re-export storage functions for backward compatibility
export { uploadFile as uploadImage };

export interface CategoryWithProducts extends Category {
  products: Product[];
  parentCategory: Category | null;
  childCategories: Category[];
}

/**
 * Fetches a category with its products, parent, and children in a single query
 */
export const getCategoryWithProducts = async (slug: string): Promise<CategoryWithProducts | null> => {
  console.log(`[getCategoryWithProducts] Fetching category with slug: ${slug}`);
  
  try {
    // First, get the category
    const { data: categoryData, error: categoryError } = await supabase
      .from('Category')
      .select('*')
      .eq('slug', slug)
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      throw categoryError;
    }

    if (!categoryData) {
      console.error('No category found with slug:', slug);
      return null;
    }

    console.log(`[getCategoryWithProducts] Found category: ${categoryData.name} (ID: ${categoryData.id})`);

    // Get all category IDs to fetch products from (current + children)
    const getAllCategoryIds = async (parentId: number): Promise<number[]> => {
      const { data: childCategories, error } = await supabase
        .from('Category')
        .select('id')
        .eq('parentId', parentId);

      if (error) {
        console.error('Error fetching child categories:', error);
        throw error;
      }

      if (!childCategories || childCategories.length === 0) {
        return [parentId];
      }

      // Recursively get all child category IDs
      const childIds = await Promise.all(
        childCategories.map(child => getAllCategoryIds(child.id))
      );
      
      return [parentId, ...childIds.flat()];
    };

    // Get all category IDs including children
    const categoryIds = await getAllCategoryIds(categoryData.id);
    console.log(`[getCategoryWithProducts] Fetching products from category IDs:`, categoryIds);

    // Get products from all relevant categories
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select(`
        *,
        ProductImage(*)
      `)
      .in('categoryId', categoryIds);  // Match products in any of the category IDs

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    console.log(`[getCategoryWithProducts] Found ${products?.length || 0} products`);

    // Get child categories for the current category
    const { data: childCategories, error: childCategoriesError } = await supabase
      .from('Category')
      .select('*')
      .eq('parentId', categoryData.id);

    if (childCategoriesError) {
      console.error('Error fetching child categories:', childCategoriesError);
      throw childCategoriesError;
    }

    const safeChildCategories = childCategories || [];
    console.log(`[getCategoryWithProducts] Found ${safeChildCategories.length} child categories`);

    // Get parent category if exists
    let parentCategory = null;
    if (categoryData.parentId) {
      const { data: parentData, error: parentError } = await supabase
        .from('Category')
        .select('*')
        .eq('id', categoryData.parentId)
        .single();

      if (parentError) {
        console.error('Error fetching parent category:', parentError);
        throw parentError;
      }

      parentCategory = parentData;
    }

    // Transform the data to match our types
    const formattedCategory: CategoryWithProducts = {
      ...categoryData,
      parentId: categoryData.parentId || null,
      children: [],
      products: (products || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description || null,
        price: product.price,
        inventory: product.inventory || 0,
        isFeatured: product.isFeatured || product.featured || false,
        isArchived: false, // Archived status not supported in current schema
        categoryId: product.categoryId || product.category_id,
        createdAt: product.created_at,
        updatedAt: product.updated_at || new Date().toISOString(),
        images: (product.ProductImage || []).map((img: any) => ({
          id: img.id,
          public_url: img.public_url,
          is_primary: img.is_primary || false,
          position: img.position || 0,
          productId: product.id
        }))
      })),
      parentCategory: parentCategory ? {
        id: parentCategory.id,
        name: parentCategory.name,
        slug: parentCategory.slug,
        parentId: parentCategory.parentId || null,
        createdAt: parentCategory.createdAt,
        updatedAt: parentCategory.updatedAt
      } : null,
      childCategories: safeChildCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId || null,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))
    };

    return formattedCategory;
  } catch (error) {
    console.error('Error in getCategoryWithProducts:', error);
    return null;
  }
};
