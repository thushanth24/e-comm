"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/AdminCategories.module.scss';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: CategoryItem[];
  _count: {
    products: number;
  };
  level: number;
}

// Add a simple back button
function BackButton() {
  return (
    <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm transition-colors">
      <span className="text-lg">&#8592;</span> Back to Dashboard
    </Link>
  );
}

async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    // Use relative URL in the browser, full URL in server components
    const apiUrl = typeof window === 'undefined' 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`
      : '/api/categories';
      
    const res = await fetch(apiUrl, {
      // Ensure we get fresh data on each request
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Flatten categories into a displayable list with indentation
function flattenCategories(categories: CategoryItem[], level = 0): CategoryItem[] {
  return categories.flatMap((category) => {
    const current: CategoryItem = { 
      ...category, 
      level,
      children: undefined // Remove children from the flattened items
    };
    const children = category.children ? flattenCategories(category.children, level + 1) : [];
    return [current, ...children];
  });
}

export default function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const tree = await fetchCategories();
        setCategories(flattenCategories(tree));
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Manage product categories</p>
        </div>
        <Link href="/admin/categories/new" className={styles.addButton}>
          Add New Category
        </Link>
      </div>
      {loading ? (
        <div className={styles.card}>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Loading categories...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your categories</p>
          </div>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.tableScroll}>
            <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    No categories found.{' '}
                    <Link href="/admin/categories/new">Add your first category</Link>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      {'— '.repeat(category.level)}
                      {category.name}
                    </td>
                    <td>{category.slug}</td>
                    <td>{category._count?.products || 0}</td>
                    <td className={styles.actionsCell}>
                      <Link href={`/admin/categories/${category.id}/edit`} className={styles.edit}>
                        Edit
                      </Link>
                      <Link
                        href={`/categories/${category.slug}`}
                        className={styles.view}
                        target="_blank"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
