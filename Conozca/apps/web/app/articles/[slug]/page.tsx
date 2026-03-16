import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "../../components/PageShell";
import { getArticle } from "../../lib/api";
import styles from "./page.module.css";

const sections = [
  "Intro",
  "Why slow media matters",
  "Signals and noise",
  "Case study",
  "A practical framework",
  "Closing notes",
];

type ArticlePageProps = {
  params: { slug: string };
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug).catch(() => null);

  if (!article) {
    notFound();
  }

  const paragraphs = (article.content ?? "")
    .split("\n\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return (
    <PageShell className={styles.page}>
      <header className={styles.header}>
        <Link href="/articles" className={styles.backLink}>
          ← Back to articles
        </Link>
        <div className={styles.metaRow}>
          <span className={styles.category}>
            {article.category?.name ?? "Editorial"}
          </span>
          <span>Issue 12</span>
          <span>6 min read</span>
        </div>
        <h1>{article.title}</h1>
        <p className={styles.subtitle}>
          {article.excerpt ??
            "A field report on editorial restraint, sustainable growth, and why readers stay when the signal is clear."}
        </p>
        <div className={styles.authorRow}>
          <div className={styles.avatar} />
          <div>
            <span className={styles.authorName}>
              {article.author?.name ?? "Conozca"}
            </span>
            <span className={styles.authorRole}>Editorial Director</span>
          </div>
        </div>
      </header>

      <main className={styles.layout}>
        <aside className={styles.toc}>
          <p className={styles.tocTitle}>Contents</p>
          <ul>
            {sections.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>

        <article className={styles.article}>
          <p className={styles.lead}>
            In a market obsessed with velocity, slow media feels almost
            rebellious. But clarity compounds. Readers respond to rhythm,
            restraint, and a point of view that does not chase the algorithm.
          </p>
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          <div className={styles.tags}>
            <span>{article.category?.name ?? "Editorial"}</span>
            <span>Strategy</span>
            <span>Editorial</span>
          </div>
        </article>
      </main>

      <section className={styles.related}>
        <div className={styles.relatedHeader}>
          <h3>Related essays</h3>
          <Link href="/articles" className={styles.textButton}>
            View all
          </Link>
        </div>
        <div className={styles.relatedGrid}>
          {[
            "Designing for trust in AI products",
            "The new craft of editorial branding",
            "Editorial systems for distributed teams",
          ].map((item) => (
            <article key={item} className={styles.relatedCard}>
              <span>Insight</span>
              <h4>{item}</h4>
              <Link className={styles.textButton} href="/articles/designing-trust">
                Read
              </Link>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
