import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryForm from '@/components/admin/CategoryForm';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({
  params,
}: PageProps) {
  const id = Number((await params).id);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: { id },
  });

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
