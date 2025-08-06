import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ClientCategoryPage from './ClientCategoryPage';

interface PageProps {
  params: { slug: string | string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
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
  parentId: number | null;
}

// 🔁 Get all descendant category IDs recursively
async function getAllCategoryIds(slug: string): Promise<number[]> {
  const root = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!root) return [];

  const allCategories = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });

  function collectIds(parentId: number): number[] {
    const children = allCategories.filter((cat: CategoryNode) => cat.parentId === parentId);
    return children.flatMap((child: CategoryNode) => [child.id, ...collectIds(child.id)]);
  }

  return [root.id, ...collectIds(root.id)];
}

// 💡 Fetch category info with parent hierarchy
async function getCategoryInfo(slug: string): Promise<CategoryInfo | null> {
  // Get the category with its direct parent and children
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true
        }
      }
    },
  });

  if (!category) return null;

  // Get the full parent hierarchy
  const hierarchy: Array<{ id: number; name: string; slug: string }> = [];
  let currentParent = category.parent;
  
  while (currentParent) {
    hierarchy.unshift({
      id: currentParent.id,
      name: currentParent.name,
      slug: currentParent.slug
    });
    
    // Get the next parent
    const nextParent = await prisma.category.findUnique({
      where: { id: currentParent.id },
      select: {
        id: true,
        name: true,
        slug: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true
          }
        }
      },
    });
    
    currentParent = nextParent?.parent || null;
  }
  
  return {
    ...category,
    parent: hierarchy.length > 0 ? {
      id: hierarchy[hierarchy.length - 1].id,
      name: hierarchy[hierarchy.length - 1].name,
      slug: hierarchy[hierarchy.length - 1].slug
    } : null,
    children: category.children || [],
    parentHierarchy: hierarchy
  };
}

async function getProducts(categoryIds: number[], minPrice?: number, maxPrice?: number) {
  const whereClause: any = {
    categoryId: { in: categoryIds },
  };

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
  }

  return await prisma.product.findMany({
    where: whereClause,
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Main Category Page - Server Component
export default async function CategoryPage({ params, searchParams }: PageProps) {
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
