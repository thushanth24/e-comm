import Link from 'next/link';
import { Facebook, Instagram, Twitter, Send, CreditCard, Truck, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-16">
      {/* Newsletter and features section */}
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12">
          {/* Newsletter */}
          <div className="lg:col-span-1 bg-blue-50 dark:bg-gray-900 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-400">Subscribe & Get 10% Off</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Join our newsletter for exclusive offers and new arrivals
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-800 text-sm"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-r-md hover:opacity-90 transition-opacity flex items-center">
                <Send className="h-4 w-4 mr-2" />
                <span>Join</span>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="mr-4 bg-blue-50 dark:bg-gray-800 p-3 rounded-full">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Free Shipping</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">On all orders over $50</p>
              </div>
            </div>
            <div className="flex p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="mr-4 bg-blue-50 dark:bg-gray-800 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Secure Payment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">100% secure payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main footer links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-t border-gray-200 dark:border-gray-800">
          <div>
            <div className="mb-6">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">StyleStore</span>
              </Link>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Providing quality clothing and accessories for men, women, and kids since 2023.
              </p>
            </div>
            <div className="flex space-x-5 mt-4">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/mens" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Men's Clothing
                </Link>
              </li>
              <li>
                <Link href="/categories/womens" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Women's Clothing
                </Link>
              </li>
              <li>
                <Link href="/categories/kids" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Kids' Clothing
                </Link>
              </li>
              <li>
                <Link href="/categories/accessories" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Help</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Customer Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  My Account
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} StyleStore. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHZpc2ElMjBjYXJkfGVufDB8fDB8fHww&auto=format&fit=crop&w=50&h=30&q=60" alt="Visa" className="h-8" />
            <img src="https://images.unsplash.com/photo-1542409192-1a3ed6963c98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bWFzdGVyY2FyZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=50&h=30&q=60" alt="Mastercard" className="h-8" />
            <img src="https://images.unsplash.com/photo-1683537687366-5d1be66f75e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBheXBhbCUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=50&h=30&q=60" alt="PayPal" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
