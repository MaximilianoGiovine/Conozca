import { routing } from '@/i18n/routing'

export const SITE_URL = 'https://conozca.org'

const OG_LOCALES: Record<string, string> = {
    es: 'es_AR',
    en: 'en_US',
    fr: 'fr_FR',
    pt: 'pt_BR',
}

export function getOgLocale(locale: string): string {
    return OG_LOCALES[locale] ?? OG_LOCALES[routing.defaultLocale]
}

/** Construye el path público de una locale respetando `localePrefix: 'as-needed'` (la locale por defecto no lleva prefijo). */
export function localizedPath(locale: string, path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    if (locale === routing.defaultLocale) return cleanPath
    return `/${locale}${cleanPath}`
}

export function absoluteUrl(locale: string, path: string): string {
    return `${SITE_URL}${localizedPath(locale, path)}`
}

/**
 * Arma el mapa `alternates.languages` (hreflang) para un path lógico dado.
 * Si se pasa `availableLocales`, solo incluye esas locales (útil para artículos
 * que no tienen traducción real en todos los idiomas, evitando declarar hreflang
 * hacia una URL que en realidad muestra contenido de fallback).
 */
export function buildLanguageAlternates(path: string, availableLocales?: readonly string[]): Record<string, string> {
    const locales = availableLocales ?? routing.locales
    const languages: Record<string, string> = {}
    for (const locale of locales) {
        languages[locale] = absoluteUrl(locale, path)
    }
    languages['x-default'] = absoluteUrl(routing.defaultLocale, path)
    return languages
}
