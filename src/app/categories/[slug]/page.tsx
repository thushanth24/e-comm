import { notFound } from 'next/navigation';
import { supabase, getCategoryBySlug, getCategories, getProducts as getSupabaseProducts } from '@/lib/supabase';
import ClientCategoryPage from './ClientCategoryPage';

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  parentId: string | null;
  parent: {
    id: number;
    name: string;
    slug: string;
  } | null;
  children: { id: number; name: string; slug: string }[];
  parentHierarchy?: Array<{ id: number; name: string; slug: string }>;
}

interface CategoryNode {
  id: number;
  parentId: string | null;
  slug: string;
  name: string;
  parent_id?: string | null; // Keep for backward compatibility if needed
}

// 🔁 Get all descendant category IDs recursively
async function getAllCategoryIds(slug: string): Promise<number[]> {
  const allCategories = await getCategories();
  const root = allCategories.find(cat => cat.slug === slug);
  
  if (!root) return [];

  function collectIds(parentId: string | null): number[] {
    if (parentId === null) return [];
    const children = allCategories.filter((cat) => cat.parentId === parentId);
    return children.flatMap((child) => [child.id, ...collectIds(child.id.toString())]);
  }

  return [root.id, ...collectIds(root.id.toString())];
}

// 💡 Fetch category info with parent hierarchy
async function getCategoryInfo(slug: string): Promise<CategoryInfo | null> {
  const category = await getCategoryBySlug(slug);
  if (!category) return null;

  const allCategories = await getCategories();
  
  // Build the parent hierarchy
  const parentHierarchy: Array<{ id: number; name: string; slug: string }> = [];
  
  // Helper function to fetch parent hierarchy
  function buildParentHierarchy(categoryId: string | null) {
    if (!categoryId) return;
    
    const parent = allCategories.find(cat => cat.id.toString() === categoryId);
    if (parent) {
      parentHierarchy.unshift({
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
      });
      
      if (parent.parentId) {
        buildParentHierarchy(parent.parentId.toString());
      }
    }
  };

  // Build the hierarchy if the category has a parent
  if (category.parentId) {
    buildParentHierarchy(category.parentId);
  }

  // Get children categories
  const children = allCategories.filter(cat => cat.parentId === category.id.toString());

  return {
    ...category,
    parentId: category.parentId,
    parent: category.parentId ? allCategories.find(cat => cat.id.toString() === category.parentId) || null : null,
    children: children.map(child => ({
      id: child.id,
      name: child.name,
      slug: child.slug
    })),
    parentHierarchy,
  };
}

interface ProductImage {
  id: number;
  publicUrl: string;
  productId: number;
  isPrimary?: boolean;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  inventory: number;
  categoryId: number;
  description?: string;
  isFeatured?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  ProductImage: ProductImage[];
}

async function getProducts(categoryIds: number[], minPrice?: number, maxPrice?: number) {
  try {
    let query = supabase
      .from('Product')
      .select('*, ProductImage(*)')
      .in('categoryId', categoryIds);

    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    const { data: products, error } = await query;
    if (error) throw error;
    
    // Transform the data to match the expected format
    return (products || []).map(product => ({
      ...product,
      // Map ProductImage array to the expected images format
      images: (product.ProductImage || []).map((img: ProductImage) => ({
        public_url: img.publicUrl,
        // Include other necessary fields if needed
        id: img.id,
        is_primary: img.isPrimary,
        position: img.position
      }))
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Generate static params at build time
export async function generateStaticParams() {
  // Fetch all categories to pre-render at build time
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');
  
  return categories?.map(({ slug }) => ({ slug })) || [];
}

// Main Category Page - Server Component
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    // Ensure params and searchParams are properly awaited
    const [resolvedParams, resolvedSearchParams] = await Promise.all([
      Promise.resolve(params),
      Promise.resolve(searchParams || {})
    ]);
    
    // Destructure and validate params after awaiting
    const { slug } = resolvedParams;
    if (!slug) notFound();
    
    // Process searchParams safely
    const priceFilters = {
      minPrice: resolvedSearchParams.minPrice 
        ? Number(Array.isArray(resolvedSearchParams.minPrice) ? resolvedSearchParams.minPrice[0] : resolvedSearchParams.minPrice)
        : undefined,
      maxPrice: resolvedSearchParams.maxPrice 
        ? Number(Array.isArray(resolvedSearchParams.maxPrice) ? resolvedSearchParams.maxPrice[0] : resolvedSearchParams.maxPrice)
        : undefined,
    };

    // Server-side data fetching
    const [categoryInfo, categoryIds] = await Promise.all([
      getCategoryInfo(slug.toLowerCase()),
      getAllCategoryIds(slug.toLowerCase())
    ]);
    
    if (!categoryInfo) notFound();
    
    const products = await getProducts(
      categoryIds,
      priceFilters.minPrice,
      priceFilters.maxPrice
    );
    
    // Pass data to client component
    return (
      <ClientCategoryPage 
        categoryInfo={categoryInfo} 
        products={products} 
        minPrice={priceFilters.minPrice?.toString()}
        maxPrice={priceFilters.maxPrice?.toString()}
      />
    );
  } catch (error) {
    console.error('Error in CategoryPage:', error);
    notFound();
  }
}

// Client component is now in a separate file
