import Link from "next/link";
import styles from "./cards.module.css";

type CategoryCardProps = {
  href: string;
  title: string;
  description?: string | null;
  count?: number;
};

export default function CategoryCard({
  href,
  title,
  description,
  count,
}: CategoryCardProps) {
  return (
    <article className={styles.simpleCard}>
      <span className={styles.badge}>Editorial</span>
      <h2 className={styles.cardTitle}>{title}</h2>
      {description ? <p className={styles.cardSubtitle}>{description}</p> : null}
      {typeof count === "number" ? (
        <span className={styles.cardSubtitle}>{count} essays</span>
      ) : null}
      <div className={styles.buttonRow}>
        <Link className={styles.textButton} href={href}>
          View essays
        </Link>
      </div>
    </article>
  );
}
