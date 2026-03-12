import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import styles from "./site-shell.module.css";

export default function SiteHeader() {
  const t = useTranslations('MagazineHeader');

  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        <Image 
          src="/images/logo.png" 
          alt="Conozca Logo" 
          width={180} 
          height={60} 
          className="object-contain h-10 w-auto"
        />
      </Link>
      <nav className={styles.nav}>
        <Link href="/blog">{t('articles')}</Link>
        <Link href="/enlaces">{t('enlaces')}</Link>
        <Link href="/acerca-de">{t('about')}</Link>
      </nav>
      <div className={styles.headerActions}>
        <div className="relative group hidden sm:block">
            <input 
                type="text" 
                placeholder="Buscar artículos..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white transition-all w-64 text-gray-800"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
        </div>
        <Link className={styles.primaryButton} href="/blog">
          {t('startReading')}
        </Link>
      </div>
    </header>
  );
}
