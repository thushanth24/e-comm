import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import styles from '@/styles/NewArrivals.module.scss';

async function getNewArrivalsByCategory() {
  // Get all categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  // For each category, get the latest 4 products
  const results = await Promise.all(
    categories.map(async (cat) => {
      const products = await prisma.product.findMany({
        where: { categoryId: cat.id },
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { images: true },
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
        {grouped.map((cat) => (
          <section key={cat.id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat.name}</h2>
            <div className={styles.productsGrid}>
              {cat.products.map((product) => (
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
