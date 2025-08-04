'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CategoryLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function CategoryLink({ href, children, className = '' }: CategoryLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    if (isActive) {
      e.preventDefault();
      return;
    }
    setIsLoading(true);
    
    // Reset loading state after navigation completes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Fallback in case navigation doesn't complete
    
    return () => clearTimeout(timer);
  };

  return (
    <Link
      href={href}
      className={`relative inline-flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
      } ${className}`}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="relative z-10">
        {children}
      </span>
      {isLoading && (
        <span 
          className="absolute inset-0 bg-white bg-opacity-30 rounded-full animate-pulse"
          aria-hidden="true"
        />
      )}
      {isActive && (
        <span 
          className="absolute bottom-0 left-1/2 w-1/2 h-1 bg-white rounded-full -translate-x-1/2"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
