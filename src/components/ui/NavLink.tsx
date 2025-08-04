'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  loadingClassName?: string;
}

export default function NavLink({
  href,
  children,
  className = '',
  activeClassName = 'text-blue-600 font-medium',
  loadingClassName = 'opacity-50',
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Link
      href={href}
      className={`relative ${className} ${isActive ? activeClassName : ''} ${
        isLoading ? loadingClassName : ''
      } transition-colors duration-200`}
      onClick={() => {
        if (pathname !== href) {
          setIsLoading(true);
        }
      }}
    >
      {children}
      {isLoading && (
        <motion.span
          className="absolute -right-5 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </motion.span>
      )}
      {isActive && (
        <motion.span
          className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
          layoutId="navIndicator"
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
    </Link>
  );
}
