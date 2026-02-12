"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getArticles } from "../../lib/api";
import type { Article } from "../../lib/types";
import styles from "../dashboard.module.css";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await getArticles();
        setArticles(data.articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Articles</h1>
          <p className={styles.subtitle}>Manage your editorial content</p>
        </div>
        <Link href="/dashboard/articles/new" className={styles.primaryButton}>
          New Article
        </Link>
      </div>

      <div className={styles.filterBar}>
        <input
          type="search"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.filterGroup}>
          <button
            className={statusFilter === "all" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={statusFilter === "PUBLISHED" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("PUBLISHED")}
          >
            Published
          </button>
          <button
            className={statusFilter === "DRAFT" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("DRAFT")}
          >
            Drafts
          </button>
          <button
            className={statusFilter === "ARCHIVED" ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setStatusFilter("ARCHIVED")}
          >
            Archived
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading articles...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td className={styles.titleCell}>
                    <strong>{article.title}</strong>
                    {article.subtitle && (
                      <span className={styles.subtitle}>{article.subtitle}</span>
                    )}
                  </td>
                  <td>{article.author?.name || "—"}</td>
                  <td>
                    <span className={styles.categoryBadge}>{article.category?.name || "—"}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${article.status}`]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>{article.viewCount?.toLocaleString() || "0"}</td>
                  <td className={styles.actionsCell}>
                    <Link href={`/dashboard/articles/${article.slug}`} className={styles.actionLink}>
                      Edit
                    </Link>
                    <Link href={`/articles/${article.slug}`} className={styles.actionLink} target="_blank">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredArticles.length === 0 && (
            <div className={styles.emptyState}>
              <p>No articles found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
