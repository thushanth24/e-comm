'use client';

import { useState, useRef } from 'react';
import { ShoppingBag, Minus } from 'lucide-react';
import { useCollections } from '@/contexts/CollectionsContext';
import { Product } from '@/types';
import styles from '@/styles/CollectionButton.module.scss';
import FlyingProductAnimation from './FlyingProductAnimation';

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
  const [isFlying, setIsFlying] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const inCollection = isInCollection(product.id);

  const getBasketPosition = () => {
    // Find the basket icon in the header
    const basketElement = document.querySelector('[href="/collections"]');
    if (basketElement) {
      const rect = basketElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    // Fallback position (top right of screen)
    return { x: window.innerWidth - 50, y: 50 };
  };

  const handleToggleCollection = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    
    if (inCollection) {
      removeFromCollection(product.id);
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      // Start flying animation
      setIsFlying(true);

      // Add to collection
      addToCollection(product);
      
      // Reset animations after flying animation completes
      setTimeout(() => {
        setIsAnimating(false);
        setIsFlying(false);
      }, 1200);
    }
  };

  const buttonClass = `${styles.collectionButton} ${styles[variant]} ${
    inCollection ? styles.active : ''
  } ${isAnimating ? styles.animating : ''}`.trim();

  // Get product image for animation
  const productImage = product.images?.[0]?.public_url || '/images/placeholder-product.jpg';

  return (
    <>
      <button
        ref={buttonRef}
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

      {/* Flying animation */}
      {isFlying && (
        <FlyingProductAnimation
          isActive={isFlying}
          productImage={productImage}
          productName={product.name}
          onComplete={() => setIsFlying(false)}
          buttonRef={buttonRef}
        />
      )}
    </>
  );
}
