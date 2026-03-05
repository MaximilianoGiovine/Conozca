// Article CRUD service for the admin CMS
import { createClient } from '@/lib/supabase/server'
import type { ArticleDraft } from '../types/cms'

export const articleCmsService = {
    async create(authorId: string, draft: ArticleDraft) {
        const supabase = await createClient()

        // 1. Create article
        const { data: article, error: articleError } = await supabase
            .from('articles')
            .insert({
                slug: draft.slug,
                author_id: authorId,
                category_id: draft.category_id,
                published_at: draft.published_at,
            })
            .select('id')
            .single()

        if (articleError) throw articleError

        // 2. Insert translations
        const translations = draft.translations.map(t => ({
            article_id: article.id,
            language_code: t.language_code,
            title: t.title,
            content: t.content,
            excerpt: t.excerpt,
        }))

        const { error: transError } = await supabase
            .from('article_translations')
            .insert(translations)

        if (transError) throw transError

        return article
    },

    async update(articleId: string, draft: ArticleDraft) {
        const supabase = await createClient()

        // Update article metadata
        const { error: articleError } = await supabase
            .from('articles')
            .update({
                slug: draft.slug,
                category_id: draft.category_id,
                published_at: draft.published_at,
            })
            .eq('id', articleId)

        if (articleError) throw articleError

        // Upsert translations
        for (const t of draft.translations) {
            const { error } = await supabase
                .from('article_translations')
                .upsert({
                    article_id: articleId,
                    language_code: t.language_code,
                    title: t.title,
                    content: t.content,
                    excerpt: t.excerpt,
                }, { onConflict: 'article_id,language_code' })
            if (error) throw error
        }

        return { id: articleId }
    },

    async getById(id: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('articles')
            .select(`
        id, slug, published_at, category_id,
        author:authors(id, slug),
        translations:article_translations(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async deleteById(id: string) {
        const supabase = await createClient()
        const { error } = await supabase.from('articles').delete().eq('id', id)
        if (error) throw error
    },
}
