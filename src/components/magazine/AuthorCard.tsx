import Link from "next/link";
import styles from "./cards.module.css";

type AuthorCardProps = {
  href: string;
  name: string;
  role?: string;
  bio?: string | null;
};

export default function AuthorCard({ href, name, role, bio }: AuthorCardProps) {
  return (
    <article className={styles.simpleCard}>
      <span className={styles.avatar} />
      <div>
        <h2 className={styles.cardTitle}>{name}</h2>
        <span className={styles.badge}>{role ?? "Editorial"}</span>
      </div>
      {bio ? <p className={styles.cardSubtitle}>{bio}</p> : null}
      <div className={styles.buttonRow}>
        <Link className={styles.textButton} href={href}>
          View profile
        </Link>
      </div>
    </article>
  );
}
