import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategory() {
  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Category</h1>
        <p className="text-muted-foreground mt-2">
          Create a new product category
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
