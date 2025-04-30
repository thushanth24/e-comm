import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

interface PageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
    },
  });
  
  return product;
}

async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

export default async function EditProduct({ params }: PageProps) {
  const productId = parseInt(params.id);
  
  if (isNaN(productId)) {
    notFound();
  }
  
  const [product, categories] = await Promise.all([
    getProduct(productId),
    getCategories(),
  ]);
  
  if (!product) {
    notFound();
  }
  
  // Format product data for the form
  const formattedProduct = {
    ...product,
    images: product.images.map(img => img.url),
  };
  
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground mt-2">
          Update product information
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <ProductForm 
          initialData={formattedProduct} 
          categories={categories} 
        />
      </div>
    </div>
  );
}
