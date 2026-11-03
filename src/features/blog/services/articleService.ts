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

    /**
     * Búsqueda paginada de artículos publicados, de más nuevo a más viejo. El criterio
     * (título o autor, ignorando acentos) vive en la función SQL `search_articles`,
     * compartida con las sugerencias del header.
     */
    async searchArticles(locale: string, query: string, page: number, pageSize: number) {
        const empty = { articles: [] as any[], total: 0, page: 1, totalPages: 1 };
        if (!query.trim()) return empty;

        const supabase = getSupabaseClient();
        const args = { p_query: query, p_locale: locale };

        // El total va primero: pedir un rango más allá del final devuelve error.
        // Sin `head: true`: un 404 de HEAD no trae cuerpo y el cliente lo reporta como
        // éxito, así que si faltara la función se vería como "sin resultados".
        const { count, error: countError } = await supabase
            .rpc('search_articles', args, { count: 'exact' })
            .range(0, 0);
        if (countError) throw countError;

        const total = count ?? 0;
        if (total === 0) return empty;

        const totalPages = Math.ceil(total / pageSize);
        const safePage = Math.min(Math.max(1, page), totalPages);
        const from = (safePage - 1) * pageSize;

        const { data, error } = await supabase
            .rpc('search_articles', args)
            .order('published_at', { ascending: false })
            .order('id')
            .range(from, from + pageSize - 1);
        if (error) throw error;

        const articles = (data ?? []).map(({ title, excerpt, ...article }: any) => ({
            ...article,
            translation: { title, excerpt },
        }));

        return { articles, total, page: safePage, totalPages };
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
