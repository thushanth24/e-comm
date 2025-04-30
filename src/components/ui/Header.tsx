'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import { ShoppingBag, User, Heart, Menu, X, ChevronDown, Phone, Clock, MapPin, } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const toggleDropdown = (category: string) => {
    if (activeDropdown === category) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(category);
    }
  };

  const navLinks = [
    { 
      href: '/categories/mens', 
      label: 'Men', 
      submenu: [
        { title: 'Clothing', items: ['T-Shirts', 'Shirts', 'Pants', 'Jeans', 'Shorts'] },
        { title: 'Footwear', items: ['Sneakers', 'Formal Shoes', 'Boots', 'Sandals'] },
        { title: 'Accessories', items: ['Watches', 'Belts', 'Hats', 'Sunglasses'] }
      ]
    },
    { 
      href: '/categories/womens', 
      label: 'Women',
      submenu: [
        { title: 'Clothing', items: ['Dresses', 'Tops', 'Pants', 'Skirts', 'Jeans'] },
        { title: 'Footwear', items: ['Heels', 'Flats', 'Boots', 'Sneakers'] },
        { title: 'Accessories', items: ['Jewelry', 'Bags', 'Scarves', 'Hats'] }
      ]
    },
    { 
      href: '/categories/kids', 
      label: 'Kids',
      submenu: [
        { title: 'Boys', items: ['T-Shirts', 'Pants', 'Jackets', 'Shoes'] },
        { title: 'Girls', items: ['Dresses', 'Tops', 'Pants', 'Shoes'] },
        { title: 'Baby', items: ['Onesies', 'Sets', 'Accessories'] }
      ]
    },
    { 
      href: '/categories/accessories', 
      label: 'Accessories',
      submenu: [
        { title: 'Jewelry', items: ['Necklaces', 'Bracelets', 'Earrings', 'Rings'] },
        { title: 'Bags', items: ['Handbags', 'Backpacks', 'Wallets'] },
        { title: 'Other', items: ['Watches', 'Belts', 'Hats', 'Sunglasses'] }
      ]
    },
    { href: '/search', label: 'Sale' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-red-600 text-white py-1.5">
        <div className="container-custom flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span>+1 234 5678</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Mon-Sat: 9AM-9PM</span>
            </div>
            <div className="hidden md:flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Store Locator</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/track-order" className="hover:underline">Track Order</Link>
            <Link href="/shipping" className="hover:underline">Shipping</Link>
            <Link href="/faq" className="hover:underline">FAQ</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom py-4">
        {/* Logo and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-red-600">Fashion<span className="text-gray-800">Store</span></span>
            </Link>
            
            <div className="hidden lg:block w-[400px]">
              <SearchBar />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-5">
            <Link 
              href="/signin" 
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Sign In</span>
            </Link>
            
            <Link 
              href="/favorites" 
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium">Wishlist</span>
            </Link>
            
            <Link 
              href="/cart" 
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors relative"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
              </div>
              <div>
                <span className="text-sm font-medium">Cart</span>
                <p className="text-xs text-gray-500">$0.00</p>
              </div>
            </Link>
            
            <Link 
              href="/admin" 
              className="ml-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link href="/cart" className="relative">
              <ShoppingBag className="h-6 w-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
            </Link>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 p-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-between mt-4 border-t border-b border-gray-200 py-3">
          <div className="flex space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-red-600 ${
                isActive('/') ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                <button
                  className={`flex items-center text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive(link.href) ? 'text-red-600' : 'text-gray-700'
                  }`}
                  onClick={() => toggleDropdown(link.label)}
                >
                  {link.label}
                  {link.submenu && <ChevronDown className="ml-1 h-4 w-4" />}
                </button>
                
                {link.submenu && (
                  <div className="absolute left-0 mt-2 w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 bg-white shadow-xl rounded-md border border-gray-200 p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {link.submenu.map((section, idx) => (
                        <div key={idx}>
                          <h3 className="font-bold text-gray-800 mb-3">{section.title}</h3>
                          <ul className="space-y-2">
                            {section.items.map((item, i) => (
                              <li key={i}>
                                <Link
                                  href={`/search?category=${link.label.toLowerCase()}&subcategory=${item.toLowerCase()}`}
                                  className="text-gray-600 hover:text-red-600 transition-colors"
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center">
            <ThemeToggle />
            <span className="ml-4 text-sm font-medium text-red-600">Summer Sale - Up to 50% Off!</span>
          </div>
        </nav>

        {/* Mobile Search - shown below the menu button when menu is closed */}
        {!isMenuOpen && (
          <div className="mt-4 md:hidden">
            <SearchBar />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
            <Link
              href="/"
              className={`block py-2 text-sm font-medium transition-colors hover:text-red-600 ${
                isActive('/') ? 'text-red-600' : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {navLinks.map((link) => (
              <div key={link.href}>
                <div 
                  className="flex justify-between items-center py-2 cursor-pointer"
                  onClick={() => link.submenu && toggleDropdown(link.label)}
                >
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-red-600 ${
                      isActive(link.href) ? 'text-red-600' : 'text-gray-700'
                    }`}
                    onClick={(e) => { 
                      if (link.submenu) {
                        e.preventDefault();
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                  
                  {link.submenu && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      activeDropdown === link.label ? 'rotate-180' : ''
                    }`} />
                  )}
                </div>
                
                {link.submenu && activeDropdown === link.label && (
                  <div className="pl-4 mt-1 border-l-2 border-gray-200 space-y-4">
                    {link.submenu.map((section, idx) => (
                      <div key={idx} className="py-2">
                        <h3 className="font-bold text-gray-800 mb-2">{section.title}</h3>
                        <ul className="space-y-2">
                          {section.items.map((item, i) => (
                            <li key={i}>
                              <Link
                                href={`/search?category=${link.label.toLowerCase()}&subcategory=${item.toLowerCase()}`}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link 
                href="/signin" 
                className="flex items-center space-x-2 text-gray-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Sign In / Register</span>
              </Link>
              
              <Link 
                href="/favorites" 
                className="flex items-center space-x-2 text-gray-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-5 w-5" />
                <span className="font-medium">Wishlist</span>
              </Link>
              
              <Link 
                href="/admin" 
                className="flex items-center space-x-2 text-red-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-medium">Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
