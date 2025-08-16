"use client";

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import styles from '@/styles/AdminProducts.module.scss';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProductTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('Product')
          .select(`
            *,
            category:Category!categoryId(*),
            images:ProductImage!ProductImage_productId_fkey(*)
          `)
          .order('createdAt', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      // First, get all images associated with this product
      const { data: images, error: fetchError } = await supabase
        .from('ProductImage')
        .select('storagePath')
        .eq('productId', id);

      if (fetchError) throw fetchError;

      // Delete images from storage
      if (images && images.length > 0) {
        const imagePaths = images.map(img => img.storagePath).filter((path): path is string => !!path);

        if (imagePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('product-images')
            .remove(imagePaths);

          if (deleteError) {
            console.error('Error deleting images from storage:', deleteError);
            throw deleteError;
          }
        }
      }

      // Delete the product from the database
      const { error: deleteError } = await supabase
        .from('Product')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state to remove the deleted product
      setProducts(products.filter(product => product.id !== id));
      
      // Show success message
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.card}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Featured</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyMessage}>
                  No products found. <Link href="/admin/products/new">Add your first product</Link>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.imageWrapper}>
                        {product.images?.[0]?.storagePath ? (
                          <Image
                            src={product.images[0].storagePath.startsWith('http') 
                              ? product.images[0].storagePath 
                              : `https://jegaqqjdtmspoxlrwwaz.supabase.co/storage/v1/object/public/product-images/${product.images[0].storagePath}`}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="object-cover rounded-md"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder-product.jpg';
                            }}
                          />
                        ) : (
                          <div className={styles.placeholderIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productSlug}>{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{product.category.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    {product.inventory > 0 ? (
                      product.inventory
                    ) : (
                      <span className={styles.outOfStock}>Out of stock</span>
                    )}
                  </td>
                  <td>
                    {product.featured ? (
                      <span className={styles.featuredBadge}>Featured</span>
                    ) : (
                      <span className={styles.placeholder}>-</span>
                    )}
                  </td>
                  <td className={styles.textRight}>
  <div className="flex items-center gap-2 justify-end">
    <Link href={`/admin/products/${product.id}/edit`} className={styles.editLink + ' px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow transition-colors'}>Edit</Link>
    <Link href={`/products/${product.slug}`} target="_blank" className={styles.viewLink + ' px-3 py-1.5 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium shadow transition-colors'}>View</Link>
    <button
      onClick={() => handleDelete(product.id)}
      className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
    >
      Delete
    </button>
  </div>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
