export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
}

export interface Author {
    id: string; // Same as User.id
    slug: string;
    bio?: string;
    social_links?: Record<string, string>;
    created_at: string;
    user?: User; // Joined from public.users
}

export interface Category {
    id: string;
    slug: string;
    created_at: string;
    translations?: CategoryTranslation[];
    translation?: CategoryTranslation | null;
}

export interface CategoryTranslation {
    id: string;
    category_id: string;
    language_code: string;
    name: string;
    description?: string;
}

export interface Article {
    id: string;
    slug: string;
    author_id?: string | null;
    author_name?: string | null;
    category_id?: string;
    published_at?: string;
    created_at: string;
    updated_at: string;
    translations?: ArticleTranslation[];
    translation?: ArticleTranslation | null;
    author?: Author; // Joined
    category?: Category; // Joined
}

export interface ArticleTranslation {
    id: string;
    article_id: string;
    language_code: string;
    title: string;
    content: string;
    excerpt?: string;
}

export interface Comment {
    id: string;
    article_id: string;
    user_id: string;
    content: string;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    user?: User; // Joined
}

export type UserRole = 'superadmin' | 'admin' | 'author' | 'user';

export interface UserWithRole extends User {
    role?: UserRole;
}
