'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/styles/ProductPage.module.scss';

interface ProductImagesProps {
  images: { public_url: string }[];
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

  // SVG placeholder as a base64 data URL
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2RjZGJkZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJNMjEgMTVIM2EyIDIgMCAwIDAtMiAydjRhMiAyIDAgMCAwIDIgMmgxOGEyIDIgMCAwIDAgMi0ydi00YTIgMiAwIDAgMC0yLTJ6Ii8+PC9zdmc+';

  // Helper function to ensure image URLs are properly formatted
  const getImageUrl = (image: { public_url: string } | string | undefined): string => {
    try {
      if (!image) return placeholderImage;
      
      const url = typeof image === 'string' ? image : image.public_url;
      if (!url) return placeholderImage;
      
      // Return as is if it's a complete URL or data URL
      if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
      }
      
      // Handle relative paths
      return url.startsWith('/') ? url : `/${url}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return placeholderImage;
    }
  };

  return (
    <div className={styles.images}>
      <div 
        className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
        onClick={toggleZoom}
      >
        <Image
          src={getImageUrl(images[currentImageIndex])}
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
              key={image.public_url}
              className={`${styles.thumbnail} ${
                index === currentImageIndex ? styles.active : ''
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              type="button"
            >
              <Image
                src={getImageUrl(image)}
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
