import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';
import { CategoryLink } from '@/components/ui/CategoryLink';
import styles from '@/styles/CategoryPage.module.scss';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ minPrice?: string; maxPrice?: string }>;
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

interface Category {
  id: number;
  name: string;
  slug: string;
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
  // First get the category with its direct parent and children
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
  const parentHierarchy: Array<{ id: number; name: string; slug: string }> = [];
  let currentParent = category.parent;
  
  // We'll build the hierarchy in reverse order (from root to direct parent)
  const hierarchy: Array<{ id: number; name: string; slug: string }> = [];
  
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
  
  // Now build the final category info with hierarchy
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

// ✅ SEO metadata
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  if (!slug) {
    return {
      title: 'Category Not Found',
      description: 'No category specified.',
    };
  }

  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} - StyleStore`,
    description: `Browse our collection of ${category.name.toLowerCase()} clothing and accessories.`,
  };
}

// ✅ Main Category Page
export default async function CategoryPage(props: PageProps) {
  const { slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};

  if (!slug) notFound();

  const categoryInfo = await getCategoryInfo(slug.toLowerCase());
  if (!categoryInfo) notFound();

  const categoryIds = await getAllCategoryIds(slug.toLowerCase());

  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;

  const products = await getProducts(categoryIds, minPrice, maxPrice);

  // Function to generate breadcrumb items
  const Breadcrumb = ({ items }: { items: Array<{ name: string; slug: string }> }) => (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol>
        <li>
          <CategoryLink href="/">Home</CategoryLink>
        </li>
        {items.map((item, index) => (
          <li key={item.slug}>
            <span className={styles.separator} aria-hidden="true">&gt;</span>
            {index === items.length - 1 ? (
              <span className={styles.currentCategory}>{item.name}</span>
            ) : (
              <CategoryLink href={`/categories/${item.slug}`}>
                {item.name}
              </CategoryLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );

  // Prepare breadcrumb items
  const breadcrumbItems = [
    ...(categoryInfo.parentHierarchy || []),
    { name: categoryInfo.name, slug: categoryInfo.slug }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {categoryInfo.children.length > 0 && (
        <div className={styles.subcategories}>
          <div className={styles.subcategoriesInner}>
            {categoryInfo.children.map((sub: Category) => (
              <CategoryLink 
                key={sub.id} 
                href={`/categories/${sub.slug}`}
                className={styles.subcategoryLink}
              >
                <span className={styles.subcategoryName}>
                  {sub.name}
                  <span className={styles.subcategoryArrow}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
              </CategoryLink>
            ))}
          </div>
        </div>
      )}

  <div className={styles.layout}>
    <div className={styles.filters}>
      <PriceRangeFilter />
      {/* Show products under filter on mobile */}
      <div className={styles.mobileProducts}>
        <ProductList products={products} emptyMessage="No products found in this category" />
      </div>
    </div>
    <div className={styles.products}>
      <ProductList products={products} emptyMessage="No products found in this category" />
    </div>
  </div>
</div>

  );
}
