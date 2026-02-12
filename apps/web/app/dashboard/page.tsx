import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Editorial overview</h1>
          <p>Track the health of each issue and the publishing pipeline.</p>
        </div>
        <button className={styles.primaryButton}>New article</button>
      </div>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Published</span>
          <h2>128</h2>
          <p>Articles live this quarter</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Drafts</span>
          <h2>14</h2>
          <p>Stories in progress</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Scheduled</span>
          <h2>6</h2>
          <p>Next 30 days</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Subscribers</span>
          <h2>4.2k</h2>
          <p>Weekly newsletter</p>
        </div>
      </section>

      <section className={styles.panelGrid}>
        <div className={styles.panel}>
          <h3>Publishing pipeline</h3>
          <div className={styles.pipelineList}>
            {[
              "Issue 12: Slow media for fast markets",
              "Issue 13: The calm growth playbook",
              "Issue 14: Product stories that last",
            ].map((item) => (
              <div key={item} className={styles.pipelineItem}>
                <span>{item}</span>
                <button className={styles.textButton}>Open</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <h3>Team activity</h3>
          <div className={styles.activityList}>
            {[
              "Lina updated Draft: Editorial systems",
              "Marco scheduled Issue 12",
              "Studio Norte approved 3 comments",
            ].map((item) => (
              <div key={item} className={styles.activityItem}>
                <span>{item}</span>
                <span className={styles.activityMeta}>2h</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
