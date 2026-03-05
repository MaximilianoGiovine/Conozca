export interface CmsStats {
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    totalCategories: number
    totalAuthors: number
    totalUsers: number
    pendingComments: number
    totalComments: number
}

export interface ArticleListItem {
    id: string
    slug: string
    published_at: string | null
    created_at: string
    updated_at: string
    author?: {
        id: string
        slug: string
        user?: { full_name: string | null; email: string }
    }
    category?: { slug: string }
    translations?: Array<{
        language_code: string
        title: string
        excerpt: string | null
    }>
}

export interface CommentListItem {
    id: string
    content: string
    is_approved: boolean
    created_at: string
    article?: { slug: string; translations?: Array<{ title: string; language_code: string }> }
    user?: { email: string; full_name: string | null }
}

export interface AuthorListItem {
    id: string
    slug: string
    bio: string | null
    social_links: Record<string, string> | null
    created_at: string
    user?: { email: string; full_name: string | null; avatar_url: string | null }
}

export interface UserListItem {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    created_at: string
    role?: string
}

export type TranslationLanguage = 'es' | 'en' | 'fr' | 'pt'

export interface ArticleTranslationDraft {
    language_code: TranslationLanguage
    title: string
    content: string
    excerpt: string
}

export interface ArticleDraft {
    slug: string
    category_id: string | null
    published_at: string | null
    translations: ArticleTranslationDraft[]
}
