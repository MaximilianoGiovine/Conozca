import { createClient } from '@supabase/supabase-js';
import { ensureArticleTranslation } from './articleTranslationService';

// Lazy initialization: se crea el cliente SÓLO cuando se llama a una función,
// no durante el import del módulo (lo que rompe el build de Next.js sin env vars)
function getSupabaseClient() {
    // On the server (SSR/RSC), use the internal Docker URL to avoid hairpin NAT issues.
    // On the client browser, fall back to the public URL.
    const supabaseUrl = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
    }
    return createClient(supabaseUrl, supabaseKey);
}

export const articleService = {
    async getArticles(locale: string, categoryId?: string | null) {
        const supabase = getSupabaseClient();
        let query = supabase
            .from('articles')
            .select(`
        *,
        translations:article_translations(*),
        category:categories(id, slug, translations:category_translations(*))
      `)
            .not('published_at', 'is', null)
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false });

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Filter translations to match the desired locale, or fallback to 'es'
        return data.map((article: any) => {
            const translation = article.translations?.find((t: any) => t.language_code === locale) ||
                article.translations?.find((t: any) => t.language_code === 'es') ||
                null;
            return {
                ...article,
                translation
            }
        });
    },

    async getArticleBySlug(slug: string, locale: string) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('articles')
            .select(`
        *,
        translations:article_translations(*),
        category:categories(id, slug, translations:category_translations(*))
      `)
            .eq('slug', slug)
            .not('published_at', 'is', null)
            .lte('published_at', new Date().toISOString())
            .single();

        if (error) return null;

        const translation = data.translations?.find((t: any) => t.language_code === locale) ||
            data.translations?.find((t: any) => t.language_code === 'es') ||
            null;

        return {
            ...data,
            translation
        };
    },

    /**
     * Like getArticleBySlug, but if the article has no version in `locale` it is
     * machine-translated on the fly (and cached) so every reader can view and
     * download it in their preferred language.
     */
    async getArticleForReader(slug: string, locale: string) {
        const article = await this.getArticleBySlug(slug, locale);
        if (!article) return null;

        if (article.translation?.language_code === locale) {
            return article;
        }

        try {
            const generated = await ensureArticleTranslation(article.id, locale);
            if (generated) {
                return { ...article, translation: generated };
            }
        } catch (e) {
            console.error('[articleService.getArticleForReader] translation failed:', e);
        }

        // Fall back to whatever getArticleBySlug picked (locale match or Spanish).
        return article;
    },

    async getCategories(locale: string) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('categories')
            .select(`
        *,
        translations:category_translations(*)
      `);

        if (error) throw error;

        return data.map((cat: any) => {
            const translation = cat.translations?.find((t: any) => t.language_code === locale) ||
                cat.translations?.find((t: any) => t.language_code === 'es') ||
                null;
            return {
                ...cat,
                translation
            }
        });
    }
};
