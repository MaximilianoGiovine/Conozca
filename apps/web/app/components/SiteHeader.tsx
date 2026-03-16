import Link from "next/link";
import styles from "./site-shell.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        Conozca
      </Link>
      <nav className={styles.nav}>
        <Link href="/articles">Articles</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/authors">Authors</Link>
        <Link href="/#about">About</Link>
      </nav>
      <div className={styles.headerActions}>
        <button className={styles.ghostButton}>Subscribe</button>
        <Link className={styles.primaryButton} href="/articles">
          Start reading
        </Link>
      </div>
    </header>
  );
}
