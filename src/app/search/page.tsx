import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';
import styles from '@/styles/SearchPage.module.scss';

interface Category {
  id: number;
  slug: string;
  name: string;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  images: { url: string }[];
}

type SearchParams = {
  query?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
};



async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true },
  });
  return categories;
}

async function searchProducts(params: SearchParams) {
  const { query, category, minPrice, maxPrice } = params;

  const whereClause: any = {};

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (category) {
    whereClause.category = { slug: category };
  }

  if (minPrice || maxPrice) {
    whereClause.price = {};
    if (minPrice) whereClause.price.gte = parseFloat(minPrice);
    if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
  }

  return await prisma.product.findMany({
    where: whereClause,
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const getStringParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0] || '';
    return param || '';
  };

  const query = getStringParam(searchParams.query);
  const category = getStringParam(searchParams.category);

  let title = 'Search Products';
  if (query) title = `Search: ${query}`;
  else if (category) title = `Category: ${category}`;

  return {
    title: `${title} - StyleStore`,
    description: 'Search for clothing and accessories at StyleStore',
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Ensure all params are strings, not string arrays
  const getStringParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0] || '';
    return param || '';
  };

  const query = getStringParam(searchParams.query);
  const categorySlug = getStringParam(searchParams.category);
  const minPriceStr = getStringParam(searchParams.minPrice);
  const maxPriceStr = getStringParam(searchParams.maxPrice);
  
  const minPrice = minPriceStr ? parseInt(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : undefined;
  const [products, categories] = await Promise.all([
    searchProducts({ query, category: categorySlug, minPrice: minPriceStr, maxPrice: maxPriceStr }),
    getCategories(),
  ]);

  let title = 'All Products';
  if (query) {
    title = `Search Results for "${query}"`;
  } else if (categorySlug) {
    const categoryName = categories.find((c: Category) => c.slug === categorySlug)?.name || categorySlug;
    title = `${categoryName} Products`;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.layout}>
        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Categories</h3>
            <div>
              <a
                href="/search"
                className={`${styles.filterLink} ${!categorySlug ? styles.active : ''}`}
              >
                All Categories
              </a>
              {categories.map((cat: Category) => (
                <a
                  key={cat.id}
                  href={`/search?category=${cat.slug}${query ? `&query=${query}` : ''}`}
                  className={`${styles.filterLink} ${categorySlug === cat.slug ? styles.active : ''}`}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>

          <PriceRangeFilter />
        </div>

        {/* Product List */}
        <div className={styles.productList}>
          <ProductList
            products={products}
            emptyMessage="No products match your search criteria"
          />
        </div>
      </div>
    </div>
  );
}
