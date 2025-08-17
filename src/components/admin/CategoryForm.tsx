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
  description: string;
  parentId?: number | null;
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
  parent_id?: number | null;
  children?: CategoryItem[];
  products_count?: number;
}

interface FlattenedCategory {
  id: number;
  name: string;
  slug: string;
  level: number;
}

// Flatten categories for the dropdown
function flattenCategories(categories: CategoryItem[] = [], level: number = 0): FlattenedCategory[] {
  return categories.flatMap(category => {
    const current: FlattenedCategory = { 
      id: category.id, 
      name: '— '.repeat(level) + category.name,
      slug: category.slug,
      level: level
    };
    
    const children = category.children ? 
      flattenCategories(category.children, level + 1) : [];
      
    return [current, ...children];
  });
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<CategoryFormData, 'id' | 'createdAt' | 'updatedAt'>>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
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
            if (category.parent_id) {
              const parent = categoriesMap.get(category.parent_id);
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
      [name]: name === 'parent_id' ? (value ? parseInt(value) : null) : value,
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

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      // Prepare data for validation
      const formDataWithSlug = {
        ...formData,
        slug,
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : null,
        parentId: formData.parentId || null,
      };

      // Validate with zod schema
      const validatedData = categorySchema.parse(formDataWithSlug);

      // Prepare data for Supabase
      // Note: Using double quotes for case-sensitive column names
      const categoryData = {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        "parentId": validatedData.parentId, // Case-sensitive column name
      };

      try {
        let response;
        if (initialData?.id) {
          // Update existing category
          response = await supabase
            .from('Category')
            .update(categoryData)
            .eq('id', initialData.id)
            .select()
            .single();
        } else {
          // Create new category - try with direct SQL first
          console.log('Attempting to create category with data:', categoryData);
          
          // First, try with the direct SQL approach
          const { data, error } = await supabase.rpc('create_category', {
            p_name: categoryData.name,
            p_slug: categoryData.slug,
            p_parent_id: categoryData.parentId || null
          });
          
          if (error) throw error;
          return; // Success, exit early
        }
        
        if (response?.error) {
          console.log('Raw error response:', JSON.stringify(response.error, null, 2));
          throw new Error(response.error.message || 'Database error occurred');
        }
      } catch (error) {
        console.error('Detailed error in category operation:');
        console.error('Error object:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        throw error;
      }

      setSuccess(initialData?.id 
        ? 'Category updated successfully!' 
        : 'Category created successfully!');
      
      // Redirect to categories list after a short delay
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
    } catch (err) {
      console.error('Detailed error saving category:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        formData,
        initialData
      });
      
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
        const errorMessage = err instanceof Error 
          ? `Error: ${err.message}` 
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

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
          />
          {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
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
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="">None (Top-level)</option>
            {categories
              .filter((cat) => cat.id !== initialData?.id)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
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
