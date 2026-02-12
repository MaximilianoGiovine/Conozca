import PageShell from "../components/PageShell";
import AuthorCard from "../components/AuthorCard";
import { getAuthors } from "../lib/api";
import { slugify } from "../lib/slugify";
import styles from "./page.module.css";

export default async function AuthorsPage() {
  let authors = [];

  try {
    authors = await getAuthors();
  } catch {
    authors = [];
  }

  return (
    <PageShell className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Authors</h1>
          <p>Meet the editorial team shaping Conozca.</p>
        </div>
        <button className={styles.primaryButton}>Join the newsroom</button>
      </header>

      <section className={styles.grid}>
        {authors.map((author) => (
          <AuthorCard
            key={author.id}
            href={`/authors/${slugify(author.name)}`}
            name={author.name}
            role="Editorial"
            bio={author.bio}
          />
        ))}
      </section>
    </PageShell>
  );
}
