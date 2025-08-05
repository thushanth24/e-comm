'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePageTransition } from '@/hooks/usePageTransition';

interface CategoryLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function CategoryLink({ href, children, className = '' }: CategoryLinkProps) {
  const { startTransition } = usePageTransition();
  const pathname = usePathname();
  const isActive = pathname === href;

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
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
