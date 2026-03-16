import Link from "next/link";
import PageShell from "../components/PageShell";
import ArticlesList from "./ArticlesList";
import styles from "./page.module.css";

export default function ArticlesPage() {
  return (
    <PageShell className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.backLink}>
            ← Back to home
          </Link>
          <h1>Articles</h1>
          <p>
            A curated archive of essays, reports, and interviews from the
            Conozca desk.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostButton}>Filters</button>
          <button className={styles.primaryButton}>Subscribe</button>
        </div>
      </header>
      <ArticlesList />

      <section className={styles.cta}>
        <div>
          <h3>Weekly highlights</h3>
          <p>Get one editorial note every Sunday. Short, precise, and calm.</p>
        </div>
        <div className={styles.ctaForm}>
          <input type="email" placeholder="you@studio.com" />
          <button className={styles.primaryButton}>Join</button>
        </div>
      </section>
    </PageShell>
  );
}
