'use client'
import { useState, useEffect } from 'react'
import { AcademicEditor } from './AcademicEditor'
import { ArticleImporter } from './ArticleImporter'
import { TranslationPanel } from './TranslationPanel'
import { Save, Globe, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { ArticleTranslationDraft, TranslationLanguage } from '../../types/cms'

const LANGUAGES: { code: TranslationLanguage; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
]

const emptyTranslation = (lang: TranslationLanguage): ArticleTranslationDraft => ({
    language_code: lang,
    title: '',
    content: '',
    excerpt: '',
})

interface Props {
    articleId?: string
    initialData?: {
        slug: string
        category_id: string | null
        published_at: string | null
        translations: ArticleTranslationDraft[]
    }
}

export function ArticleEditor({ articleId, initialData }: Props) {
    const [slug, setSlug] = useState(initialData?.slug ?? '')
    const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '')
    const [published, setPublished] = useState(!!initialData?.published_at)
    const [activeLang, setActiveLang] = useState<TranslationLanguage>('es')
    const [translations, setTranslations] = useState<ArticleTranslationDraft[]>(
        LANGUAGES.map(l => initialData?.translations?.find(t => t.language_code === l.code) ?? emptyTranslation(l.code))
    )
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const activeTranslation = translations.find(t => t.language_code === activeLang) ?? emptyTranslation(activeLang)

    function updateTranslation(lang: TranslationLanguage, field: keyof ArticleTranslationDraft, value: string) {
        setTranslations(prev =>
            prev.map(t => t.language_code === lang ? { ...t, [field]: value } : t)
        )
    }

    function handleImport({ title, html, excerpt }: { title: string; html: string; excerpt: string }) {
        updateTranslation(activeLang, 'title', title)
        updateTranslation(activeLang, 'content', html)
        updateTranslation(activeLang, 'excerpt', excerpt)
        if (!slug && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
        }
    }

    async function handleSave() {
        setSaving(true)
        setError(null)
        try {
            const url = articleId ? `/api/cms/articles/${articleId}` : '/api/cms/articles'
            const method = articleId ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    category_id: categoryId || null,
                    published_at: published ? new Date().toISOString() : null,
                    translations: translations.filter(t => t.title && t.content),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Metadata row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Slug URL</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="mi-articulo-academico"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Estado</label>
                    <button
                        type="button"
                        onClick={() => setPublished(!published)}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${published
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                            }`}
                    >
                        {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {published ? 'Publicado' : 'Borrador'}
                    </button>
                </div>
            </div>

            {/* Document importer */}
            <ArticleImporter onImport={handleImport} />

            {/* Translation panel */}
            <TranslationPanel
                title={activeTranslation.title}
                content={activeTranslation.content}
                excerpt={activeTranslation.excerpt}
                translations={translations}
                onTranslated={setTranslations}
            />

            {/* Language tabs */}
            <div>
                <div className="flex border-b border-gray-800 mb-4 gap-1">
                    {LANGUAGES.map(({ code, label, flag }) => {
                        const hasContent = !!translations.find(t => t.language_code === code)?.title
                        return (
                            <button
                                key={code}
                                type="button"
                                onClick={() => setActiveLang(code)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${activeLang === code
                                        ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                                        : 'border-transparent text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span>{flag}</span>
                                <span>{label}</span>
                                {hasContent && <span className="w-2 h-2 rounded-full bg-green-400" />}
                            </button>
                        )
                    })}
                </div>

                {/* Per-language fields */}
                <div className="space-y-4">
                    {/* Article title */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
                            Título del artículo
                        </label>
                        <input
                            type="text"
                            value={activeTranslation.title}
                            onChange={e => updateTranslation(activeLang, 'title', e.target.value)}
                            placeholder="Título distinguido del artículo académico..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-amber-500"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
                            Extracto / Resumen
                        </label>
                        <textarea
                            value={activeTranslation.excerpt}
                            onChange={e => updateTranslation(activeLang, 'excerpt', e.target.value)}
                            rows={2}
                            placeholder="Breve descripción del artículo (máx. 200 caracteres)..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm focus:outline-none focus:border-amber-500 resize-none"
                        />
                    </div>

                    {/* Academic editor */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
                            Contenido del artículo
                        </label>
                        <AcademicEditor
                            content={activeTranslation.content}
                            onChange={html => updateTranslation(activeLang, 'content', html)}
                            placeholder="Comenzá a escribir el artículo académico aquí..."
                        />
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Save button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !slug}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/40 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar artículo'}
                </button>
            </div>
        </div>
    )
}
