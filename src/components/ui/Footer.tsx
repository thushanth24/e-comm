'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Send,
  CreditCard,
  Truck,
  ArrowRight,
} from 'lucide-react';
import styles from '@/styles/Footer.module.scss';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Subscribed: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.topSection}>
         

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.featureBox}>
              <div className={styles.icon}>
                <Truck />
              </div>
              <div className={styles.text}>
                <h4>In store pick-up</h4>
                <p>On all orders </p>
              </div>
            </div>
            <div className={styles.featureBox}>
              <div className={styles.icon}>
                <CreditCard />
              </div>
              <div className={styles.text}>
                <h4>Secure Payment</h4>
                <p>100% secure payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className={styles.footerLinks}>
          <div>
            <Link href="/" className={styles.logo}>
              SRI RAAM SELECTION
            </Link>
            <p>
              Providing quality clothing and accessories for men, women, and
              kids since 2023.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3>Shop</h3>
            <ul>
              <li>
                <Link href="/categories/men">
                  <ArrowRight size={14} />
                  <span>Men's Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/women">
                  <ArrowRight size={14} />
                  <span>Women's Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/kid">
                  <ArrowRight size={14} />
                  <span>Kids' Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/accessories">
                  <ArrowRight size={14} />
                  <span>Accessories</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3>Company</h3>
            <ul>
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Contact</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h3>Help</h3>
            <ul>
              <li><Link href="#">Customer Service</Link></li>
              <li><Link href="#">My Account</Link></li>
              <li><Link href="#">Shipping & Delivery</Link></li>
              <li><Link href="#">Returns & Exchanges</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          {year && <p>© {year} axzell innovations. All rights reserved.</p>}
        </div>
      </div>
    </footer>
  );
}
