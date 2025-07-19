"use client";

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import styles from '@/styles/AdminProducts.module.scss';
import { useState, useEffect } from 'react';

export default function ProductTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter((p) => p.id !== id));
    } else {
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
        <span className="ml-4 text-blue-500">Loading products...</span>
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
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={40}
                            height={40}
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
