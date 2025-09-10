'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface FlyingProductAnimationProps {
  isActive: boolean;
  productImage: string;
  productName: string;
  onComplete: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export default function FlyingProductAnimation({
  isActive,
  productImage,
  productName,
  onComplete,
  buttonRef,
}: FlyingProductAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [positions, setPositions] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });

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

  useEffect(() => {
    if (isActive) {
      // Calculate positions when animation starts
      const buttonRect = buttonRef.current?.getBoundingClientRect();
      const startPosition = buttonRect ? {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2
      } : { x: 0, y: 0 };
      
      const endPosition = getBasketPosition();
      
      setPositions({ start: startPosition, end: endPosition });
      setIsVisible(true);
      
      // Complete animation after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 1200); // Match CSS animation duration

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete, buttonRef]);

  if (!isVisible) return null;

  return (
    <div
        className="flying-product-animation"
        style={{
          position: 'fixed',
          left: positions.start.x,
          top: positions.start.y,
          zIndex: 9999,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          animation: `flyToBasket 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          '--end-x': `${positions.end.x}px`,
          '--end-y': `${positions.end.y}px`,
        } as React.CSSProperties & { '--end-x': string; '--end-y': string }}
      >
        <div className="flying-product-content">
          {/* Glow effect */}
          <div className="flying-product-glow"></div>
          
          {/* Main product image */}
          <div className="flying-product-image">
            <Image
              src={productImage}
              alt={productName}
              width={50}
              height={50}
              className="rounded-md object-cover"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                border: '2px solid white',
              }}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-product.jpg';
              }}
            />
          </div>
          
          {/* Particle effects */}
          <div className="flying-product-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
          </div>
          
          {/* Trail effect */}
          <div className="flying-product-trail"></div>
        </div>
      </div>
  );
}
