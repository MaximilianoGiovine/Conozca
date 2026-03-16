'use client'
import { useState } from 'react'
import { Languages, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { ArticleTranslationDraft, TranslationLanguage } from '../../types/cms'

interface Props {
    title: string
    content: string
    excerpt: string
    translations: ArticleTranslationDraft[]
    onTranslated: (translations: ArticleTranslationDraft[]) => void
}

const LANG_LABELS: Record<TranslationLanguage, string> = {
    es: '🇪🇸 Español',
    en: '🇺🇸 English',
    fr: '🇫🇷 Français',
    pt: '🇧🇷 Português',
}

export function TranslationPanel({ title, content, excerpt, translations, onTranslated }: Props) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [error, setError] = useState('')

    async function handleTranslate() {
        if (!title || !content) {
            setError('Necesitás un título y contenido antes de traducir.')
            setStatus('error')
            return
        }
        setLoading(true)
        setStatus('idle')
        setError('')

        try {
            const res = await fetch('/api/cms/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, excerpt }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Error al traducir')

            const langs: TranslationLanguage[] = ['es', 'en', 'fr', 'pt']
            const newTranslations: ArticleTranslationDraft[] = langs.map(lang => ({
                language_code: lang,
                title: data.translations[lang].title,
                content: data.translations[lang].content,
                excerpt: data.translations[lang].excerpt,
            }))

            onTranslated(newTranslations)
            setStatus('success')
        } catch (e: any) {
            setError(e.message)
            setStatus('error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Traducciones</p>
                    <div className="flex gap-2 flex-wrap">
                        {(['es', 'en', 'fr', 'pt'] as TranslationLanguage[]).map(lang => {
                            const t = translations.find(t => t.language_code === lang)
                            return (
                                <span key={lang} className={`text-xs px-2 py-1 rounded-full font-medium ${t?.title ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gray-700 text-gray-500'
                                    }`}>
                                    {LANG_LABELS[lang]}
                                </span>
                            )
                        })}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={loading}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/40 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                    {loading ? 'Traduciendo...' : 'Traducir todo'}
                </button>
            </div>

            {status === 'success' && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ¡Artículo traducido a 4 idiomas exitosamente!
                </div>
            )}
            {status === 'error' && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error || 'Error al traducir. Verificá tu DEEPL_API_KEY.'}
                </div>
            )}
        </div>
    )
}
