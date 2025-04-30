import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
  inventory: number;
}

interface ProductListProps {
  products: Product[];
  title?: string;
  emptyMessage?: string;
}

export default function ProductList({ 
  products, 
  title,
  emptyMessage = "No products found."
}: ProductListProps) {
  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      )}
      
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
          <PackageOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-1">No Products Available</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
