'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { categorySchema, type CategoryFormData as CategoryFormSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';
import Button from '@/components/ui/Button';

// Extend the form data type with the id for updates
interface CategoryFormData {
  id?: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData> & { id?: number };
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  children?: CategoryItem[];
  products_count?: number;
}

interface FlattenedCategory {
  id: number;
  name: string;
  slug: string;
  level: number;
  path: string[];
}

// Flatten categories for the dropdown with hierarchical paths
function flattenCategories(categories: CategoryItem[] = [], level: number = 0, path: string[] = []): FlattenedCategory[] {
  return categories.flatMap(category => {
    const currentPath = [...path, category.name];
    const current: FlattenedCategory = { 
      id: category.id, 
      name: category.name,
      slug: category.slug,
      level: level,
      path: currentPath
    };
    
    const children = category.children ? 
      flattenCategories(category.children, level + 1, currentPath) : [];
      
    return [current, ...children];
  });
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [flattenedCategories, setFlattenedCategories] = useState<FlattenedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<CategoryFormData, 'id' | 'createdAt' | 'updatedAt'>>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    parentId: initialData?.parentId ?? null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auto-generate slug
  useEffect(() => {
    if (formData.name && !initialData?.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name),
      }));
    }
  }, [formData.name, initialData?.slug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from Supabase...');
        const { data, error, status, statusText } = await supabase
          .from('Category')
          .select('*')
          .order('name', { ascending: true });
          
        console.log('Categories query result:', { 
          data: data?.length, 
          error, 
          status, 
          statusText 
        });
          
        if (error) throw error;
        
        // Build the category tree
        const categoriesMap = new Map<number, CategoryItem>();
        const rootCategories: CategoryItem[] = [];
        
        // First pass: create map of all categories
        data?.forEach(category => {
          categoriesMap.set(category.id, { ...category, children: [] });
        });
        
        // Second pass: build the tree
        data?.forEach(category => {
          const node = categoriesMap.get(category.id);
          if (node) {
            if (category.parentId) {
              const parent = categoriesMap.get(category.parentId);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
              }
            } else {
              rootCategories.push(node);
            }
          }
        });
        
        setCategories(rootCategories);
        // Generate flattened categories with paths for the dropdown
        const flattened = flattenCategories(rootCategories);
        setFlattenedCategories(flattened);
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'parentId' ? (value ? parseInt(value) : null) : value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      categorySchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const slug = formData.slug || generateSlug(formData.name);
    
    // Prepare data for validation
    const formDataWithSlug = {
      ...formData,
      slug: slug.trim(),
      name: formData.name.trim(),
      parentId: formData.parentId,
    };

    try {
      // Validate with zod schema
      const validatedData = categorySchema.parse(formDataWithSlug);

      // Check for slug uniqueness
      if (!initialData?.id || validatedData.slug !== initialData.slug) {
        const { count } = await supabase
          .from('Category')
          .select('*', { count: 'exact', head: true })
          .eq('slug', validatedData.slug);
          
        if (count && count > 0) {
          throw new Error('A category with this slug already exists');
        }
      }

      // Prepare data for Supabase - match exact column names
      const categoryData = {
        name: validatedData.name,
        slug: validatedData.slug,
        "parentId": validatedData.parentId, // Case-sensitive column name
        "updatedAt": new Date().toISOString()
      };

      if (initialData?.id) {
        // Update existing category
        const { error } = await supabase
          .from('Category')
          .update(categoryData)
          .eq('id', initialData.id);
          
        if (error) {
          console.error('Update error:', error);
          throw new Error(error.message || 'Failed to update category');
        }
      } else {
        // For new category, explicitly exclude the ID to let the database auto-generate it
        const { id, ...newCategoryData } = categoryData as any;
        newCategoryData["createdAt"] = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('Category')
          .insert(newCategoryData)
          .select()
          .single();
          
        if (error) {
          console.error('Create error:', error);
          
          // Handle specific error for duplicate ID
          if (error.code === '23505' && error.message.includes('Category_pkey')) {
            // Retry without ID if there was a conflict
            const { data: retryData, error: retryError } = await supabase
              .from('Category')
              .insert({ ...newCategoryData, id: undefined })
              .select()
              .single();
              
            if (retryError) {
              throw new Error('Failed to create category. Please try again.');
            }
            return;
          }
          
          throw new Error(error.message || 'Failed to create category');
        }
      }

      setSuccess(initialData?.id 
        ? 'Category updated successfully!' 
        : 'Category created successfully!');
      
      // Redirect to categories list after a short delay
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
    } catch (err) {
      console.error('Error saving category:', err);
      
      if (err instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        err.issues.forEach(issue => {
          const path = issue.path[0];
          if (typeof path === 'string') {
            errors[path] = issue.message;
          }
        });
        setFormErrors(errors);
      } else {
        // Handle other errors
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred while saving the category';
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">Category Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="block text-sm font-medium">Slug (URL)</label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md ${formErrors.slug ? 'border-red-500' : 'border-gray-300'}`}
          />
          {formErrors.slug && <p className="text-red-500 text-sm">{formErrors.slug}</p>}
        </div>



        <div className="space-y-2 md:col-span-2">
          <label htmlFor="parentId" className="block text-sm font-medium">Parent Category</label>
          <select
            id="parentId"
            value={formData.parentId ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                parentId: value ? Number(value) : null,
              });
            }}
            className="w-full p-2 border rounded bg-white"
            disabled={isLoading}
          >
            <option value="">None (Top-level)</option>
            {flattenedCategories
              .filter(cat => !initialData?.id || cat.id !== initialData.id) // Don't allow selecting self as parent
              .map((cat) => {
                const indent = '— '.repeat(cat.level);
                const path = cat.path.slice(0, -1).join(' > '); // Exclude the current category name
                const displayName = path ? `${indent}${cat.name} (${path})` : `${indent}${cat.name}`;
                
                return (
                  <option 
                    key={cat.id} 
                    value={cat.id}
                    className={cat.level > 0 ? 'pl-4' : ''}
                    style={{ paddingLeft: `${cat.level * 20 + 8}px` }}
                  >
                    {displayName}
                  </option>
                );
              })}
          </select>
          <style jsx>{`
            select option {
              padding: 8px 12px;
            }
            
            /* Add indentation for nested categories */
            select option[style*="padding-left"] {
              padding-left: 24px !important;
            }
            
            select option[style*="padding-left="][style*="40"] {
              padding-left: 32px !important;
            }
            
            select option[style*="padding-left="][style*="60"] {
              padding-left: 40px !important;
            }
            
            /* Improve dropdown appearance */
            select {
              background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
              background-position: right 0.5rem center;
              background-repeat: no-repeat;
              background-size: 1.5em 1.5em;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              -webkit-appearance: none;
              -moz-appearance: none;
              appearance: none;
            }
          `}</style>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Category' : 'Create Category'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/categories')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
