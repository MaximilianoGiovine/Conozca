import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { CmsStats, ArticleListItem, CommentListItem, AuthorListItem, UserListItem } from '../types/cms'

export const cmsService = {
    async getStats(): Promise<CmsStats> {
        const supabase = await createClient()

        const safeCount = async (query: Promise<{ count: number | null; error: unknown }>) => {
            try { const r = await query; return r.count ?? 0 } catch { return 0 }
        }
        const safeData = async (query: Promise<{ data: unknown[] | null; error: unknown }>) => {
            try { const r = await query; return r.data ?? [] } catch { return [] }
        }

        const [articleRows, catCount, authorCount, userCount, pendingCount, totalCommentCount] = await Promise.all([
            safeData(supabase.from('articles').select('id, published_at') as any),
            safeCount(supabase.from('categories').select('id', { count: 'exact', head: true }) as any),
            safeCount(supabase.from('authors').select('id', { count: 'exact', head: true }) as any),
            safeCount(supabase.from('users').select('id', { count: 'exact', head: true }) as any),
            safeCount(supabase.from('comments').select('id', { count: 'exact', head: true }).eq('is_approved', false) as any),
            safeCount(supabase.from('comments').select('id', { count: 'exact', head: true }) as any),
        ])

        const allArticles = articleRows as { id: string; published_at: string | null }[]
        const published = allArticles.filter(a => a.published_at).length

        return {
            totalArticles: allArticles.length,
            publishedArticles: published,
            draftArticles: allArticles.length - published,
            totalCategories: catCount,
            totalAuthors: authorCount,
            totalUsers: userCount,
            pendingComments: pendingCount,
            totalComments: totalCommentCount,
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
            .limit(20)

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
        // Service client bypasses RLS — needed to list all users as admin
        // SUPABASE_SERVICE_ROLE_KEY debe estar configurada en el entorno
        let supabase
        try {
            supabase = createServiceClient()
        } catch {
            supabase = await createClient()
        }
        const { data, error } = await supabase
            .from('users')
            .select(`id, email, full_name, avatar_url, created_at, user_roles(role, is_approved)`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data ?? []).map((u: any) => ({
            ...u,
            role: u.user_roles?.[0]?.role ?? 'client',
            is_approved: u.user_roles?.[0]?.is_approved ?? false,
        }))
    },

    async updateUserRole(userId: string, role: string): Promise<void> {
        const supabase = await createClient()
        const { error } = await supabase
            .from('user_roles')
            .upsert({ user_id: userId, role }, { onConflict: 'user_id' })
        if (error) throw error
    },

    async updateUserApproval(userId: string, isApproved: boolean): Promise<void> {
        const supabase = await createClient()
        // Determine role to upsert. If record exists, we only update `is_approved`.
        // To be safe with upsert, we need the role, or we can use an update statement.
        // It's safer to use update because `is_approved` assumes they have an account anyway.
        const { error } = await supabase
            .from('user_roles')
            .update({ is_approved: isApproved })
            .eq('user_id', userId)

        // If they had no role record, we insert a default one with the approval.
        if (error) {
            const { error: upsertError } = await supabase
                .from('user_roles')
                .upsert({ user_id: userId, role: 'client', is_approved: isApproved }, { onConflict: 'user_id' })
            if (upsertError) throw upsertError
        }
    },

    async deleteUser(userId: string): Promise<void> {
        const supabase = await createClient()

        // Ensure current user is not deleting themselves
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id === userId) {
             throw new Error("No podés eliminarte a vos mismo.")
        }

        // Supabase offers an admin API to delete users from auth.users,
        // but since we interact with PostgreSQL and normal clients don't have
        // service_role, we might just delete from public.users which cascades?
        // Let's rely on RPC or Admin API if needed, otherwise public.users deletion.
        const { error } = await supabase.from('users').delete().eq('id', userId)
        if (error) throw error
    },
}
