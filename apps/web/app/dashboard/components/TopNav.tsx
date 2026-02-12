"use client";

import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function TopNav() {
  const router = useRouter();

  const handleSignOut = () => {
    router.push("/login");
  };

  return (
    <div className={styles.topNav}>
      <div>
        <h2>Dashboard</h2>
        <p>Editorial operations and performance.</p>
      </div>
      <div className={styles.topActions}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search articles, authors"
        />
        <button onClick={handleSignOut} className={styles.ghostButton}>
          Sign out
        </button>
      </div>
    </div>
  );
}
