
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ProductTable from '@/components/admin/ProductTable';
import styles from '@/styles/AdminProducts.module.scss';

// Add a simple back button
function BackButton() {
  return (
    <Link
      href="/admin"
      className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      <svg width="16" height="16" className="mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back to Dashboard
    </Link>
  );
}

export default function AdminProducts() {
  return (
    <>
      <BackButton />
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition-colors"
            >
              + Add New Product
            </Link>
          </div>
        </div>
        <ProductTable />
      </div>
    </>
  );
}
