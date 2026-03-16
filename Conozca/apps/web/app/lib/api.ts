import type { ApiArticle, ApiArticleList, ApiAuthor, ApiCategory } from "./types";

const API_BASE = "http://localhost:3000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getArticles(page = 1, pageSize = 9): Promise<ApiArticleList> {
  return fetchJson<ApiArticleList>(`/articles?page=${page}&pageSize=${pageSize}`);
}

export async function getArticle(slug: string): Promise<ApiArticle> {
  return fetchJson<ApiArticle>(`/articles/${slug}`);
}

export async function getCategories(): Promise<ApiCategory[]> {
  return fetchJson<ApiCategory[]>("/articles/categories");
}

export async function getAuthors(): Promise<ApiAuthor[]> {
  return fetchJson<ApiAuthor[]>("/articles/authors");
}

export async function getAuthor(slug: string): Promise<ApiAuthor> {
  return fetchJson<ApiAuthor>(`/articles/authors/${slug}`);
}

export async function getCategory(slug: string): Promise<ApiCategory> {
  return fetchJson<ApiCategory>(`/articles/categories/${slug}`);
}
