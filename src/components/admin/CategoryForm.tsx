'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { categorySchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import Button from '@/components/ui/Button';

type CategoryFormData = z.infer<typeof categorySchema> & {
  parentId?: number | null;
};

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData> & { id?: number };
}

type CategoryItem = {
  id: number;
  name: string;
};

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    parentId: initialData?.parentId || null,
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

  // Load all categories for parent selection
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data: CategoryItem[] = await res.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);

    try {
      const url = initialData?.id
        ? `/api/categories/${initialData.id}`
        : '/api/categories';

      const method = initialData?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save category');
      }

      setSuccess(initialData?.id ? 'Category updated successfully!' : 'Category created successfully!');

      setTimeout(() => {
        router.push('/admin/categories');
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error('Error saving category:', error);
      setError(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setLoading(false);
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
            name="parentId"
            value={formData.parentId ?? ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
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
        <Button type="submit" isLoading={loading}>
          {initialData?.id ? 'Update Category' : 'Create Category'}
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
