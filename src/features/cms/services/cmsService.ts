import { createClient } from '@/lib/supabase/server'
import type { CmsStats, ArticleListItem, CommentListItem, AuthorListItem, UserListItem } from '../types/cms'

export const cmsService = {
    async getStats(): Promise<CmsStats> {
        const supabase = await createClient()

        const [articles, categories, authors, users, pendingComments, totalComments] = await Promise.all([
            supabase.from('articles').select('id, published_at'),
            supabase.from('categories').select('id', { count: 'exact', head: true }),
            supabase.from('authors').select('id', { count: 'exact', head: true }),
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('comments').select('id', { count: 'exact', head: true }).eq('is_approved', false),
            supabase.from('comments').select('id', { count: 'exact', head: true }),
        ])

        const allArticles = articles.data ?? []
        const published = allArticles.filter(a => a.published_at).length

        return {
            totalArticles: allArticles.length,
            publishedArticles: published,
            draftArticles: allArticles.length - published,
            totalCategories: categories.count ?? 0,
            totalAuthors: authors.count ?? 0,
            totalUsers: users.count ?? 0,
            pendingComments: pendingComments.count ?? 0,
            totalComments: totalComments.count ?? 0,
        }
    },

    async getArticles(): Promise<ArticleListItem[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('articles')
            .select(`
        id, slug, published_at, created_at, updated_at,
        author:authors(id, slug, user:users(full_name, email)),
        category:categories(slug),
        translations:article_translations(language_code, title, excerpt)
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data as unknown as ArticleListItem[]) ?? []
    },

    async getComments(): Promise<CommentListItem[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('comments')
            .select(`
        id, content, is_approved, created_at,
        article:articles(slug, translations:article_translations(title, language_code)),
        user:users(email, full_name)
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data as unknown as CommentListItem[]) ?? []
    },

    async approveComment(id: string): Promise<void> {
        const supabase = await createClient()
        const { error } = await supabase.from('comments').update({ is_approved: true }).eq('id', id)
        if (error) throw error
    },

    async deleteComment(id: string): Promise<void> {
        const supabase = await createClient()
        const { error } = await supabase.from('comments').delete().eq('id', id)
        if (error) throw error
    },

    async getAuthors(): Promise<AuthorListItem[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('authors')
            .select(`id, slug, bio, social_links, created_at, user:users(email, full_name, avatar_url)`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data as unknown as AuthorListItem[]) ?? []
    },

    async getUsers(): Promise<UserListItem[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('users')
            .select(`id, email, full_name, avatar_url, created_at, user_roles(role)`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data ?? []).map((u: any) => ({
            ...u,
            role: u.user_roles?.[0]?.role ?? 'user',
        }))
    },

    async updateUserRole(userId: string, role: string): Promise<void> {
        const supabase = await createClient()
        const { error } = await supabase
            .from('user_roles')
            .upsert({ user_id: userId, role }, { onConflict: 'user_id' })
        if (error) throw error
    },
}
