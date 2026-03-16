import Link from "next/link";
import PageShell from "../../components/PageShell";
import ArticleCard from "../../components/ArticleCard";
import { getArticles, getAuthors } from "../../lib/api";
import { slugify } from "../../lib/slugify";
import styles from "./page.module.css";

type AuthorPageProps = {
  params: { slug: string };
};

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = params;
  const [authors, articlesResponse] = await Promise.all([
    getAuthors().catch(() => []),
    getArticles(1, 12).catch(() => ({ items: [], totalPages: 1 })),
  ]);

  const author = authors.find((item) => slugify(item.name) === slug);
  const articles = articlesResponse.items.filter(
    (item) => item.author?.id === author?.id,
  );

  return (
    <PageShell className={styles.page}>
      <header className={styles.header}>
        <Link href="/authors" className={styles.backLink}>
          ← Back to authors
        </Link>
        <div className={styles.profile}>
          <div className={styles.avatar} />
          <div>
            <h1>{author?.name ?? "Editorial Team"}</h1>
            <p>Editorial Director</p>
          </div>
        </div>
        <p className={styles.bio}>
          {author?.bio ??
            "We curate long-form essays and build editorial systems for teams that care about clarity, pacing, and trust."}
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Recent essays</h3>
          <Link className={styles.textButton} href="/articles">
            View all
          </Link>
        </div>
        <div className={styles.articleList}>
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
        </div>
      </section>
    </PageShell>
  );
}
