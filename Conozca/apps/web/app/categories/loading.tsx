import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.cardSkeleton} />
        ))}
      </div>
    </div>
  );
}
