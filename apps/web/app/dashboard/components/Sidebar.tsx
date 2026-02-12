"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../dashboard.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.logo}>Conozca</span>
        <span className={styles.badge}>Dashboard</span>
      </div>
      <nav className={styles.navList}>
        <Link className={pathname === "/dashboard" ? styles.navItemActive : styles.navItem} href="/dashboard">
          Overview
        </Link>
        <Link className={pathname === "/dashboard/articles" ? styles.navItemActive : styles.navItem} href="/dashboard/articles">
          Articles
        </Link>
        <Link className={pathname === "/dashboard/categories" ? styles.navItemActive : styles.navItem} href="/dashboard/categories">
          Categories
        </Link>
        <Link className={pathname === "/dashboard/authors" ? styles.navItemActive : styles.navItem} href="/dashboard/authors">
          Authors
        </Link>
        <Link className={pathname === "/dashboard/comments" ? styles.navItemActive : styles.navItem} href="/dashboard/comments">
          Comments
        </Link>
        <Link className={pathname === "/dashboard/analytics" ? styles.navItemActive : styles.navItem} href="/dashboard/analytics">
          Analytics
        </Link>
        <Link className={pathname === "/dashboard/settings" ? styles.navItemActive : styles.navItem} href="/dashboard/settings">
          Settings
        </Link>
      </nav>
      <div className={styles.sidebarFooter}>
        <span>Signed in</span>
        <strong>Studio Norte</strong>
      </div>
    </aside>
  );
}
