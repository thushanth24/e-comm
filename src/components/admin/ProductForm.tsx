'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { productSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ImageUploader from './ImageUploader';

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: number };
  categories: Category[];
}

export default function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    price: initialData?.price || 0,
    description: initialData?.description || '',
    inventory: initialData?.inventory || 1,
    categoryId: initialData?.categoryId || (categories[0]?.id || 0),
    featured: initialData?.featured || false,
    images: initialData?.images || [],
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !initialData?.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name),
      }));
    }
  }, [formData.name, initialData?.slug]);

  // Handle images change
  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: urls,
    }));

    // Clear image error
    if (formErrors.images) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    try {
      productSchema.parse(formData);
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);

    try {
      // Create product images objects for the database
      const productImages = formData.images.map(url => ({ url }));
      
      // Prepare data for API
      const apiData = {
        ...formData,
        images: productImages,
      };

      // Determine if we're creating or updating
      const url = initialData?.id 
        ? `/api/products/${initialData.id}` 
        : '/api/products';
      
      const method = initialData?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save product');
      }

      setSuccess(initialData?.id ? 'Product updated successfully!' : 'Product created successfully!');
      
      // Redirect to products list after a brief delay
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-800 ${
              formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm">{formErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="block text-sm font-medium">
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-800 ${
              formErrors.slug ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {formErrors.slug && (
            <p className="text-red-500 text-sm">{formErrors.slug}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium">
            Price ($)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-800 ${
              formErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {formErrors.price && (
            <p className="text-red-500 text-sm">{formErrors.price}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="inventory" className="block text-sm font-medium">
            Inventory
          </label>
          <input
            id="inventory"
            name="inventory"
            type="number"
            min="0"
            value={formData.inventory}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-800 ${
              formErrors.inventory ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {formErrors.inventory && (
            <p className="text-red-500 text-sm">{formErrors.inventory}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="categoryId" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-800 ${
              formErrors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
          {formErrors.categoryId && (
            <p className="text-red-500 text-sm">{formErrors.categoryId}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="featured" className="text-sm font-medium">
              Featured Product
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md dark:bg-gray-800 ${
            formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
        {formErrors.description && (
          <p className="text-red-500 text-sm">{formErrors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Product Images</label>
        <ImageUploader
          existingImages={formData.images}
          onImagesChange={handleImagesChange}
        />
        {formErrors.images && (
          <p className="text-red-500 text-sm">{formErrors.images}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <Button type="submit" isLoading={loading}>
          {initialData?.id ? 'Update Product' : 'Create Product'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/products')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
