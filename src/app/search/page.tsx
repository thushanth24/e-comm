import { prisma } from '@/lib/prisma';
import ProductList from '@/components/ui/ProductList';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';
import styles from '@/styles/SearchPage.module.scss'; // 👈 import SCSS


interface PageProps {
  searchParams: {
    query?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

async function getCategories() {
  return await prisma.category.findMany();
}

async function searchProducts(params: PageProps['searchParams']) {
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

export async function generateMetadata({ searchParams }: PageProps) {
  const { query, category } = searchParams;

  let title = 'Search Products';
  if (query) title = `Search: ${query}`;
  else if (category) title = `Category: ${category}`;

  return {
    title: `${title} - StyleStore`,
    description: 'Search for clothing and accessories at StyleStore',
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const [products, categories] = await Promise.all([
    searchProducts(searchParams),
    getCategories(),
  ]);

  const { query, category } = searchParams;

  let title = 'All Products';
  if (query) {
    title = `Search Results for "${query}"`;
  } else if (category) {
    const categoryName = categories.find((c) => c.slug === category)?.name || category;
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
                className={`${styles.filterLink} ${!category ? styles.active : ''}`}
              >
                All Categories
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/search?category=${cat.slug}${query ? `&query=${query}` : ''}`}
                  className={`${styles.filterLink} ${category === cat.slug ? styles.active : ''}`}
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
