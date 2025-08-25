import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import CategoryForm from '@/components/admin/CategoryForm';

type Props = {
  params: {
    id: string;
  };
};

// Optional: Helps Next.js 15 type system with metadata inference
export async function generateMetadata() {
  return {};
}

export default async function EditCategoryPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !category) {
    console.error('Error fetching category:', error);
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
