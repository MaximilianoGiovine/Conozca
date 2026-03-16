import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const articleService = {
    async getArticles(locale: string, categoryId?: string | null) {
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

    async getCategories(locale: string) {
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
