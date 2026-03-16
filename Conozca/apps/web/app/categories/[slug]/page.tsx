import Link from "next/link";
import PageShell from "../../components/PageShell";
import ArticleCard from "../../components/ArticleCard";
import { getArticles, getCategories } from "../../lib/api";
import styles from "./page.module.css";

type CategoryPageProps = {
  params: { slug: string };
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const [categories, articlesResponse] = await Promise.all([
    getCategories().catch(() => []),
    getArticles(1, 12).catch(() => ({ items: [], totalPages: 1 })),
  ]);

  const category = categories.find((item) => item.slug === slug);
  const articles = articlesResponse.items.filter(
    (item) => item.category?.slug === slug,
  );

  return (
    <PageShell className={styles.page}>
      <header className={styles.header}>
        <Link href="/categories" className={styles.backLink}>
          ← Back to categories
        </Link>
        <h1>{category?.name ?? "Category"}</h1>
        <p>
          {category?.description ??
            "Essays and field notes exploring culture, media, and editorial practice."}
        </p>
      </header>

      <section className={styles.list}>
        {articles.length === 0 ? (
          <div className={styles.emptyState}>No essays published yet.</div>
        ) : (
          articles.map((item) => (
            <ArticleCard
              key={item.id}
              href={`/articles/${item.slug}`}
              title={item.title}
              summary={item.excerpt ?? undefined}
              category={item.category?.name}
              readTime="5 min"
              authorName={item.author?.name}
              authorRole="Editorial"
            />
          ))
        )}
      </section>
    </PageShell>
  );
}
