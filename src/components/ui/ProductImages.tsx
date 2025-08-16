'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/styles/ProductPage.module.scss';

interface ProductImagesProps {
  images: { url: string }[];
  name: string;
}

export default function ProductImages({ images, name }: ProductImagesProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsLoading(true);
  }, []);

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  if (!images || images.length === 0) {
    return (
      <div className={styles.images}>
        <div className={`${styles.mainImage} ${styles.skeleton}`} />
      </div>
    );
  }

  // Helper function to ensure image URLs are properly formatted
  const getImageUrl = (url: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className={styles.images}>
      <div 
        className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
        onClick={toggleZoom}
      >
        <Image
          src={getImageUrl(images[currentImageIndex]?.url)}
          alt={`${name} - ${currentImageIndex + 1} of ${images.length}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`${styles.image} ${isLoading ? styles.loading : ''}`}
          priority={currentImageIndex === 0}
          loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
          quality={80}
          onLoadingComplete={() => setIsLoading(false)}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
        />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={image.url}
              className={`${styles.thumbnail} ${
                index === currentImageIndex ? styles.active : ''
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              type="button"
            >
              <Image
                src={getImageUrl(image.url)}
                alt=""
                width={80}
                height={80}
                className={styles.thumbnailImage}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
