'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/ShopForKid.module.scss';

const images = [
  "https://axzell-saas.s3.eu-north-1.amazonaws.com/home/kr1.avif",
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/kr2.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/kr3.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/kr5.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/kr6.avif',
  'https://axzell-saas.s3.eu-north-1.amazonaws.com/home/kr4.avif',
];

const visibleCount = 3;
const slideWidth = 316; // 300px + 16px gap

export default function ShopForKid() {
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
    <section className={styles.shopForKid}>
      <div className={styles.container}>
        <div className={styles.topText}>
          <h2>SHOP FOR KIDS</h2>
          <p>
            Discover the latest in kids' fashion with our exclusive collection. From adorable outfits
            to stylish accessories, find everything you need to make your little ones look amazing.
          </p>
          <Link href="/categories/kid">
            Shop Now
          </Link>
        </div>

        <div className={styles.bottomSection}>
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
                       width={280}
                       height={280}
                       sizes="(max-width: 768px) 240px, (max-width: 480px) 200px, 280px"
                       priority={idx < 3}
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
      </div>
    </section>
  );
}
