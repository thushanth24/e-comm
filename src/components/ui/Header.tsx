'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
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
    { href: '/personal-care', label: 'PERSONAL CARE' },
    { href: '/travel-gear', label: 'TRAVEL GEAR' },
    { href: '/mother-babycare', label: 'MOTHER & BABYCARE' },
    { href: '/gift-cards', label: 'GIFT CARDS' },
  ];

  return (
    <header className={styles.header}>
      {/* Top Announcement Bar */}
      <div className={styles.announcementBar}>
        <p>SPECIAL DISCOUNTS ON ALL ORDERS | USE CODE: FUTURE10</p>
      </div>

      <div className={styles.mainHeader}>
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link href="/" className={styles.logo}>
          <span className={styles.logoMain}>SRI RAAM</span>
          <span className={styles.logoAccent}>SELECTION</span>
        </Link>

        <div className={styles.search}>
          <SearchBar />
        </div>

        <div className={styles.actions}>
          <Link href="/favorites" className={styles.actionIcon}>
            <Heart size={20} />
            <span>Wishlist</span>
          </Link>
        </div>
      </div>

      {/* Category Navigation */}
      <nav className={styles.categoryNav}>
        <ul>
          {categories.map((cat) => (
            <li key={cat.href}>
              <Link 
                href={cat.href}
                className={`${styles.categoryLink} ${isActive(cat.href) ? styles.activeCategory : ''}`}
              >
                {cat.label}
                {cat.href.includes('categories') && <ChevronDown size={16} className={styles.categoryChevron} />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}