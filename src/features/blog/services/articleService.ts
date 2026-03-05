import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const articleService = {
    async getArticles(locale: string) {
        const { data, error } = await supabase
            .from('articles')
            .select(`
        *,
        translations:article_translations(*)
      `)
            .order('published_at', { ascending: false });

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
        translations:article_translations(*)
      `)
            .eq('slug', slug)
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
