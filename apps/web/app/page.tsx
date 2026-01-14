import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Conozca</h1>
        <p className={styles.description}>
          Digital Magazine Platform
        </p>
        <div className={styles.ctas}>
          <p>Frontend implementation starting now...</p>
        </div>
      </main>
    </div>
  );
}
