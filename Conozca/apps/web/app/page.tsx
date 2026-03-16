import Link from "next/link";
import PageShell from "./components/PageShell";
import styles from "./page.module.css";

export default function Home() {
  return (
    <PageShell className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>Digital Magazine</p>
            <h1 className={styles.heroTitle}>
              Stories that feel slow, clear, and crafted for focus.
            </h1>
            <p className={styles.heroLead}>
              Conozca curates culture, business, and design with a calm reading
              experience and a modern editorial system.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/articles">
                Explore the issue
              </Link>
              <button className={styles.secondaryButton}>View highlights</button>
            </div>
            <div className={styles.heroMeta}>
              <div>
                <span className={styles.metaLabel}>Issue</span>
                <span className={styles.metaValue}>No. 12</span>
              </div>
              <div>
                <span className={styles.metaLabel}>Reading time</span>
                <span className={styles.metaValue}>6 min</span>
              </div>
              <div>
                <span className={styles.metaLabel}>Editors</span>
                <span className={styles.metaValue}>Studio Norte</span>
              </div>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.cardLabel}>Featured</div>
            <h2 className={styles.cardTitle}>
              The quiet advantage of slow media in fast markets.
            </h2>
            <p className={styles.cardSummary}>
              A field report on editorial restraint, sustainable growth, and why
              readers stay when the signal is clear.
            </p>
            <div className={styles.cardFooter}>
              <div className={styles.authorStack}>
                <span className={styles.authorAvatar} />
                <span className={styles.authorAvatar} />
                <span className={styles.authorAvatar} />
              </div>
              <Link className={styles.textButton} href="/articles/quiet-advantage">
                Read story
              </Link>
            </div>
          </div>
        </section>

        <section id="featured" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Featured essays</h3>
            <button className={styles.ghostButton}>View all</button>
          </div>
          <div className={styles.featureGrid}>
            {[
              "Designing for trust in AI products",
              "The new craft of editorial branding",
              "How founders build quiet media companies",
            ].map((title) => (
              <article key={title} className={styles.featureCard}>
                <p className={styles.featureTag}>Insight</p>
                <h4>{title}</h4>
                <p>
                  Calm, precise analysis with actionable detail for modern
                  teams.
                </p>
                <div className={styles.cardFooter}>
                  <Link className={styles.textButton} href="/articles/designing-trust">
                    Open
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="latest" className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <h3>Latest updates</h3>
            <button className={styles.ghostButton}>Browse archive</button>
          </div>
          <div className={styles.latestGrid}>
            {[
              {
                title: "Editorial systems for distributed teams",
                tag: "Operations",
              },
              {
                title: "The new economics of newsletters",
                tag: "Business",
              },
              {
                title: "Design rituals for better writing",
                tag: "Design",
              },
              {
                title: "Curation frameworks for creators",
                tag: "Culture",
              },
            ].map((item) => (
              <article key={item.title} className={styles.latestCard}>
                <span className={styles.latestTag}>{item.tag}</span>
                <h4>{item.title}</h4>
                <Link className={styles.textButton} href="/articles/editorial-systems">
                  Read
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="categories" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Categories</h3>
            <button className={styles.ghostButton}>All categories</button>
          </div>
          <div className={styles.categoryGrid}>
            {["Culture", "Business", "Design", "Tech", "Ideas", "People"].map(
              (item) => (
                <div key={item} className={styles.categoryChip}>
                  {item}
                </div>
              ),
            )}
          </div>
        </section>

        <section id="about" className={styles.newsletter}>
          <div>
            <h3>Subscribe to the Sunday edit</h3>
            <p>
              One email per week. Stories, interviews, and notes from the
              editorial desk.
            </p>
          </div>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="you@studio.com" />
            <button className={styles.primaryButton}>Join the list</button>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
