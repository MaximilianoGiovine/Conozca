import PageShell from "../components/PageShell";
import CategoryCard from "../components/CategoryCard";
import { getCategories } from "../lib/api";
import styles from "./page.module.css";

export default async function CategoriesPage() {
  let categories = [];

  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <PageShell className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Browse Conozca by topic and editorial focus.</p>
        </div>
        <button className={styles.primaryButton}>Request a topic</button>
      </header>

      <section className={styles.grid}>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            href={`/categories/${category.slug}`}
            title={category.name}
            description={category.description}
            count={category._count?.articles}
          />
        ))}
      </section>
    </PageShell>
  );
}
