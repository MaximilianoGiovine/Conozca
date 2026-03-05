import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./site-shell.module.css";

export default function SiteHeader() {
  const t = useTranslations('MagazineHeader');

  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        CONOZCA
      </Link>
      <nav className={styles.nav}>
        <Link href="/blog">{t('articles')}</Link>
        <Link href="/enlaces">{t('enlaces')}</Link>
        <Link href="/acerca-de">{t('about')}</Link>
      </nav>
      <div className={styles.headerActions}>
        <button className={styles.ghostButton}>{t('subscribe')}</button>
        <Link className={styles.primaryButton} href="/blog">
          {t('startReading')}
        </Link>
      </div>
    </header>
  );
}
