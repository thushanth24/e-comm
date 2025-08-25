"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCategories, supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
import styles from '@/styles/AdminCategories.module.scss';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: CategoryItem[];
  products_count: number;
  level: number;
  path?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
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
    const categories = await getCategories();
    
    // Flatten categories into a displayable list with indentation
    const flattenCategories = (categories: CategoryItem[], level = 0): CategoryItem[] => {
      return categories.reduce<CategoryItem[]>((acc, category) => {
        const categoryItem: CategoryItem = {
          ...category,
          level,
          products_count: category.products_count || 0,
        };
        
        acc.push(categoryItem);

        if (category.children && category.children.length > 0) {
          acc.push(...flattenCategories(category.children, level + 1));
        }

        return acc;
      }, []);
    };
    
    // Type assertion to handle the CategoryWithCount to CategoryItem conversion
    return flattenCategories(categories as unknown as CategoryItem[]);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Flatten categories into a displayable list with full paths
function flattenCategories(categories: CategoryItem[], level = 0, path: string[] = []): CategoryItem[] {
  return categories.flatMap((category) => {
    const currentPath = [...path, category.name];
    const current: CategoryItem = { 
      ...category, 
      level,
      path: currentPath.join(' > '),
      children: undefined // Remove children from the flattened items
    };
    const children = category.children ? 
      flattenCategories(category.children, level + 1, currentPath) : [];
    return [current, ...children];
  });
}

export default function AdminCategories() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const tree = await fetchCategories();
      console.log('Categories loaded successfully:', tree);
      setCategories(flattenCategories(tree));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';
        
      console.error('Failed to load categories:', {
        error: errorMessage,
        details: error
      });
      
      toast.error(`Failed to load categories: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      // First, check if the category has any subcategories
      const { count: subcategoryCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parentId', id);

      if (subcategoryCount && subcategoryCount > 0) {
        throw new Error('Cannot delete a category that has subcategories');
      }

      // Check if the category has any products
      const { count: productCount } = await supabase
        .from('Product')
        .select('*', { count: 'exact', head: true })
        .eq('categoryId', id);

      if (productCount && productCount > 0) {
        throw new Error('Cannot delete a category that has products');
      }

      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Category deleted successfully');
      // Refresh the categories list
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Manage product categories and their hierarchy</p>
        </div>
        <Link 
          href="/admin/categories/new" 
          className={styles.addButton}
        >
          <Plus size={16} />
          Add New Category
        </Link>
      </div>
      
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading categories...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={4}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </div>
                      <h3>No categories found</h3>
                      <p>Get started by creating your first category</p>
                      <Link href="/admin/categories/new" className={styles.addButton}>
                        <Plus size={16} />
                        Add New Category
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={`${category.id}-${category.level}-${index}`}>
                    <td data-label="Name" data-level={category.level}>
                      <div className={`${styles.categoryName} ${styles[`level-${category.level}`]}`}>
                        <svg 
                          className={`${styles.folderIcon} ${category.level === 0 ? styles.folderIconMain : ''}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth={category.level === 0 ? '2' : '1.5'}
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <div className={styles.categoryPathContainer}>
                          <span className={styles.categoryPath}>
                            {category.path}
                          </span>
                          {category.level === 0 && <span className={styles.mainCategoryBadge}>Main Category</span>}
                        </div>
                      </div>
                    </td>
                    <td data-label="Slug">
                      <code>{category.slug}</code>
                    </td>
                    <td data-label="Products">
                      <span className={styles.productCount}>
                        {category.products_count || 0}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actions}>
                        <Link 
                          href={`/admin/categories/${category.id}/edit`}
                          className="edit"
                          title="Edit category"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="delete"
                          disabled={deletingId === category.id}
                          title="Delete category"
                        >
                          {deletingId === category.id ? (
                            <span className={styles.spinner}></span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
