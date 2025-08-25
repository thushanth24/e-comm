'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePageTransition } from '@/hooks/usePageTransition';

interface CategoryLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function CategoryLink({ 
  href, 
  children, 
  className = '', 
  onClick,
  ...props 
}: CategoryLinkProps) {
  const router = useRouter();
  const { startTransition } = usePageTransition();
  const pathname = usePathname();
  const isActive = pathname === href;

  // Prefetch the category page when the link becomes visible in the viewport
  useEffect(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            router.prefetch(href);
            observer.unobserve(entry.target);
          }
        });
      });

      const link = document.querySelector(`a[href="${href}"]`);
      if (link) observer.observe(link);

      return () => {
        if (link) observer.unobserve(link);
      };
    }
  }, [href]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      e.preventDefault();
      return;
    }
    
    const target = e.currentTarget;
    if (target.href && target.href.startsWith(window.location.origin)) {
      e.preventDefault();
      startTransition(href);
    }

    // Call the onClick prop if it exists
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      aria-current={isActive ? 'page' : undefined}
      prefetch={true}
      {...props}
    >
      {children}
    </Link>
  );
}
