'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCollections } from '@/hooks/useCollections';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Printer } from 'lucide-react';
import styles from './collections.module.scss';

export default function CollectionsPage() {
  const { collections, removeFromCollection, clearCollections, isLoading } = useCollections();
  const [mounted, setMounted] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Collections</h1>
        </div>
        <div className={styles.loading}>
          <div className={styles.skeleton}></div>
          <div className={styles.skeleton}></div>
          <div className={styles.skeleton}></div>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Collections</h1>
        </div>
        <div className={styles.empty}>
          <Plus className={styles.emptyIcon} />
          <h2>Your collection is empty</h2>
          <p>Start adding products to your collection by clicking the plus icon on any product.</p>
          <Link href="/" className={styles.shopButton}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-print-date={new Date().toLocaleDateString()}>
      <div className={`${styles.header} collections-header`}>
        <h1>My Collections</h1>
        <p className={styles.count}>{collections.length} item{collections.length !== 1 ? 's' : ''}</p>
        <div className={styles.headerActions}>
          <button 
            className={styles.printButton}
            onClick={handlePrint}
            title="Print collection"
          >
            <Printer className={styles.icon} />
            Print
          </button>
          <button 
            className={styles.clearButton}
            onClick={clearCollections}
            title="Clear all collections"
          >
            <Trash2 className={styles.icon} />
            Clear All
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {collections.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <Link href={`/products/${product.slug}`} className={styles.imageLink}>
              <div className={styles.imageWrapper}>
                {product.images?.[0]?.public_url ? (
                  <img
                    src={product.images[0].public_url}
                    alt={product.name}
                    className={styles.image}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-product.jpg';
                    }}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    <Plus className={styles.placeholderIcon} />
                  </div>
                )}
              </div>
            </Link>

            <div className={styles.info}>
              <Link href={`/products/${product.slug}`} className={styles.titleLink}>
                <h3 className={styles.title}>{product.name}</h3>
              </Link>
              
              <div className={styles.details}>
                <p className={styles.price}>{formatPrice(Number(product.price))}</p>
                <p className={styles.addedDate}>
                  Added {new Date(product.addedAt).toLocaleDateString()}
                </p>
              </div>

              <div className={styles.actions}>
                <Link href={`/products/${product.slug}`} className={styles.viewButton}>
                  View Product
                </Link>
                <button
                  className={styles.removeButton}
                  onClick={() => removeFromCollection(product.id)}
                  title="Remove from collection"
                >
                  <Trash2 className={styles.icon} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
