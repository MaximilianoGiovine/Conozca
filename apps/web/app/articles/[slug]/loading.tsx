import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </div>
      <div className={styles.body}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.lineSkeleton} />
        ))}
      </div>
    </div>
  );
}
