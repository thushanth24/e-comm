// Header.tsx (Category section added, others unchanged)

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import {
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  ChevronDown,
  Phone,
  Clock,
  MapPin,
} from 'lucide-react';
import styles from '@/styles/Header.module.scss';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const categories = [
    { href: '/new-arrivals', label: 'NEW ARRIVALS' },
    { href: '/best-sellers', label: 'BEST SELLERS' },
    { href: '/categories/women', label: 'WOMEN' },
    { href: '/categories/men', label: 'MEN' },
    { href: '/categories/kid', label: 'KIDS' },
    { href: '/home-decor', label: 'HOME & DECOR' },
    { href: '/personal-care', label: 'PERSONAL CARE' },
    { href: '/travel-gear', label: 'TRAVEL GEAR' },
    { href: '/mother-babycare', label: 'MOTHER & BABYCARE' },
    { href: '/gift-cards', label: 'GIFT CARDS' },
  ];

  return (
    <header className={styles.header}>
   

      <div className={styles.mainHeader}>
        <div className={styles.logoSearch}>
          <Link href="/" className={styles.logo}>Fashion<span>Store</span></Link>
          <div className={styles.search}><SearchBar /></div>
        </div>

        <div className={styles.actions}>
          <Link href="/favorites"><Heart /> Wishlist</Link>
        </div>

        
      </div>

      {/* 🆕 Category Navigation */}
      <nav className={styles.categoryNav}>
        <ul>
          {categories.map((cat) => (
            <li key={cat.href} >
              <Link href={cat.href}>{cat.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
