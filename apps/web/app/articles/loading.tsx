import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </div>
      <div className={styles.filters}>
        <div className={styles.searchSkeleton} />
        <div className={styles.chipRow}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.chipSkeleton} />
          ))}
        </div>
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.cardSkeleton} />
        ))}
      </div>
    </div>
  );
}
