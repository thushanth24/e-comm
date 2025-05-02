import Link from 'next/link';
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
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section: Newsletter + Features */}
        <div className={styles.topSection}>
          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h3>Subscribe & Get 10% Off</h3>
            <p>Join our newsletter for exclusive offers and new arrivals</p>
            <div className={styles.inputGroup}>
              <input type="email" placeholder="Your email address" />
              <button>
                <Send />
                Join
              </button>
            </div>
          </div>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.featureBox}>
              <div className={styles.icon}>
                <Truck />
              </div>
              <div className={styles.text}>
                <h4>Free Shipping</h4>
                <p>On all orders over $50</p>
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
          {/* Column 1 */}
          <div>
            <Link href="/" className={styles.logo}>
              StyleStore
            </Link>
            <p>
              Providing quality clothing and accessories for men, women, and
              kids since 2023.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3>Shop</h3>
            <ul>
              <li>
                <Link href="/categories/mens">
                  <ArrowRight />
                  <span>Men's Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/womens">
                  <ArrowRight />
                  <span>Women's Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/kids">
                  <ArrowRight />
                  <span>Kids' Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/accessories">
                  <ArrowRight />
                  <span>Accessories</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3>Company</h3>
            <ul>
              <li>
                <Link href="#">About Us</Link>
              </li>
              <li>
                <Link href="#">Contact</Link>
              </li>
              <li>
                <Link href="#">Careers</Link>
              </li>
              <li>
                <Link href="#">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3>Help</h3>
            <ul>
              <li>
                <Link href="#">Customer Service</Link>
              </li>
              <li>
                <Link href="#">My Account</Link>
              </li>
              <li>
                <Link href="#">Shipping & Delivery</Link>
              </li>
              <li>
                <Link href="#">Returns & Exchanges</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} StyleStore. All rights reserved.</p>
         
        </div>
      </div>
    </footer>
  );
}
