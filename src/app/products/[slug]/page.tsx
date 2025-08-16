import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import ProductList from '@/components/ui/ProductList';
import ProductImages from '@/components/ui/ProductImages';
import styles from '@/styles/ProductPage.module.scss';
import { Suspense } from 'react';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import { getProductBySlug, getProducts } from '@/lib/supabase-client';

async function getProduct(slug: string) {
  return await getProductBySlug(slug);
}

async function getRelatedProducts(categoryId: number, productId: number) {
  try {
    const products = await getProducts({ 
      categoryId,
      limit: 4,
      excludeId: productId
    });
    return products || [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found',
    };
  }
  
  return {
    title: `${product.name} - StyleStore`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const slug = params.slug;
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }
  
  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        {' / '}
        <Link href={`/categories/${product.category.slug}`}>
          {product.category.name}
        </Link>
        {' / '}
        <span>{product.name}</span>
      </div>

      <div className={styles.productGrid}>
        <Suspense fallback={<div className={styles.imageSkeleton} />}>
          <ProductImages images={product.images || []} name={product.name} />
        </Suspense>

        <div className={styles.details}>
          <div className={styles.header}>
            <h1>{product.name}</h1>
            <Link href={`/categories/${product.category.slug}`} className={styles.category}>
              {product.category.name}
            </Link>
          </div>

          <p className={styles.price}>{formatPrice(Number(product.price))}</p>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className={styles.availability}>
            <span>Availability: </span>
            {product.inventory > 0 ? (
              <span className={styles.inStock}>In Stock</span>
            ) : (
              <span className={styles.outOfStock}>Out of Stock</span>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2>You may also like</h2>
          <Suspense fallback={Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}>
            <ProductList products={relatedProducts} />
          </Suspense>
        </section>
      )}
    </div>
  
  );
}
