import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
    inventory: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // Default image if no images are available
  const fallbackImage = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop';
  const imageUrl = product.images?.length > 0 
    ? product.images[0].url 
    : fallbackImage;

  const isLowInventory = product.inventory <= 5 && product.inventory > 0;
  const isOutOfStock = product.inventory === 0;

  return (
    <div className="group">
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 aspect-square relative">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Status badges */}
        {isLowInventory && (
          <div className="absolute top-3 left-3 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            Only {product.inventory} left
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            Out of Stock
          </div>
        )}

        {/* Quick action buttons */}
        <div className="absolute right-3 top-3 flex flex-col space-y-2 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          <button className="bg-white dark:bg-gray-800 rounded-full p-2.5 text-gray-700 dark:text-gray-200 shadow-md hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors" aria-label="Add to wishlist">
            <Heart className="h-4 w-4" />
          </button>
          <button className="bg-white dark:bg-gray-800 rounded-full p-2.5 text-gray-700 dark:text-gray-200 shadow-md hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors" aria-label="Quick view">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 px-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {formatPrice(product.price)}
          </p>
          <button 
            disabled={isOutOfStock}
            className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-700 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
