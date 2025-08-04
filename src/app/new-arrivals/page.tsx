import { Suspense, cache } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
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

export default async function NewArrivalsPage() {
  const grouped = await getNewArrivalsByCategory();

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>New Arrivals</h1>
      <p className={styles.subtitle}>Latest products, organized by category</p>
      <div className={styles.categoryGroups}>
        {grouped.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No new arrivals found. Check back soon!</p>
          </div>
        ) : grouped.map((cat: CategoryWithProducts) => (
          <section key={cat.id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat.name}</h2>
            <div className={styles.productsGrid}>
              {cat.products.map((product: Product) => (
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
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{product.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      
      <div className={styles.note}>
        <p>Showing up to 4 products per category. <Link href="/products" className={styles.viewAllLink}>View all products</Link></p>
      </div>
    </main>
  );
}
