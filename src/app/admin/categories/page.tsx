import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '@/styles/AdminCategories.module.scss';

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
  
  return categories;
}

export default async function AdminCategories() {
  const categories = await getCategories();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Manage product categories</p>
        </div>
        <Link href="/admin/categories/new" className={styles.addButton}>
          Add New Category
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    No categories found.{' '}
                    <Link href="/admin/categories/new">Add your first category</Link>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category._count.products}</td>
                    <td className={styles.actionsCell}>
                      <Link href={`/admin/categories/${category.id}/edit`} className={styles.edit}>
                        Edit
                      </Link>
                      <Link
                        href={`/categories/${category.slug}`}
                        className={styles.view}
                        target="_blank"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
