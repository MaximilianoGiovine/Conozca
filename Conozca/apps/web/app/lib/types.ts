export type ApiArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author?: {
    id: string;
    name: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

export type ApiArticleList = {
  items: ApiArticle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { articles: number };
};

export type ApiAuthor = {
  id: string;
  name: string;
  slug?: string;
  bio?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  twitter?: string | null;
  _count?: { articles: number };
};

// Type aliases for easier imports
export type Article = ApiArticle;
export type Category = ApiCategory;
export type Author = ApiAuthor;

