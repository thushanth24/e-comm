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
  parent_id: number | null;
  children?: CategoryItem[];
  products_count: number;
  level: number;
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const loadCategories = async () => {
    try {
      const tree = await fetchCategories();
      setCategories(flattenCategories(tree));
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
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
        .eq('parent_id', id);

      if (subcategoryCount && subcategoryCount > 0) {
        throw new Error('Cannot delete a category that has subcategories');
      }

      // Check if the category has any products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

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
          <p>Manage product categories</p>
        </div>
        <Link href="/admin/categories/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          Add New Category
        </Link>
      </div>
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Loading categories...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your categories</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No categories found. <Link href="/admin/categories/new" className="text-blue-600 hover:underline">Create one</Link> to get started.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-0" style={{ marginLeft: `${category.level * 24}px` }}>
                            {category.level > 0 && '— '}
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {category.products_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link 
                          href={`/admin/categories/${category.id}/edit`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title="Edit category"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={deletingId === category.id}
                          title="Delete category"
                        >
                          {deletingId === category.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
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
