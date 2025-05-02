import CategoryForm from '@/components/admin/CategoryForm';
import styles from '@/styles/NewCategory.module.scss';

export default function NewCategory() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Add New Category</h1>
        <p>Create a new product category</p>
      </div>

      <div className={styles.formWrapper}>
        <CategoryForm />
      </div>
    </div>
  );
}
