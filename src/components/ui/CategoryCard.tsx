import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import styles from '@/styles/CategoryCard.module.scss';

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    imageUrl?: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const categoryImages: Record<string, string> = {
    'mens': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop',
    'womens': 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop',
    'kids': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop',
    'accessories': 'https://images.unsplash.com/photo-1511118207236-ef622966bb98?w=800&auto=format&fit=crop',
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop';
  const imageUrl = category.imageUrl || categoryImages[category.slug.toLowerCase()] || fallbackImage;

  return (
    <Link href={`/categories/${category.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
        />
        <div className={styles.overlay}>
          <h3 className={styles.title}>{category.name}</h3>
          <div className={styles.explore}>
            <span>Explore</span>
            <ChevronRight className={styles.chevron} />
          </div>
        </div>
      </div>
    </Link>
  );
}
