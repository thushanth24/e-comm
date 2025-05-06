import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import styles from '@/styles/ProductCard.module.scss';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
    inventory: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1523387210434-271e8be1f52b?w=800&auto=format&fit=crop';
  const imageUrl = product.images?.length > 0 ? product.images[0].url : fallbackImage;

  const isLowInventory = product.inventory <= 5 && product.inventory > 0;
  const isOutOfStock = product.inventory === 0;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link href={`/products/${product.slug}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
          />
        </Link>

        {isLowInventory && (
          <div className={`${styles.badge} ${styles.lowInventory}`}>
            Only {product.inventory} left
          </div>
        )}
        {isOutOfStock && (
          <div className={`${styles.badge} ${styles.outOfStock}`}>
            Out of Stock
          </div>
        )}

        <div className={styles.quickActions}>
          <button className={styles.actionButton} aria-label="Add to wishlist">
            <Heart className={styles.icon} />
          </button>
          <button className={styles.actionButton} aria-label="Quick view">
            <Eye className={styles.icon} />
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <Link href={`/products/${product.slug}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>
        <div className={styles.footer}>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <button
            disabled={isOutOfStock}
            className={`${styles.cartButton} ${isOutOfStock ? styles.disabled : styles.active}`}
          >
            <ShoppingBag className={styles.cartIcon} />
            {isOutOfStock ? 'Sold Out' : 'Add to wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
