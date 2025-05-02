import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';
import styles from '@/styles/ProductList.module.scss';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
  inventory: number;
}

interface ProductListProps {
  products: Product[];
  title?: string;
  emptyMessage?: string;
}

export default function ProductList({ 
  products, 
  title,
  emptyMessage = "No products found."
}: ProductListProps) {
  return (
    <div className={styles.productList}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <PackageOpen className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Products Available</h3>
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
