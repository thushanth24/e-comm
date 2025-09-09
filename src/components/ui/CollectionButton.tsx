'use client';

import { useState } from 'react';
import { ShoppingBag, Minus } from 'lucide-react';
import { useCollections } from '@/hooks/useCollections';
import { Product } from '@/types';
import styles from '@/styles/CollectionButton.module.scss';

interface CollectionButtonProps {
  product: Product;
  variant?: 'card' | 'page';
  showText?: boolean;
}

export default function CollectionButton({ 
  product, 
  variant = 'card', 
  showText = false 
}: CollectionButtonProps) {
  const { addToCollection, removeFromCollection, isInCollection } = useCollections();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const inCollection = isInCollection(product.id);

  const handleToggleCollection = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    
    if (inCollection) {
      removeFromCollection(product.id);
    } else {
      addToCollection(product);
    }
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const buttonClass = `${styles.collectionButton} ${styles[variant]} ${
    inCollection ? styles.active : ''
  } ${isAnimating ? styles.animating : ''}`.trim();

  return (
    <button
      className={buttonClass}
      onClick={handleToggleCollection}
      aria-label={inCollection ? 'Remove from collection' : 'Add to collection'}
      title={inCollection ? 'Remove from collection' : 'Add to collection'}
      data-collection-button="true"
    >
      {inCollection ? (
        <Minus className={styles.icon} />
      ) : (
        <ShoppingBag className={styles.icon} />
      )}
      {showText && (
        <span className={styles.text}>
          {inCollection ? 'Remove' : 'Add to Collection'}
        </span>
      )}
    </button>
  );
}
