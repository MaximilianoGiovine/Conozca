"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuthors } from "../../lib/api";
import type { Author } from "../../lib/types";
import styles from "../dashboard.module.css";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchAuthors() {
      try {
        const data = await getAuthors();
        setAuthors(data);
      } catch (error) {
        console.error("Error fetching authors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAuthors();
  }, []);

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Authors</h1>
          <p className={styles.subtitle}>Manage your editorial contributors</p>
        </div>
        <button className={styles.primaryButton}>New Author</button>
      </div>

      <div className={styles.filterBar}>
        <input
          type="search"
          placeholder="Search authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading authors...</div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredAuthors.map((author) => (
            <div key={author.id} className={styles.authorCard}>
              <div className={styles.authorAvatar}>
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.authorInfo}>
                <h3>{author.name}</h3>
                {author.bio && <p className={styles.authorBio}>{author.bio}</p>}
                <div className={styles.authorStats}>
                  <span className={styles.statItem}>
                    <strong>{author._count?.articles || 0}</strong> articles
                  </span>
                  {author.twitter && (
                    <a
                      href={`https://twitter.com/${author.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      @{author.twitter}
                    </a>
                  )}
                </div>
              </div>
              <div className={styles.cardActions}>
                <Link href={`/dashboard/authors/${author.slug}`} className={styles.actionLink}>
                  Edit
                </Link>
                <Link href={`/authors/${author.slug}`} className={styles.actionLink} target="_blank">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredAuthors.length === 0 && (
        <div className={styles.emptyState}>
          <p>No authors found</p>
        </div>
      )}
    </div>
  );
}
