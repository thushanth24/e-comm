import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import ProductList from '@/components/ui/ProductList';
import styles from '@/styles/ProductPage.module.scss';


interface PageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
    },
  });
  
  return product;
}

async function getRelatedProducts(categoryId: number, productId: number) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
    },
    include: {
      images: true,
    },
    take: 4,
  });
  
  return products;
}

export async function generateMetadata({ params }: PageProps) {
  const product = await getProduct(params.slug);
  
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

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
  
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
      <div className={styles.images}>
        {product.images.length > 0 ? (
          <>
            <div className={styles.mainImage}>
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.image}
              />
            </div>
  
            {product.images.length > 1 && (
              <div className={styles.thumbnailGrid}>
                {product.images.map((image, index) => (
                  <div key={image.id} className={styles.thumbnail}>
                    <Image
                      src={image.url}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      sizes="25vw"
                      className={styles.image}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.noImage}>
            <span>No image available</span>
          </div>
        )}
      </div>
  
      <div className={styles.details}>
        <div className={styles.header}>
          <h1>{product.name}</h1>
          <Link href={`/categories/${product.category.slug}`} className={styles.category}>
            {product.category.name}
          </Link>
        </div>
  
        <div className={styles.price}>{formatPrice(product.price)}</div>
  
        <div className={styles.description}>
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>
  
        <div className={styles.availability}>
          <span>Availability:</span>
          {product.inventory > 0 ? (
            <span className={styles.inStock}>
              In Stock ({product.inventory} {product.inventory === 1 ? 'item' : 'items'} left)
            </span>
          ) : (
            <span className={styles.outOfStock}>Out of Stock</span>
          )}
        </div>
  
        <div className={styles.action}>
          <button disabled={product.inventory === 0}>
            {product.inventory === 0 ? 'Out of Stock' : 'Add to wishlist'}
          </button>
        </div>
      </div>
    </div>
  
    {relatedProducts.length > 0 && (
      <section className={styles.relatedSection}>
        <h2>You may also like</h2>
        <ProductList products={relatedProducts} />
      </section>
    )}
  </div>
  
  );
}
