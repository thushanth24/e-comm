'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/ShopForMen.module.scss';

const images = [
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/mr1.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/mr2.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/mr3.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/mr5.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/mr6.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/mr4.avif',
];

const visibleCount = 3;
const slideWidth = 316; // 300px + 16px gap

export default function ShopForMen() {
  const [index, setIndex] = useState(visibleCount);
  const [transition, setTransition] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  // Clone images for looping effect
  const extendedImages = [
    ...images.slice(-visibleCount),
    ...images,
    ...images.slice(0, visibleCount),
  ];

  const handleNext = () => {
    setIndex((prev) => prev + 1);
    setTransition(true);
  };

  const handlePrev = () => {
    setIndex((prev) => prev - 1);
    setTransition(true);
  };

  // Loop handling
  useEffect(() => {
    const timer = setTimeout(() => {
      if (index === extendedImages.length - visibleCount) {
        setTransition(false);
        setIndex(visibleCount);
      }
      if (index === 0) {
        setTransition(false);
        setIndex(extendedImages.length - visibleCount * 2);
      }
    }, 300); // transition duration
    return () => clearTimeout(timer);
  }, [index, extendedImages.length]);

  const trackStyle = {
    transform: `translateX(-${index * slideWidth}px)`,
    transition: transition ? 'transform 0.3s ease-in-out' : 'none',
  };

  return (
    <section className={styles.shopForMen}>
      <div className={styles.topText}>
        <h2>SHOP FOR MEN</h2>
        <p>
        Explore our premium collection of men's fashion.
         From classic essentials to the latest trends, find everything you need to elevate your style.
        </p>
        <Link href="/categories/men" className={styles.primaryBtn}>
          Shop Now
        </Link>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.leftImage}>
          <Image
            src="https://axzell-saas.s3.eu-north-1.amazonaws.com/home/ml1.avif"
            alt="Women's Fashion"
            width={400}
            height={375}
            className={styles.imageBox}
            priority
          />
        </div>

        <div className={styles.shopRight}>
          <button className={`${styles.navBtn} ${styles.leftBtn}`} onClick={handlePrev}>
            &#8592;
          </button>

          <div className={styles.carouselOuter}>
            <div ref={trackRef} className={styles.carouselWrapper} style={trackStyle}>
                             {extendedImages.map((src, idx) => (
                 <div key={idx} className={styles.card}>
                   <Image 
                     src={src} 
                     alt={`Fashion ${idx}`} 
                     width={0}
                     height={0}
                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                     priority={idx < 3} // Priority for first 3 visible images
                     style={{ width: '100%', height: 'auto' }}
                   />
                 </div>
               ))}
            </div>
          </div>

          <button className={`${styles.navBtn} ${styles.rightBtn}`} onClick={handleNext}>
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
}
