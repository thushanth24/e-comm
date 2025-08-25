import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import ProductForm, { Category } from '@/components/admin/ProductForm';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: number;
  ProductImage: { url: string }[];
}

async function getCategories(): Promise<Category[]> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  if (!categories) return [];

  // Map database fields to our TypeScript interface
  const mappedCategories: Category[] = categories.map(category => ({
    ...category,
    parentId: category.parentId ? Number(category.parentId) : null,
    children: []
  }));

  // Build category tree
  const categoryMap = new Map<number, Category>();
  const rootCategories: Category[] = [];

  // First pass: create map of all categories
  mappedCategories.forEach(category => {
    categoryMap.set(category.id, category);
  });

  // Second pass: build tree structure
  mappedCategories.forEach(category => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

type PageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: PageProps) {
  const [{ data: product }, categories] = await Promise.all([
    supabase
      .from('Product')
      .select(`
        *,
        ProductImage(*)
      `)
      .eq('id', params.id)
      .single(),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground mt-2">
            Update product information
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <ProductForm
            initialData={{
              ...product,
              categoryId: product.category_id,
              images: product.ProductImage?.map((img: { url: string }) => img.url) || [],
            }}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}
