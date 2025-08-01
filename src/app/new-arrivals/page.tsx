import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

async function getNewArrivalsByCategory() {
  // Get all categories
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });

  // For each category, get the latest 4 products
  const results = await Promise.all(
    categories.map(async (cat: { id: number; name: string }) => {
      const products = await prisma.product.findMany({
        where: { categoryId: cat.id },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          inventory: true,
          featured: true,
          createdAt: true,
          images: {
            select: {
              id: true,
              url: true,
              productId: true,
            },
          },
        },
      });
      return { ...cat, products };
    })
  );

  return results.filter((cat) => cat.products.length > 0);
}

export default async function NewArrivalsPage() {
  const grouped = await getNewArrivalsByCategory();

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>New Arrivals</h1>
      <p className={styles.subtitle}>Latest products, organized by category</p>
      <div className={styles.categoryGroups}>
        {grouped.map((cat: CategoryWithProducts) => (
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
    </main>
  );
}
