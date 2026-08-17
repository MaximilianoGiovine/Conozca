import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { routing } from '@/i18n/routing'
import { SITE_URL, absoluteUrl, buildLanguageAlternates } from '@/shared/lib/seo'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.')
    }
    return createClient(supabaseUrl, supabaseKey)
}

// Páginas estáticas públicas indexables (fuera de blog/artículos, que se arman dinámicamente abajo)
const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/', priority: 1, changeFrequency: 'daily' },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
    { path: '/revistas', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/enlaces', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/acerca-de', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/terminos', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/privacidad', priority: 0.2, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = []

    for (const { path, priority, changeFrequency } of STATIC_PATHS) {
        for (const locale of routing.locales) {
            entries.push({
                url: absoluteUrl(locale, path),
                changeFrequency,
                priority,
                alternates: { languages: buildLanguageAlternates(path) },
            })
        }
    }

    try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from('articles')
            .select('slug, updated_at, published_at, translations:article_translations(language_code)')
            .not('published_at', 'is', null)
            .lte('published_at', new Date().toISOString())

        if (error) throw error

        for (const article of data ?? []) {
            const path = `/blog/${article.slug}`
            const availableLocales = (article.translations ?? [])
                .map((t: any) => t.language_code)
                .filter((code: string) => (routing.locales as readonly string[]).includes(code))

            if (availableLocales.length === 0) continue

            const languages = buildLanguageAlternates(path, availableLocales)

            for (const locale of availableLocales) {
                entries.push({
                    url: absoluteUrl(locale, path),
                    lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: { languages },
                })
            }
        }
    } catch {
        // Si Supabase no responde, devolvemos igual el sitemap con las páginas estáticas
        // en vez de romper /sitemap.xml por completo.
    }

    return entries
}
