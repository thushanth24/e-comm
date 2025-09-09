'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import styles from '@/styles/ProductCard.module.scss';
import { ProductLink } from './ProductLink';
import CollectionButton from './CollectionButton';

// Helper function to safely convert price to number
const toNumber = (price: string | number): number => {
  if (typeof price === 'number') return price;
  const num = parseFloat(price);
  return isNaN(num) ? 0 : num;
};

// Dynamically import ClientOnly
const ClientOnly = dynamic(() => import('@/components/ClientOnly'));

// Preload the first few product images
const preloadImages = (images: string[]) => {
  if (typeof window === 'undefined') return;
  
  images.slice(0, 5).forEach((src) => {
    const img = new window.Image();
    img.src = src;
  });
};

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  images: { public_url: string }[];
  inventory: number;
  isActive?: boolean;
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  isActive?: boolean;
}

export default function ProductCard({ product, priority = false, isActive = false }: ProductCardProps) {
  // Use a simple SVG as fallback instead of a file
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2RjZGJkZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJNMjEgMTUhLTEyLjVhLjUuNSAwIDAgMC0uNS41djMuNWEyIDIgMCAwIDAgMiAyaDlhMiAyIDAgMCAwIDItMnYtNHoiLz48L3N2Zz4=';
  
  // Get the first available image or use fallback
  const [currentImage, setCurrentImage] = useState(() => {
    const img = product.images?.[0]?.public_url;
    return img && (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) 
      ? img 
      : (img ? `/${img.replace(/^\/+/, '')}` : fallbackImage);
  });
  
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const handleImageError = () => {
    setCurrentImage(fallbackImage);
  };

  useEffect(() => {
    setMounted(true);
    // Preload images for the first few products
    if (priority && product.images?.[0]?.public_url) {
      preloadImages([product.images[0].public_url]);
    }
  }, [product.images, priority]);

  if (!mounted) {
    return (
      <div className={styles.card}>
        <div className={`${styles.imageWrapper} ${styles.skeleton}`} style={{ position: 'relative', width: '100%', paddingTop: '100%' }} />
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className={`${styles.card} ${isActive ? styles.active : ''}`}>
        <div className={styles.imageWrapper} style={{ position: 'relative' }}>
          <ProductLink href={`/products/${product.slug}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-200 ${
                isImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onLoad={() => setIsImageLoading(false)}
              onError={handleImageError}
              priority={priority}
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
            />
          </ProductLink>

          <div className={styles.quickActions}>
            <CollectionButton product={product} variant="card" />
          </div>
        </div>

        <div className={styles.info}>
          <ProductLink href={`/products/${product.slug}`} className={styles.titleLink}>
            <h3 className={styles.title} title={product.name}>
              {product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}
            </h3>
          </ProductLink>
          <div className={styles.footer}>
            <p className={styles.price}>{formatPrice(toNumber(product.price))}</p>
            {product.inventory <= 0 && (
              <span className={styles.outOfStock}>Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
