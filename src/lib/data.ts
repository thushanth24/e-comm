import { getProducts, getProductBySlug, getCategories } from './supabase-client';

export async function fetchProducts(filters = {}) {
  try {
    return await getProducts(filters);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    return await getProductBySlug(slug);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchCategories() {
  try {
    return await getCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Example of a React Query hook for products
export const productsQuery = (filters = {}) => ({
  queryKey: ['products', filters],
  queryFn: () => getProducts(filters),
});

// Example of a React Query hook for a single product
export const productBySlugQuery = (slug: string) => ({
  queryKey: ['product', slug],
  queryFn: () => getProductBySlug(slug),
  enabled: !!slug,
});
