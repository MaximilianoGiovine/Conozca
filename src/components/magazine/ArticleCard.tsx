import Link from "next/link";
import styles from "./cards.module.css";

type ArticleCardProps = {
  href: string;
  title: string;
  summary?: string;
  category?: string;
  readTime?: string;
  authorName?: string;
  authorRole?: string;
};

export default function ArticleCard({
  href,
  title,
  summary,
  category,
  readTime,
  authorName,
  authorRole,
}: ArticleCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.category}>{category ?? "Editorial"}</span>
        <span className={styles.readTime}>{readTime ?? "6 min"}</span>
      </div>
      <h2 className={styles.title}>{title}</h2>
      {summary ? <p className={styles.summary}>{summary}</p> : null}
      <div className={styles.cardFooter}>
        <div className={styles.author}>
          <span className={styles.avatar} />
          <div>
            <span className={styles.authorName}>{authorName ?? "Conozca"}</span>
            <span className={styles.authorRole}>{authorRole ?? "Editorial"}</span>
          </div>
        </div>
        <Link className={styles.textButton} href={href}>
          Read
        </Link>
      </div>
    </article>
  );
}
