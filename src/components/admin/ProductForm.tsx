'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { getCategoryPath } from '@/lib/categoryPath';
import { productSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';
import Button from '@/components/ui/Button';
import ImageUploader from './ImageUploader';
import styles from '@/styles/ProductForm.module.scss';

type ProductFormData = z.infer<typeof productSchema>;

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: number };
  categories: Category[];
  onSuccess?: () => void;
}

export default function ProductForm({ initialData, categories, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ProductFormData>>(() => {
    const defaultData = {
      name: '',
      slug: '',
      price: 0,
      description: '',
      inventory: 0,
      categoryId: categories[0]?.id ?? 0,
      featured: false,
      images: [] as string[],
    };
    
    return {
      ...defaultData,
      ...initialData,
      images: initialData?.images || [],
    };
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const name = target.name || '';
    
    if (!name) return; // Guard against missing name
    
    setFormData(prev => {
      let newValue: string | number | boolean = target.value;
      
      if (target.type === 'number') {
        newValue = parseFloat(target.value) || 0;
      } else if (target.type === 'checkbox') {
        newValue = target.checked;
      }
      
      return {
        ...prev,
        [name]: newValue
      };
    });

    // Clear error for this field if it exists
    if (name in formErrors) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  useEffect(() => {
    if (formData.name && !initialData?.slug) {
      setFormData(prev => ({
        ...prev,
        slug: typeof prev.name === 'string' ? generateSlug(prev.name) : ''
      }));
    }
  }, [formData.name, initialData?.slug]);

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }));
    
    // Clear any previous image errors
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Ensure we have valid category ID
      const categoryId = formData.categoryId || (categories[0]?.id || 0);
      if (!categoryId) {
        throw new Error('Please select a category');
      }

      // Prepare the data for validation with proper types and defaults
      const formDataToValidate = {
        name: String(formData.name || '').trim(),
        slug: formData.slug || '',
        description: String(formData.description || '').trim(),
        price: Number(formData.price) || 0,
        inventory: Math.max(0, Math.floor(Number(formData.inventory) || 0)),
        categoryId: Number(categoryId),
        featured: Boolean(formData.featured),
        // Ensure all image URLs are valid and properly formatted
        images: (Array.isArray(formData.images) 
          ? formData.images
            .filter(Boolean)
            .map(img => {
              // If it's already a full URL, use it as is
              if (typeof img === 'string' && img.startsWith('http')) return img;
              // Otherwise, ensure it's a string and convert to full URL if needed
              const imgStr = String(img || '');
              return imgStr.startsWith('/') 
                ? `https://jegaqqjdtmspoxlrwwaz.supabase.co/storage/v1/object/public/product-images${imgStr}`
                : `https://jegaqqjdtmspoxlrwwaz.supabase.co/storage/v1/object/public/product-images/${imgStr}`;
            })
          : []
        ).filter(Boolean) // Remove any empty strings that might have resulted from invalid URLs
      };

      // Generate slug if empty
      if (!formDataToValidate.slug) {
        formDataToValidate.slug = generateSlug(formDataToValidate.name);
      }

      // Validate the form data
      const validationResult = productSchema.safeParse(formDataToValidate);
      
      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.issues.forEach(issue => {
          const path = issue.path[0];
          if (typeof path === 'string') {
            errors[path] = issue.message;
          }
        });
        setFormErrors(errors);
        setError('Please fix the validation errors');
        return;
      }

      // At this point, we know validation was successful
      const validatedData = validationResult.data;
      const slug = validatedData.slug || generateSlug(validatedData.name);

      const productData = {
        name: validatedData.name,
        slug,
        price: validatedData.price,
        description: validatedData.description,
        inventory: validatedData.inventory,
        category_id: validatedData.categoryId,
        featured: validatedData.featured,
      };

      let productId = initialData?.id;
      let existingImageUrls: string[] = [];

      if (productId) {
        // Get existing images
        const { data: existingImages, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productId);

        if (imagesError) {
          console.error('Error fetching existing images:', imagesError);
          throw imagesError;
        }

        existingImageUrls = existingImages?.map(img => img.url) || [];
      }

      if (productId) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (updateError) {
          console.error('Error updating product:', updateError);
          throw updateError;
        }
      } else {
        // Create new product
        const { data, error: createError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (createError) {
          console.error('Error creating product:', createError);
          throw createError;
        }
        productId = data.id;
      }

      // Handle product images
      if (validatedData.images && validatedData.images.length > 0) {
        try {
          // Delete any existing images that were removed
          const removedImages = existingImageUrls.filter(url => 
            !validatedData.images.some(img => 
              typeof img === 'string' && url && img.includes(url.split('/').pop() || '')
            )
          );
          
          // Remove old images from storage
          for (const url of removedImages) {
            try {
              const path = url.split('/').pop();
              if (path) {
                await supabase.storage
                  .from('product-images')
                  .remove([path]);
              }
            } catch (error) {
              console.error('Error removing image from storage:', error);
            }
          }

          // Delete existing image records for this product
          const { error: deleteError } = await supabase
            .from('product_images')
            .delete()
            .eq('product_id', productId);

          if (deleteError) {
            console.error('Error deleting existing image records:', deleteError);
            throw deleteError;
          }

          // Insert new image records
          const imageRecords = validatedData.images
            .filter((img): img is string => typeof img === 'string' && img.length > 0)
            .map((url) => ({
              product_id: productId,
              url,
              is_primary: false
            }));

          if (imageRecords.length > 0) {
            const { error: imageError } = await supabase
              .from('product_images')
              .insert(imageRecords);

            if (imageError) {
              console.error('Error inserting new image records:', imageError);
              throw imageError;
            }
          }
        } catch (error) {
          console.error('Error in image handling:', error);
          throw error;
        }
      } else if (existingImageUrls.length > 0) {
        try {
          // Remove all images if none are provided
          const { error: deleteError } = await supabase
            .from('product_images')
            .delete()
            .eq('product_id', productId);
            
          if (deleteError) {
            console.error('Error deleting image records:', deleteError);
            throw deleteError;
          }
            
          // Remove from storage
          for (const url of existingImageUrls) {
            try {
              const path = url.split('/').pop();
              if (path) {
                await supabase.storage
                  .from('product-images')
                  .remove([path]);
              }
            } catch (error) {
              console.error('Error removing file from storage:', error);
            }
          }
        } catch (error) {
          console.error('Error in image cleanup:', error);
          // Don't re-throw here to allow the main operation to complete
        }
      }

      setSuccess(initialData?.id ? 'Product updated successfully!' : 'Product created successfully!');

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      }
    } catch (error: unknown) {
      // Enhanced error logging
      const errorObj = error as any;
      const errorDetails = {
        // Basic error info
        name: errorObj?.name,
        message: errorObj?.message,
        code: errorObj?.code,
        status: errorObj?.status,
        statusCode: errorObj?.statusCode,
        
        // Supabase specific
        hint: errorObj?.hint,
        details: errorObj?.details,
        
        // Form data (safe for logging)
        formData: {
          ...formData,
          images: Array.isArray(formData.images) 
            ? formData.images.map(img => typeof img === 'string' 
                ? img.substring(0, 50) + (img.length > 50 ? '...' : '')
                : 'invalid-image')
            : 'no-images',
        },
        timestamp: new Date().toISOString()
      };

      // Log to console with more details
      console.group('Product Save Error');
      console.error('Error details:', error);
      console.error('Error object:', JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj)));
      console.error('Form data:', errorDetails.formData);
      console.groupEnd();

      // Set user-friendly error message
      let errorMessage = 'An error occurred while saving the product.';
      
      if (errorObj?.message) {
        errorMessage = errorObj.message;
      } 
      
      if (errorObj?.code) {
        switch (errorObj.code) {
          case '23505': // Unique violation
            errorMessage = 'A product with this slug already exists. Please choose a different slug.';
            break;
          case '23503': // Foreign key violation
            errorMessage = 'Invalid category selected. Please select a valid category.';
            break;
          case 'PGRST116': // Not found
            errorMessage = 'The requested resource was not found.';
            break;
          case 'PGRST301': // Invalid schema
            errorMessage = 'Invalid database schema. Please contact support.';
            break;
        }
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  function getParentName(catId: number, cats: Category[]): string {
    const cat = cats.find(c => c.id === catId);
    if (!cat) return '';
    return cat.name;
  }

  function getCategoryPath(catId: number, cats: Category[]): string {
    const cat = cats.find(c => c.id === catId);
    if (!cat) return '';
    
    let path = cat.name;
    let current = cat;
    
    while (current.parentId) {
      // Convert parentId to number for comparison since id is a number
      const parent = cats.find(c => c.id.toString() === current.parentId);
      if (!parent) break;
      path = `${parent.name} > ${path}`;
      current = parent;
    }
    
    return path;
  }

  const renderCategoryOptions = (cats: Category[]): React.ReactNode[] => {
    const flat: Category[] = [];
    function flatten(categories: Category[]) {
      for (const cat of categories) {
        flat.push(cat);
        if (cat.children) flatten(cat.children);
      }
    }
    flatten(cats);
    return flat.map(cat => (
      <option key={cat.id} value={cat.id}>
        {getCategoryPath(cat.id, flat)}
      </option>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="name">Product Name</label>
          <input 
            id="name" 
            name="name" 
            value={formData.name || ''} 
            onChange={handleInputChange} 
          />
          {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="slug">Slug (URL)</label>
          <input 
            id="slug" 
            name="slug" 
            value={formData.slug || ''} 
            onChange={handleInputChange} 
          />
          {formErrors.slug && <p className={styles.error}>{formErrors.slug}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="price">Price (LKR)</label>
          <input 
            id="price" 
            name="price" 
            type="number" 
            min="0" 
            step="0.01" 
            value={formData.price || ''} 
            onChange={handleInputChange} 
          />
          {formErrors.price && <p className={styles.error}>{formErrors.price}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="inventory">Inventory</label>
          <input 
            id="inventory" 
            name="inventory" 
            type="number" 
            min="0" 
            value={formData.inventory || ''} 
            onChange={handleInputChange} 
          />
          {formErrors.inventory && <p className={styles.error}>{formErrors.inventory}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="categoryId">Category</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            value={formData.categoryId || ''} 
            onChange={handleInputChange}
          >
            {renderCategoryOptions(categories)}
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
        <textarea 
          id="description" 
          name="description" 
          rows={5} 
          value={formData.description || ''} 
          onChange={handleInputChange} 
        />
        {formErrors.description && <p className={styles.error}>{formErrors.description}</p>}
      </div>

      <div className={styles.field}>
        <label>Product Images</label>
        <div className="space-y-2">
          <ImageUploader
            existingImages={formData.images || []}
            onImagesChange={handleImagesChange}
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
          </p>
          {formErrors.images && (
            <p className="mt-1 text-sm text-red-600">{formErrors.images}</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" isLoading={loading}>
          {initialData?.id ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
