'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import styles from '@/styles/Home.module.scss';

export default function HeroImage() {
  // Preload hint for critical image
  useEffect(() => {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&auto=format&fit=webp&q=75';
    document.head.appendChild(preloadLink);

    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);

  return (
    <Image
      src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&auto=format&fit=webp&q=75"
      alt="Fashion Collection"
      fill
      priority
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 90vw"
      className={styles.heroImage}
      style={{
        willChange: 'opacity',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        imageRendering: 'crisp-edges'
      }}
    />
  );
}
