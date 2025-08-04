import { Suspense, cache } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ArrowRight } from 'lucide-react';
import styles from '@/styles/NewArrivals.module.scss';

interface Product {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  price: number;
  description: string;
  inventory: number;
  featured: boolean;
  images: {
    id: number;
    url: string;
    productId: number;
  }[];
}

interface Category {
  id: number;
  name: string;
}

interface CategoryWithProducts extends Category {
  products: Product[];
}

const getNewArrivalsByCategory = cache(async () => {
  noStore();
  try {
    // Limit the number of categories to fetch (adjust based on your needs)
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true }
        }
      },
      where: {
        products: {
          some: {}
        }
      },
      orderBy: { 
        name: 'asc' 
      },
      take: 5, // Limit to 5 categories max
    });

    // Only proceed if we have categories with products
    if (categories.length === 0) {
      return [];
    }

    // Get all products in a single query with pagination
    const productsByCategory = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categories.map(cat => cat.id)
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        inventory: true,
        featured: true,
        createdAt: true,
        categoryId: true,
        images: {
          select: {
            id: true,
            url: true,
            productId: true,
          },
          take: 1, // Only get the first image
        },
      },
      take: 50, // Limit total products to reduce load
    });

    // Group products by category
    const groupedProducts = productsByCategory.reduce((acc, product) => {
      if (!acc[product.categoryId]) {
        acc[product.categoryId] = [];
      }
      if (acc[product.categoryId].length < 4) { // Max 4 products per category
        acc[product.categoryId].push(product);
      }
      return acc;
    }, {} as Record<number, typeof productsByCategory>);

    // Map back to the expected format
    return categories
      .map(cat => ({
        ...cat,
        products: groupedProducts[cat.id] || []
      }))
      .filter(cat => cat.products.length > 0);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
});

// Loading skeleton component
function ProductCardSkeleton() {
  return (
    <div className={styles.productCard}>
      <div className={`${styles.productImageWrapper} ${styles.skeleton}`} />
      <div className={styles.productInfo}>
        <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80%', height: '1.2rem', marginBottom: '0.5rem' }} />
        <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '60%', height: '1rem' }} />
      </div>
    </div>
  );
}

function CategorySectionSkeleton() {
  return (
    <section className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '200px', height: '1.8rem' }} />
      </div>
      <div className={styles.productsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default async function NewArrivalsPage() {
  const grouped = await getNewArrivalsByCategory();

  return (
    <main className={styles.page}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>New Arrivals</h1>
        <p className={styles.subtitle}>Discover our latest products, carefully selected and organized by category</p>
      </div>
      
      <div className={styles.categoryGroups}>
        {grouped.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📦</div>
            <p>No new arrivals at the moment.</p>
            <p>Check back soon for our latest products!</p>
            <Link href="/products" className={styles.emptyStateButton}>
              Browse All Products
            </Link>
          </div>
        ) : (
          <Suspense fallback={[1, 2, 3].map((i) => <CategorySectionSkeleton key={i} />)}>
            {grouped.map((cat: CategoryWithProducts) => (
              <section key={cat.id} className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <h2 className={styles.categoryTitle}>{cat.name}</h2>
                  <Link href={`/categories/${cat.name.toLowerCase()}`} className={styles.viewAllButton}>
                    View all <ArrowRight size={16} />
                  </Link>
                </div>
                <div className={styles.productsGrid}>
                  {cat.products.map((product: Product) => {
                    // Calculate discount for demo purposes
                    const hasDiscount = Math.random() > 0.7;
                    const discountPercent = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0;
                    const originalPrice = hasDiscount 
                      ? Math.round((product.price * 100) / (100 - discountPercent))
                      : product.price;
                    
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className={styles.productCard}
                      >
                        <div className={styles.productImageWrapper}>
                          <Image
                            src={product.images[0]?.url || '/placeholder.jpg'}
                            alt={product.name}
                            width={220}
                            height={280}
                            className={styles.productImage}
                            priority={false}
                          />
                          {hasDiscount && (
                            <div className={styles.discountBadge}>
                              -{discountPercent}%
                            </div>
                          )}
                        </div>
                        <div className={styles.productInfo}>
                          <h3>{product.name}</h3>
                          <div className={styles.price}>
                            {hasDiscount && (
                              <span className={styles.originalPrice}>LKR {originalPrice.toLocaleString('en-LK')}</span>
                            )}
                            <span>LKR {product.price.toLocaleString('en-LK')}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </Suspense>
        )}
      </div>
      
      <div className={styles.note}>
        <p>Showing up to 4 products per category. <Link href="/products" className={styles.viewAllLink}>View all products</Link></p>
      </div>
    </main>
  );
}
