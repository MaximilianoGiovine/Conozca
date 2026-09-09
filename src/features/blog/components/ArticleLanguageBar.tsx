'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { Link, usePathname, routing } from '@/i18n/routing'

const LANG_KEY: Record<string, 'languageEs' | 'languageEn' | 'languageFr' | 'languagePt'> = {
    es: 'languageEs',
    en: 'languageEn',
    fr: 'languageFr',
    pt: 'languagePt',
}

interface Props {
    /** Whether the version currently shown was produced by machine translation. */
    machineTranslated: boolean
    /** Source language the machine translation was derived from, if any. */
    sourceLanguage?: string | null
}

export function ArticleLanguageBar({ machineTranslated, sourceLanguage }: Props) {
    const t = useTranslations('Article')
    const activeLocale = useLocale()
    const pathname = usePathname()

    return (
        <div className="max-w-4xl mx-auto px-6 pt-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <Languages className="w-4 h-4" />
                    {t('readingIn')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                    {routing.locales.map((loc) => {
                        const isActive = loc === activeLocale
                        return (
                            <Link
                                key={loc}
                                href={pathname}
                                locale={loc}
                                prefetch={false}
                                aria-current={isActive ? 'true' : undefined}
                                className={[
                                    'px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide transition-colors',
                                    isActive
                                        ? 'bg-amber-600 border-amber-600 text-white'
                                        : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700',
                                ].join(' ')}
                            >
                                {loc}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {machineTranslated && (
                <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {t('machineTranslatedNotice', {
                        source: sourceLanguage ? t(LANG_KEY[sourceLanguage] ?? 'languageEs') : t('languageEs'),
                    })}
                </p>
            )}
        </div>
    )
}
