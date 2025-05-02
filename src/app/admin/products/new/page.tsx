import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';
import styles from '@/styles/NewProduct.module.scss';

async function getCategories() {
  const categories = await prisma.category.findMany();
  return categories;
}

export default async function NewProduct() {
  const categories = await getCategories();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Add New Product</h1>
        <p>Create a new product in your catalog</p>
      </div>

      {categories.length === 0 ? (
        <div className={styles.warning}>
          <p>
            You need to create at least one category before adding products.{' '}
            <a href="/admin/categories/new">Create a category</a>
          </p>
        </div>
      ) : (
        <div className={styles.formWrapper}>
          <ProductForm categories={categories} />
        </div>
      )}
    </div>
  );
}
