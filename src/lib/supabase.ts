import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type FileUploadOptions = {
  bucket?: string;
  path?: string;
  upsert?: boolean;
  cacheControl?: string;
};

// Initialize Supabase client with auto-refresh and persistence
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  parentId: string | null;
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

  // Ensure consistent typing with parentId as string | null
  return (data || []).map(category => ({
    ...category,
    parentId: category.parent_id?.toString() || null,
    children: []
  }));
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
