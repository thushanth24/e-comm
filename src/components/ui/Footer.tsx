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
  Globe,
  ChevronDown
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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <Link href="/" className={styles.logo}>
              SRI RAM SELECTION
            </Link>
            <p className={styles.brandDescription}>
              Providing quality clothing and accessories for men, women, and
              kids since 2023.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Facebook" className={styles.socialLink}>
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Instagram" className={styles.socialLink}>
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="Twitter" className={styles.socialLink}>
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Shop Section */}
          <div className={styles.footerSection}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('shop')}
              aria-expanded={expandedSections.shop}
            >
              <h3>Shop</h3>
              <ChevronDown className={`${styles.chevron} ${expandedSections.shop ? styles.expanded : ''}`} />
            </button>
            <ul className={`${styles.sectionList} ${expandedSections.shop ? styles.expanded : ''}`}>
              <li>
                <Link href="/categories/men" className={styles.footerLink}>
                  <ArrowRight size={14} />
                  <span>Men's Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/women" className={styles.footerLink}>
                  <ArrowRight size={14} />
                  <span>Women's Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/kid" className={styles.footerLink}>
                  <ArrowRight size={14} />
                  <span>Kids' Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/accessories" className={styles.footerLink}>
                  <ArrowRight size={14} />
                  <span>Accessories</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className={styles.footerSection}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('company')}
              aria-expanded={expandedSections.company}
            >
              <h3>Company</h3>
              <ChevronDown className={`${styles.chevron} ${expandedSections.company ? styles.expanded : ''}`} />
            </button>
            <ul className={`${styles.sectionList} ${expandedSections.company ? styles.expanded : ''}`}>
              <li><Link href="#" className={styles.footerLink}>About Us</Link></li>
              <li><Link href="#" className={styles.footerLink}>Contact</Link></li>
              <li><Link href="#" className={styles.footerLink}>Careers</Link></li>
              <li><Link href="#" className={styles.footerLink}>Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Developer Section */}
          <div className={`${styles.footerSection} ${styles.developerSection}`}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('developer')}
              aria-expanded={expandedSections.developer}
            >
              <h3>Developed By</h3>
              <ChevronDown className={`${styles.chevron} ${expandedSections.developer ? styles.expanded : ''}`} />
            </button>
            <div className={`${styles.developerContent} ${expandedSections.developer ? styles.expanded : ''}`}>
              {/* Logo */}
              <img 
                src="/images/logo2.PNG" 
                alt="Axzell Innovations Logo" 
                className={styles.developerLogo} 
              />

              {/* Contact Info */}
              <div className={styles.contactInfo}>
                <span className={styles.developerName}>axzell innovations</span>
                <div className={styles.contactDetails}>
                  <span className={styles.contactItem}>
                    <Phone className={styles.contactIcon} size={14} />
                    +94 (768) 180-977
                  </span>
                  <span className={styles.contactItem}>
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
