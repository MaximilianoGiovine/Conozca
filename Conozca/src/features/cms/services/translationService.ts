// Translation service using DeepL API
import type { TranslationLanguage } from '../types/cms'

const DEEPL_TARGET_MAP: Record<TranslationLanguage, string> = {
    es: 'ES',
    en: 'EN-US',
    fr: 'FR',
    pt: 'PT-BR',
}

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'
const DEEPL_API_KEY = process.env.DEEPL_API_KEY ?? ''

export async function translateText(
    text: string,
    targetLanguage: TranslationLanguage,
    sourceLang?: string
): Promise<string> {
    if (!DEEPL_API_KEY) {
        console.warn('DEEPL_API_KEY not set — skipping translation')
        return text
    }

    const params = new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        text,
        target_lang: DEEPL_TARGET_MAP[targetLanguage],
        tag_handling: 'html', // Preserve HTML tags from TipTap output
    })
    if (sourceLang) params.set('source_lang', sourceLang.toUpperCase())

    const response = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`DeepL error: ${err}`)
    }

    const data = await response.json()
    return data.translations?.[0]?.text ?? text
}

/**
 * Given HTML content and a title in any source language,
 * returns all 4 translations for es, en, fr, pt.
 */
export async function translateArticleToAllLanguages(
    title: string,
    content: string,
    excerpt: string,
    sourceLang?: string
): Promise<Record<TranslationLanguage, { title: string; content: string; excerpt: string }>> {
    const targets: TranslationLanguage[] = ['es', 'en', 'fr', 'pt']

    const results = await Promise.all(
        targets.map(async (lang) => {
            const [tTitle, tContent, tExcerpt] = await Promise.all([
                translateText(title, lang, sourceLang),
                translateText(content, lang, sourceLang),
                excerpt ? translateText(excerpt, lang, sourceLang) : Promise.resolve(''),
            ])
            return { lang, title: tTitle, content: tContent, excerpt: tExcerpt }
        })
    )

    return results.reduce((acc, { lang, title, content, excerpt }) => {
        acc[lang] = { title, content, excerpt }
        return acc
    }, {} as Record<TranslationLanguage, { title: string; content: string; excerpt: string }>)
}
