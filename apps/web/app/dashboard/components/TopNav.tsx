import styles from "../dashboard.module.css";

export default function TopNav() {
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
        <button className={styles.ghostButton}>Invite</button>
      </div>
    </div>
  );
}
