'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from '@/styles/ProductCard.module.scss';
import { ProductLink } from './ProductLink';
import dynamic from 'next/dynamic';

// Dynamically import ClientOnly with no SSR
const ClientOnly = dynamic(() => import('@/components/ClientOnly'), { ssr: false });

// Preload the first few product images
const preloadImages = (images: string[]) => {
  if (typeof window === 'undefined') return;
  
  images.slice(0, 5).forEach((src) => {
    const img = new window.Image();
    img.src = src;
  });
};

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
    inventory: number;
  };
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const fallbackImage = '/images/placeholder-product.jpg';
  let imageUrl = product.images?.[0]?.url || fallbackImage;
  
  // Ensure the image URL has a leading slash if it's a relative path
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
    imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  }
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Preload images for the first few products
    if (priority && product.images?.[0]?.url) {
      preloadImages([product.images[0].url]);
    }
  }, [product.images, priority]);

  if (!mounted) {
    return (
      <div className={styles.card}>
        <div className={`${styles.imageWrapper} ${styles.skeleton}`} />
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <ProductLink href={`/products/${product.slug}`}>
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`${styles.image} ${isImageLoading ? styles.loading : ''}`}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              quality={75}
              onLoadingComplete={() => setIsImageLoading(false)}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
            />
          </ProductLink>

          <div className={styles.quickActions}>
            <button 
              className={styles.actionButton} 
              aria-label="Quick view"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                // Handle quick view
              }}
            >
              <Eye className={styles.icon} />
            </button>
          </div>
        </div>

        <div className={styles.info}>
          <ProductLink href={`/products/${product.slug}`} className={styles.titleLink}>
            <h3 className={styles.title} title={product.name}>
              {product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}
            </h3>
          </ProductLink>
          <div className={styles.footer}>
            <p className={styles.price}>{formatPrice(product.price)}</p>
            {product.inventory <= 0 && (
              <span className={styles.outOfStock}>Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
