import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: number;
  images: { url: string }[];
}

async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function EditProductPage({ params }: PageProps) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: id },
    include: {
      images: true,
    },
  });

  if (!product) {
    notFound();
  }

  const categories = await getCategories();
  
  // Format product data for the form
  const formattedProduct = {
    ...product,
    images: product.images.map((img: { url: string }) => img.url),
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
