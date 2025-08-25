'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePageTransition } from '@/hooks/usePageTransition';
import styles from '@/styles/ProductCard.module.scss';

interface ProductLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function ProductLink({ 
  href, 
  children, 
  className = '',
  style,
  onClick
}: ProductLinkProps) {
  const { startTransition } = usePageTransition();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
    
    const target = e.currentTarget;
    if (target.href && target.href.startsWith(window.location.origin)) {
      e.preventDefault();
      startTransition();
      // Small delay to allow the animation to start
      setTimeout(() => {
        window.location.href = target.href;
      }, 100);
    }
    
    // Call the onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      style={{ position: 'relative', display: 'block', ...style }}
    >
      {children}
    </Link>
  );
}
