'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArticleImporter } from './ArticleImporter'
import { TranslationPanel } from './TranslationPanel'
import { Save, Globe, Eye, EyeOff, Loader2, CalendarClock, BookOpen, Download } from 'lucide-react'
import type { ArticleTranslationDraft, TranslationLanguage } from '../../types/cms'
import { generateArticlePdf, type PdfArticleData } from '@/features/blog/services/pdfGenerator'

const AcademicEditor = dynamic(
    () => import('./AcademicEditor').then(mod => mod.AcademicEditor),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-[300px] flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Cargando editor...</span>
                </div>
            </div>
        ),
    }
)


const LANGUAGES: { code: TranslationLanguage; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
]

const CATEGORIES = [
    { id: '', label: 'Sin categoría' },
    { id: '11111111-1111-1111-1111-111111111111', label: 'Literatura Bíblica' },
    { id: '22222222-2222-2222-2222-222222222222', label: 'Teología' },
    { id: '33333333-3333-3333-3333-333333333333', label: 'Ministerio' },
    { id: '44444444-4444-4444-4444-444444444444', label: 'Misceláneo' },
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
        author_name: string | null
        translations: ArticleTranslationDraft[]
    }
}

export function ArticleEditor({ articleId, initialData }: Props) {
    const [slug, setSlug] = useState(initialData?.slug ?? '')
    const [authorName, setAuthorName] = useState(initialData?.author_name ?? '')
    const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '')
    // Scheduling: null = draft, '' = publish now, filled = scheduled date
    const [scheduledDate, setScheduledDate] = useState<string>(
        initialData?.published_at
            ? new Date(initialData.published_at).toISOString().slice(0, 16)
            : ''
    )
    const [isScheduled, setIsScheduled] = useState(!!initialData?.published_at)
    const [activeLang, setActiveLang] = useState<TranslationLanguage>('es')
    const [translations, setTranslations] = useState<ArticleTranslationDraft[]>(
        LANGUAGES.map(l => initialData?.translations?.find(t => t.language_code === l.code) ?? emptyTranslation(l.code))
    )
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

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

    // Compute published_at: null for draft, scheduled date, or "now" for immediate publish
    function getPublishedAt(): string | null {
        if (!isScheduled) return null
        if (scheduledDate) return new Date(scheduledDate).toISOString()
        return new Date().toISOString()
    }

    async function handleSave() {
        setSaving(true)
        setError(null)
        try {
            const url = articleId ? `/api/cms/articles/${articleId}` : '/api/cms/articles'
            const method = articleId ? 'PUT' : 'POST'
            const finalSlug = slug || activeTranslation.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            if (!finalSlug) throw new Error('El artículo debe tener un título para generar su URL')

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: finalSlug,
                    category_id: categoryId || null,
                    author_name: authorName || null,
                    published_at: getPublishedAt(),
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

    async function handleDownloadPdf() {
        setIsGeneratingPdf(true)
        try {
            const pdfData: PdfArticleData = {
                title: previewArticle?.title || 'Sin título',
                authorName: authorName || null,
                publishedAt: isScheduled && scheduledDate ? new Date(scheduledDate).toISOString() : null,
                slug: slug || 'preview',
                content: String(previewArticle?.content || '<p>Sin contenido.</p>'),
                categoryName: CATEGORIES.find(c => c.id === categoryId)?.label || null,
            }
            await generateArticlePdf(pdfData)
        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const previewArticle = translations.find(t => t.language_code === 'es') ?? translations[0]

    return (
        <div className="space-y-6">
            {/* Preview overlay */}
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-white overflow-auto">
                    {/* Header con botón de descargar y cerrar */}
                    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                            >
                                <EyeOff className="w-4 h-4" /> Cerrar vista previa
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isGeneratingPdf}
                                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                aria-label="Descargar artículo en PDF"
                            >
                                {isGeneratingPdf ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generando PDF…
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Descargar PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Contenido del artículo */}
                    <article className="max-w-4xl mx-auto py-20 px-6">
                        <header className="mb-12 text-center">
                            <h1
                                className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {previewArticle?.title || 'Sin título'}
                            </h1>
                            <div className="flex items-center justify-center space-x-4 text-gray-700">
                                {isScheduled && scheduledDate && (
                                    <span>{new Date(scheduledDate).toLocaleDateString('es')}</span>
                                )}
                                {authorName && (
                                    <>
                                        <span>•</span>
                                        <span>Por {authorName}</span>
                                    </>
                                )}
                            </div>
                        </header>
                        {previewArticle?.excerpt && (
                            <p className="text-lg text-gray-600 italic mb-8 border-l-4 border-amber-500 pl-4">
                                {previewArticle.excerpt}
                            </p>
                        )}
                        <div
                            className="prose prose-lg max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: previewArticle?.content || '<p>Sin contenido.</p>' }}
                        />
                    </article>
                </div>
            )}

            {/* Metadata row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Autor del Artículo</label>
                    <input
                        type="text"
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Categoría</label>
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Publicación</label>
                    <button
                        type="button"
                        onClick={() => setIsScheduled(!isScheduled)}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isScheduled
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        {isScheduled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {isScheduled ? 'Publicado / Programado' : 'Borrador'}
                    </button>
                </div>
            </div>

            {/* Scheduled date picker */}
            {isScheduled && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-2 mb-2">
                        <CalendarClock className="w-4 h-4" /> Fecha y hora de publicación
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={e => setScheduledDate(e.target.value)}
                            className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                        />
                        {!scheduledDate && (
                            <span className="text-amber-400 text-sm">Sin fecha = publicar ahora</span>
                        )}
                        {scheduledDate && new Date(scheduledDate) > new Date() && (
                            <span className="text-blue-400 text-sm flex items-center gap-1">
                                <CalendarClock className="w-4 h-4" /> Programado
                            </span>
                        )}
                    </div>
                </div>
            )}

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

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
                            Título del artículo
                        </label>
                        <input
                            type="text"
                            value={activeTranslation.title}
                            onChange={e => updateTranslation(activeLang, 'title', e.target.value)}
                            placeholder="Título del artículo académico..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-amber-500"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        />
                    </div>

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

            {/* Action buttons */}
            <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium px-5 py-3 rounded-xl transition-colors"
                >
                    <BookOpen className="w-4 h-4" />
                    Vista Previa
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || (!slug && !activeTranslation.title)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/40 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar artículo'}
                </button>
            </div>
        </div>
    )
}
