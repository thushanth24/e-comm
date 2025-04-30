import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryForm from '@/components/admin/CategoryForm';

interface PageProps {
  params: {
    id: string;
  };
}

async function getCategory(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
  });
  
  return category;
}

export default async function EditCategory({ params }: PageProps) {
  const categoryId = parseInt(params.id);
  
  if (isNaN(categoryId)) {
    notFound();
  }
  
  const category = await getCategory(categoryId);
  
  if (!category) {
    notFound();
  }
  
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground mt-2">
          Update category information
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
}
