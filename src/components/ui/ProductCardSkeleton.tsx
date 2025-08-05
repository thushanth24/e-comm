import styles from '@/styles/ProductCard.module.scss';

const ProductCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={`${styles.imageWrapper} ${styles.skeleton}`}>
        <div className={styles.image} />
      </div>
      <div className={styles.info}>
        <div className={`${styles.titleSkeleton} ${styles.skeleton}`} />
        <div className={styles.footer}>
          <div className={`${styles.priceSkeleton} ${styles.skeleton}`} />
        </div>
      </div>
    </div>
  );
};

export { ProductCardSkeleton };
export default ProductCardSkeleton;
