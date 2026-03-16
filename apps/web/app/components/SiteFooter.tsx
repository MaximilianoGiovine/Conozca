import Link from "next/link";
import styles from "./site-shell.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div>
        <div className={styles.logo}>Conozca</div>
        <p>Digital magazine platform for thoughtful work.</p>
      </div>
      <div className={styles.footerLinks}>
        <Link href="#">Privacy</Link>
        <Link href="#">Terms</Link>
        <Link href="#">Contact</Link>
        <Link href="/login">Login</Link>
      </div>
    </footer>
  );
}
