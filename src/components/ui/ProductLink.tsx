'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/ProductCard.module.scss';

interface ProductLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ProductLink({ 
  href, 
  children, 
  className = '',
  onClick
}: ProductLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    if (isActive) {
      e.preventDefault();
      return;
    }
    
    setIsLoading(true);
    
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    }
    
    // Reset loading state after navigation completes or after a timeout
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Fallback in case navigation doesn't complete
    
    return () => clearTimeout(timer);
  };

  return (
    <div className="relative">
      <Link
        href={href}
        className={className}
        onClick={handleClick}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
      </Link>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBar}></div>
        </div>
      )}
    </div>
  );
}
