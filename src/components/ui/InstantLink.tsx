'use client';

import { useEffect, useRef } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

interface InstantLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: React.ReactNode;
  prefetchStrategy?: 'viewport' | 'hover' | 'mousedown' | 'always';
  className?: string;
}

export function InstantLink({
  href,
  children,
  prefetchStrategy = 'mousedown',
  className = '',
  ...props
}: InstantLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasPrefetched = useRef(false);

  // Prefetch on mount if strategy is 'always'
  useEffect(() => {
    if (prefetchStrategy === 'always' && !hasPrefetched.current) {
      router.prefetch(href);
      hasPrefetched.current = true;
    }
  }, [href, prefetchStrategy, router]);

  // Handle viewport-based prefetching
  useEffect(() => {
    if (prefetchStrategy !== 'viewport' || !linkRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPrefetched.current) {
            router.prefetch(href);
            hasPrefetched.current = true;
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Start prefetching when link is 200px from viewport
    );

    observer.observe(linkRef.current);
    return () => observer.disconnect();
  }, [href, prefetchStrategy, router]);

  // Handle mouse-based prefetching
  const handleMouseEnter = () => {
    if (prefetchStrategy === 'hover' && !hasPrefetched.current) {
      router.prefetch(href);
      hasPrefetched.current = true;
    }
  };

  const handleMouseDown = () => {
    if (prefetchStrategy === 'mousedown' && !hasPrefetched.current) {
      router.prefetch(href);
      hasPrefetched.current = true;
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      prefetch={false} // We handle prefetching manually
      {...props}
    >
      {children}
    </Link>
  );
}
