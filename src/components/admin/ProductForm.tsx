'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { productSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ImageUploader from './ImageUploader';
import styles from '@/styles/ProductForm.module.scss';

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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  useEffect(() => {
    if (formData.name && !initialData?.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, initialData?.slug]);

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }));
    if (formErrors.images) {
      const newErrors = { ...formErrors };
      delete newErrors.images;
      setFormErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    try {
      productSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) errors[err.path[0]] = err.message;
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

    if (!validateForm()) return;
    setLoading(true);

    try {
      const productImages = formData.images.map(url => ({ url }));
      const apiData = { ...formData, images: productImages };

      const url = initialData?.id ? `/api/products/${initialData.id}` : '/api/products';
      const method = initialData?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save product');
      }

      setSuccess(initialData?.id ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="name">Product Name</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} />
          {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="slug">Slug (URL)</label>
          <input id="slug" name="slug" value={formData.slug} onChange={handleChange} />
          {formErrors.slug && <p className={styles.error}>{formErrors.slug}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="price">Price (LKR)</label>
          <input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} />
          {formErrors.price && <p className={styles.error}>{formErrors.price}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="inventory">Inventory</label>
          <input id="inventory" name="inventory" type="number" min="0" value={formData.inventory} onChange={handleChange} />
          {formErrors.inventory && <p className={styles.error}>{formErrors.inventory}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {formErrors.categoryId && <p className={styles.error}>{formErrors.categoryId}</p>}
        </div>

        <div className={styles.checkbox}>
          <input id="featured" name="featured" type="checkbox" checked={formData.featured} onChange={handleCheckboxChange} />
          <label htmlFor="featured">Featured Product</label>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={5} value={formData.description} onChange={handleChange} />
        {formErrors.description && <p className={styles.error}>{formErrors.description}</p>}
      </div>

      <div className={styles.field}>
        <label>Product Images</label>
        <ImageUploader existingImages={formData.images} onImagesChange={handleImagesChange} />
        {formErrors.images && <p className={styles.error}>{formErrors.images}</p>}
      </div>

      <div className={styles.actions}>
        <Button type="submit" isLoading={loading}>{initialData?.id ? 'Update Product' : 'Create Product'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/products')}>Cancel</Button>
      </div>
    </form>
  );
}
