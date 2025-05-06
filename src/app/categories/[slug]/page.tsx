import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/CategoryPage.module.scss';


interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ minPrice?: string; maxPrice?: string }>;
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
    const children = allCategories.filter(cat => cat.parentId === parentId);
    return children.flatMap(child => [child.id, ...collectIds(child.id)]);
  }

  return [root.id, ...collectIds(root.id)];
}

// 💡 Fetch category info for name + children (for display only)
async function getCategoryInfo(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        include: { children: true },
      },
    },
  });
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

  return (
    <div className={styles.container}>
  <h1>{categoryInfo.name}</h1>

  {categoryInfo.children.length > 0 && (
    <div className={styles.subcategories}>
      {categoryInfo.children.map((sub) => (
        <Link key={sub.id} href={`/categories/${sub.slug}`}>
          <p>{sub.name}</p>
        </Link>
      ))}
    </div>
  )}

  <div className={styles.layout}>
    <div className={styles.filters}>
      <PriceRangeFilter />
    </div>
    <div className={styles.products}>
      <ProductList products={products} emptyMessage="No products found in this category" />
    </div>
  </div>
</div>

  );
}
