'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, getCategories, formatProductForForm } from '@/lib/supabase';
import ProductForm from '@/components/admin/ProductForm';
import { Category } from '@/components/admin/ProductForm';
import Button from '@/components/ui/Button';

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch product and categories in parallel
        const [productData, categoriesData] = await Promise.all([
          getProductById(Number(id)),
          getCategories(),
        ]);

        if (!productData) {
          throw new Error('Product not found');
        }

        // Format product data for the form
        const formattedProduct = formatProductForForm(productData);
        setProduct(formattedProduct);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const handleSuccess = () => {
    router.push('/admin/products');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4 space-x-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/admin/products')}
                  variant="secondary"
                  className="ml-2"
                >
                  Back to Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-1 text-sm text-gray-500">Update product details below</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {product ? (
            <ProductForm 
              initialData={product}
              categories={categories}
              onSuccess={handleSuccess}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Product not found</p>
              <Button 
                onClick={() => router.push('/admin/products')}
                className="mt-4"
              >
                Back to Products
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
