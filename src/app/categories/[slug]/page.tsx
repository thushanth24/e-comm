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
    
    return products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Main Category Page - Server Component
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const minPrice = Array.isArray(searchParams?.minPrice) ? searchParams.minPrice[0] : searchParams?.minPrice;
  const maxPrice = Array.isArray(searchParams?.maxPrice) ? searchParams.maxPrice[0] : searchParams?.maxPrice;
  
  if (!slug) notFound();

  // Server-side data fetching
  const categoryInfo = await getCategoryInfo(slug.toLowerCase());
  if (!categoryInfo) notFound();
  
  const categoryIds = await getAllCategoryIds(slug.toLowerCase());
  const products = await getProducts(
    categoryIds,
    minPrice ? parseFloat(minPrice) : undefined,
    maxPrice ? parseFloat(maxPrice) : undefined
  );
  
  return <ClientCategoryPage 
    categoryInfo={categoryInfo} 
    products={products} 
    minPrice={minPrice}
    maxPrice={maxPrice}
  />;
}

// Client component is now in a separate file
