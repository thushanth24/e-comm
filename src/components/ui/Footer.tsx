'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  ArrowRight,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Mail,
  Globe
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface SocialLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const developerSocials: SocialLink[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/axzell-innovations/61575055448626/?mibextid=wwXIfr&rdid=z7N8FTNA5aCiy62C&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F191FPBhqty%2F%3Fmibextid%3DwwXIfr',
    icon: Facebook,
    color: 'hover:text-blue-600',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/axzell-innovations',
    icon: Linkedin,
    color: 'hover:text-blue-600',
  },
  {
    label: 'Email',
    href: 'mailto:social@axzellin.com',
    icon: Mail,
    color: 'hover:text-red-500',
  },
  {
    label: 'Website',
    href: 'https://www.axzellin.com',
    icon: Globe,
    color: 'hover:text-green-500',
  },
];
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
         
        {/* Footer Links */}
        <div className={styles.footerLinks}>
          <div>
            <Link href="/" className={styles.logo}>
              SRI RAM SELECTION
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

          <div className={styles.developerSection}>
            <h3>Developed By</h3>
            <div className={styles.developerContent}>
              {/* Logo */}
              <img 
                src="/images/logo2.PNG" 
                alt="Axzell Innovations Logo" 
                className={styles.developerLogo} 
              />

              {/* Name and Contact */}
              <div className={styles.contactRow}>
                <div className={styles.contactInfo}>
                  <span className={styles.developerName}>axzell innovations</span>
                  <span className={styles.phoneNumber}>
                    <Phone className={styles.contactIcon} size={14} />
                    +94 (768) 180-977
                  </span>
                  <span className={styles.phoneNumber}>
                    <Mail className={styles.contactIcon} size={14} />
                    social@axzellin.com
                  </span>

                  <a 
                    href="https://www.axzellin.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.websiteLink}
                  >
                    <MapPin className={styles.contactIcon} />
                    <span>www.axzellin.com</span>
                  </a>
                </div>
                <div className={styles.socialIcons}>
                  {developerSocials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit Axzell ${social.label}`}
                      className={`${styles.socialIcon} ${social.color}`}
                    >
                      <social.icon className={styles.socialIconSvg} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
