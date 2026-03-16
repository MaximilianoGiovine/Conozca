"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ArticleCard from "../components/ArticleCard";
import { getArticles, getCategories } from "../lib/api";
import type { ApiArticle, ApiCategory } from "../lib/types";
import styles from "./page.module.css";

const PAGE_SIZE = 9;

function buildSummary(article: ApiArticle) {
  const raw = article.excerpt ?? article.content ?? "";
  if (!raw) {
    return "";
  }
  const trimmed = raw.replace(/\s+/g, " ").trim();
  return trimmed.length > 140 ? `${trimmed.slice(0, 140)}...` : trimmed;
}

function estimateReadTime(content?: string | null) {
  if (!content) {
    return "4 min";
  }
  const words = content.split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(words / 220));
  return `${minutes} min`;
}

export default function ArticlesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "All";
  const initialPage = Number(searchParams.get("page") ?? "1");

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [page, setPage] = useState(Number.isNaN(initialPage) ? 1 : initialPage);
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
    setActiveCategory(initialCategory);
    setPage(Number.isNaN(initialPage) ? 1 : initialPage);
  }, [initialQuery, initialCategory, initialPage]);

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getArticles(page, PAGE_SIZE)
      .then((data) => {
        if (isMounted) {
          setArticles(data.items);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load articles.");
          setArticles([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }
      if (activeCategory !== "All") {
        params.set("category", activeCategory);
      }
      params.set("page", String(page));

      const next = params.toString();
      const current = searchParams.toString();
      if (next !== current) {
        router.replace(next ? `${pathname}?${next}` : pathname);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeCategory, page, pathname, router, searchParams]);

  const categoryNames = useMemo(() => {
    const names = categories.map((category) => category.name);
    return ["All", ...names];
  }, [categories]);

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === "All"
        ? articles
        : articles.filter(
            (article) => article.category?.name === activeCategory,
          );

    if (!query.trim()) {
      return byCategory;
    }

    const normalized = query.toLowerCase();
    return byCategory.filter((article) =>
      [article.title, article.excerpt, article.category?.name, article.author?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [activeCategory, articles, query]);

  return (
    <>
      <section className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search essays, topics, authors"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <span className={styles.searchHint}>{filtered.length} results</span>
        </div>
        <div className={styles.filterRow}>
          {categoryNames.map((item) => (
            <button
              key={item}
              className={`${styles.filterChip} ${
                activeCategory === item ? styles.filterChipActive : ""
              }`}
              onClick={() => {
                setActiveCategory(item);
                setPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className={styles.emptyState}>{error}</div> : null}

      <section className={styles.grid}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.cardSkeleton} />
            ))
          : filtered.map((article) => (
              <ArticleCard
                key={article.id}
                href={`/articles/${article.slug}`}
                title={article.title}
                summary={buildSummary(article)}
                category={article.category?.name}
                readTime={estimateReadTime(article.content)}
                authorName={article.author?.name}
                authorRole="Editorial"
              />
            ))}
      </section>

      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span className={styles.paginationMeta}>
          Page {page} of {totalPages}
        </span>
        <button
          className={styles.paginationButton}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
}
