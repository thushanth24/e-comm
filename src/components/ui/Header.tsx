'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CategoryLink } from './CategoryLink';
import SearchBar from './SearchBar';
import {
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
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
    { href: '/', label: 'HOME' },
    { href: '/new-arrivals', label: 'NEW ARRIVALS' },
    { href: '/best-sellers', label: 'BEST SELLERS' },
    { href: '/categories/women', label: 'WOMEN' },
    { href: '/categories/men', label: 'MEN' },
    { href: '/categories/kid', label: 'KIDS' },
    { href: '/categories/personal-care', label: 'PERSONAL CARE' },
    { href: '/categories/travel-gear', label: 'TRAVEL GEAR' },
    { href: '/categories/mother-babycare', label: 'MOTHER & BABYCARE' },
    { href: '/categories/gift-cards', label: 'GIFT CARDS' },
  ];

  // Close menu when clicking on overlay
  const handleOverlayClick = () => {
    setIsMenuOpen(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    const preventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    if (isMenuOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scroll on both html and body
      document.documentElement.classList.add('menu-open');
      document.body.classList.add('menu-open');
      
      // Set body styles for scroll prevention
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Store scroll position for restoration
      document.body.dataset.scrollY = scrollY.toString();
      
      // Add event listeners to prevent scroll
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('scroll', preventScroll, { passive: false });
    } else {
      // Restore scroll on both html and body
      const scrollY = document.body.dataset.scrollY;
      
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      
      // Restore body styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      // Remove event listeners
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('scroll', preventScroll);
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
      
      // Clean up
      delete document.body.dataset.scrollY;
    }

    return () => {
      // Cleanup on unmount
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('scroll', preventScroll);
      delete document.body.dataset.scrollY;
    };
  }, [isMenuOpen]);

  // Close menu when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <header className={styles.header}>
        {/* Top Announcement Bar */}
        <div className={styles.announcementBar}>
          <p>SPECIAL DISCOUNTS ON ALL ORDERS | USE CODE: FUTURE10</p>
        </div>

        <div className={styles.mainHeader}>
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <CategoryLink 
            href="/" 
            className={styles.logo}
          >
            <span className={styles.logoMain}>SRI RAM</span>
            <span className={styles.logoAccent}>SELECTION</span>
          </CategoryLink>

          <div className={styles.search}>
            <SearchBar />
          </div>

          <div className={styles.actions}>
            {/* Wishlist removed */}
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <nav className={`${styles.categoryNav} ${styles.desktopNav}`}>
          <ul>
            {categories.map((cat) => (
              <li key={cat.href}>
                <CategoryLink 
                  href={cat.href}
                  className={`${styles.categoryLink} ${isActive(cat.href) ? styles.activeCategory : ''}`}
                >
                  {cat.label}
                </CategoryLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Overlay */}
        <div 
          className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}
          onClick={handleOverlayClick}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
          onTouchMove={(e) => e.preventDefault()}
        />

        {/* Mobile Menu */}
        <div 
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className={styles.mobileMenuHeader}>
            <h2>Menu</h2>
            <button 
              className={styles.mobileMenuClose}
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className={styles.mobileNav}>
            <ul>
              {categories.map((cat) => (
                <li key={cat.href}>
                  <CategoryLink 
                    href={cat.href}
                    className={`${styles.mobileNavLink} ${isActive(cat.href) ? styles.activeCategory : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat.label}
                  </CategoryLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}