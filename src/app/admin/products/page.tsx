
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import styles from '@/styles/AdminProducts.module.scss';

async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      images: { take: 1 },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return products;
}

export default async function AdminProducts() {
  const products = await getProducts();

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new" className={styles.addButton}>
          Add New Product
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Featured</th>
                <th className={styles.textRight}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyMessage}>
                    No products found. <Link href="/admin/products/new">Add your first product</Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.imageWrapper}>
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className={styles.placeholderIcon}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className={styles.productName}>{product.name}</div>
                          <div className={styles.productSlug}>{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category.name}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {product.inventory > 0 ? (
                        product.inventory
                      ) : (
                        <span className={styles.outOfStock}>Out of stock</span>
                      )}
                    </td>
                    <td>
                      {product.featured ? (
                        <span className={styles.featuredBadge}>Featured</span>
                      ) : (
                        <span className={styles.placeholder}>-</span>
                      )}
                    </td>
                    <td className={styles.textRight}>
                      <Link href={`/admin/products/${product.id}/edit`} className={styles.editLink}>Edit</Link>
                      <Link href={`/products/${product.slug}`} target="_blank" className={styles.viewLink}>View</Link>
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
