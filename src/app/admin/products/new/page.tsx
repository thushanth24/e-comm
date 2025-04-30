import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

export default async function NewProduct() {
  const categories = await getCategories();
  
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground mt-2">
          Create a new product in your catalog
        </p>
      </div>
      
      {categories.length === 0 ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4">
          <p className="text-amber-700 dark:text-amber-400">
            You need to create at least one category before adding products.{' '}
            <a href="/admin/categories/new" className="underline">
              Create a category
            </a>
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <ProductForm categories={categories} />
        </div>
      )}
    </div>
  );
}
