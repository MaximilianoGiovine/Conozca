import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./site-shell.module.css";

export default function SiteFooter() {
  const t = useTranslations('MagazineFooter');

  return (
    <footer className={styles.footer}>
      <div>
        <div className={styles.logo}>CONOZCA</div>
        <p>{t('tagline')}</p>
      </div>
      <div className={styles.footerLinks}>
        <Link href="/privacidad">{t('privacy')}</Link>
        <Link href="/terminos">{t('terms')}</Link>
        <Link href="/login">{t('login')}</Link>
      </div>
    </footer>
  );
}
