// On-demand machine translation for the public article reader.
//
// When a reader opens an article in a locale that has no stored translation,
// we translate it once with DeepL and cache the result in `article_translations`
// (flagged `is_machine_translated = true`). Every subsequent visit — in any
// language — is then served straight from the database.

import { createServiceClient } from '@/lib/supabase/server'
import { isTranslationConfigured, translateArticleTo } from '@/features/cms/services/translationService'
import type { TranslationLanguage } from '@/features/cms/types/cms'

const SUPPORTED: readonly TranslationLanguage[] = ['es', 'en', 'fr', 'pt']

export interface ReaderTranslation {
    language_code: string
    title: string
    content: string
    excerpt: string | null
    is_machine_translated: boolean
    source_language_code: string | null
}

// De-dupe concurrent translation work for the same article+locale within a
// single server instance (e.g. generateMetadata + page render in one request).
const inFlight = new Map<string, Promise<ReaderTranslation | null>>()

export async function ensureArticleTranslation(
    articleId: string,
    targetLocale: string,
): Promise<ReaderTranslation | null> {
    if (!SUPPORTED.includes(targetLocale as TranslationLanguage)) return null

    const key = `${articleId}:${targetLocale}`
    const running = inFlight.get(key)
    if (running) return running

    const task = translateAndCache(articleId, targetLocale)
    inFlight.set(key, task)
    try {
        return await task
    } finally {
        inFlight.delete(key)
    }
}

async function translateAndCache(
    articleId: string,
    targetLocale: string,
): Promise<ReaderTranslation | null> {
    const supabase = createServiceClient()

    const { data: rows, error } = await supabase
        .from('article_translations')
        .select('language_code, title, content, excerpt, is_machine_translated, source_language_code')
        .eq('article_id', articleId)

    if (error || !rows || rows.length === 0) return null

    const existing = rows.find((r) => r.language_code === targetLocale)
    if (existing) return existing as ReaderTranslation

    if (!isTranslationConfigured()) return null

    // Prefer the canonical Spanish text; otherwise any human translation; otherwise anything.
    const source =
        rows.find((r) => r.language_code === 'es') ??
        rows.find((r) => !r.is_machine_translated) ??
        rows[0]

    let translated: { title: string; content: string; excerpt: string }
    try {
        translated = await translateArticleTo(
            targetLocale as TranslationLanguage,
            { title: source.title, content: source.content, excerpt: source.excerpt ?? '' },
            source.language_code,
        )
    } catch (e) {
        console.error('[articleTranslationService] DeepL request failed:', e)
        return null
    }

    // translateText() returns the input untouched when DeepL is misconfigured —
    // never cache a non-translation.
    if (translated.title === source.title && translated.content === source.content) {
        return null
    }

    const row = {
        article_id: articleId,
        language_code: targetLocale,
        title: translated.title,
        content: translated.content,
        excerpt: translated.excerpt || null,
        is_machine_translated: true,
        source_language_code: source.language_code,
        translated_at: new Date().toISOString(),
    }

    const { error: writeError } = await supabase
        .from('article_translations')
        .upsert(row, { onConflict: 'article_id,language_code' })

    if (writeError) {
        // Still return the translation for this request even if caching failed.
        console.error('[articleTranslationService] cache write failed:', writeError)
    }

    return {
        language_code: targetLocale,
        title: row.title,
        content: row.content,
        excerpt: row.excerpt,
        is_machine_translated: true,
        source_language_code: source.language_code,
    }
}
