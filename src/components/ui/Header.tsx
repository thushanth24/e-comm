// Header.tsx (Tailwind removed, structure retained)

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const toggleDropdown = (category: string) => {
    setActiveDropdown(activeDropdown === category ? null : category);
  };

  const navLinks = [
    {
      href: '/categories/mens',
      label: 'Men',
      submenu: [
        { title: 'Clothing', items: ['T-Shirts', 'Shirts', 'Pants', 'Jeans', 'Shorts'] },
        { title: 'Footwear', items: ['Sneakers', 'Formal Shoes', 'Boots', 'Sandals'] },
        { title: 'Accessories', items: ['Watches', 'Belts', 'Hats', 'Sunglasses'] },
      ],
    },
    {
      href: '/categories/womens',
      label: 'Women',
      submenu: [
        { title: 'Clothing', items: ['Dresses', 'Tops', 'Pants', 'Skirts', 'Jeans'] },
        { title: 'Footwear', items: ['Heels', 'Flats', 'Boots', 'Sneakers'] },
        { title: 'Accessories', items: ['Jewelry', 'Bags', 'Scarves', 'Hats'] },
      ],
    },
    {
      href: '/categories/kids',
      label: 'Kids',
      submenu: [
        { title: 'Boys', items: ['T-Shirts', 'Pants', 'Jackets', 'Shoes'] },
        { title: 'Girls', items: ['Dresses', 'Tops', 'Pants', 'Shoes'] },
        { title: 'Baby', items: ['Onesies', 'Sets', 'Accessories'] },
      ],
    },
    {
      href: '/categories/accessories',
      label: 'Accessories',
      submenu: [
        { title: 'Jewelry', items: ['Necklaces', 'Bracelets', 'Earrings', 'Rings'] },
        { title: 'Bags', items: ['Handbags', 'Backpacks', 'Wallets'] },
        { title: 'Other', items: ['Watches', 'Belts', 'Hats', 'Sunglasses'] },
      ],
    },
    { href: '/search', label: 'Sale' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.topLeft}>
            <div><Phone /> +1 234 5678</div>
            <div><Clock /> Mon-Sat: 9AM-9PM</div>
            <div><MapPin /> Store Locator</div>
          </div>
          <div className={styles.topRight}>
            <Link href="/track-order">Track Order</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
      </div>

      <div className={styles.mainHeader}>
        <div className={styles.logoSearch}>
          <Link href="/" className={styles.logo}>Fashion<span>Store</span></Link>
          <div className={styles.search}><SearchBar /></div>
        </div>

        <div className={styles.actions}>
          <Link href="/signin"><User /> Sign In</Link>
          <Link href="/favorites"><Heart /> Wishlist</Link>
          <Link href="/cart" className={styles.cart}><ShoppingBag /><span className={styles.badge}>0</span> Cart - $0.00</Link>
          <Link href="/admin" className={styles.admin}>Admin</Link>
        </div>

        <div className={styles.mobileMenuToggle}>
          <Link href="/cart"><ShoppingBag /><span className={styles.badge}>0</span></Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>

      {/* Add navigation and dropdown rendering here with SCSS classes */}
    </header>
  );
}