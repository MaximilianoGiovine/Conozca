'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { ArticleCard } from './ArticleCard'

const PAGE_SIZE = 12

// Semantic categories for the category filter
const SEMANTIC_CATEGORIES = [
    { id: '11111111-1111-1111-1111-111111111111', label: 'Literatura Bíblica' },
    { id: '22222222-2222-2222-2222-222222222222', label: 'Teología' },
    { id: '33333333-3333-3333-3333-333333333333', label: 'Ministerio' },
    { id: '44444444-4444-4444-4444-444444444444', label: 'Misceláneo' },
]

type ViewMode = 'grid' | 'year'

interface Props {
    articles: any[]
}

export function BlogContent({ articles }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [filterOpen, setFilterOpen] = useState(false)
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())
    const filterRef = useRef<HTMLDivElement>(null)

    // Close filter panel when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false)
            }
        }
        if (filterOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [filterOpen])

    // Articles sorted newest → oldest by default
    const sortedArticles = useMemo(() =>
        [...articles].sort((a, b) => {
            const da = new Date(a.published_at ?? 0).getTime()
            const db = new Date(b.published_at ?? 0).getTime()
            return db - da
        }), [articles])

    // ── GRID MODE ────────────────────────────────────────────────────────
    const filtered = activeCategoryId
        ? sortedArticles.filter((a: any) => a.category_id === activeCategoryId)
        : sortedArticles

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    // ── YEAR MODE ────────────────────────────────────────────────────────
    // Articles sorted oldest → newest for archive
    const archiveArticles = useMemo(() =>
        [...articles].sort((a, b) => {
            const da = new Date(a.published_at ?? 0).getTime()
            const db = new Date(b.published_at ?? 0).getTime()
            return da - db
        }), [articles])

    const articlesByYear = useMemo(() => {
        const map = new Map<number, any[]>()
        for (const a of archiveArticles) {
            if (!a.published_at) continue
            const year = new Date(a.published_at).getFullYear()
            if (!map.has(year)) map.set(year, [])
            map.get(year)!.push(a)
        }
        // Years ordered oldest to newest
        return Array.from(map.entries()).sort(([a], [b]) => a - b)
    }, [archiveArticles])

    // ── HELPERS ──────────────────────────────────────────────────────────
    function handleCategory(id: string | null) {
        setActiveCategoryId(id)
        setCurrentPage(1)
        setViewMode('grid')
        setFilterOpen(false)
    }

    function handleYearMode() {
        setViewMode('year')
        setFilterOpen(false)
    }

    function handleResetFilter() {
        setActiveCategoryId(null)
        setCurrentPage(1)
        setViewMode('grid')
        setFilterOpen(false)
    }

    function goTo(page: number) {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function toggleYear(year: number) {
        setExpandedYears(prev => {
            const next = new Set(prev)
            if (next.has(year)) next.delete(year)
            else next.add(year)
            return next
        })
    }

    // Smart page range
    const pageRange = useMemo(() => {
        const delta = 2
        const range: number[] = []
        const left = Math.max(1, safePage - delta)
        const right = Math.min(totalPages, safePage + delta)
        for (let i = left; i <= right; i++) range.push(i)
        return range
    }, [safePage, totalPages])

    // Active filter label
    const activeFilterLabel = activeCategoryId
        ? SEMANTIC_CATEGORIES.find(c => c.id === activeCategoryId)?.label ?? null
        : viewMode === 'year' ? 'Por año' : null

    return (
        <div>
            {/* ── Filter bar ──────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                {/* Active filter badge */}
                <div className="flex items-center gap-2 min-h-[36px]">
                    {activeFilterLabel && (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm font-semibold">
                            {activeFilterLabel}
                            <button onClick={handleResetFilter} aria-label="Quitar filtro">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </div>

                {/* Filter button */}
                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setFilterOpen(o => !o)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                            filterOpen
                                ? 'bg-gray-900 border-gray-900 text-white'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtrar por
                        <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Filter panel */}
                    {filterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                            {/* Category section */}
                            <div className="p-4 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categoría</p>
                                <div className="flex flex-col gap-1">
                                    {SEMANTIC_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategory(cat.id)}
                                            className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                                activeCategoryId === cat.id
                                                    ? 'bg-amber-600 text-white'
                                                    : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Year section */}
                            <div className="p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Por año</p>
                                <button
                                    onClick={handleYearMode}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                        viewMode === 'year'
                                            ? 'bg-amber-600 text-white'
                                            : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                                    }`}
                                >
                                    Ver archivo por año
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── YEAR ARCHIVE VIEW ────────────────────────────────────── */}
            {viewMode === 'year' && (
                <div className="space-y-3">
                    {articlesByYear.map(([year, yearArticles]) => {
                        const isOpen = expandedYears.has(year)
                        return (
                            <div key={year} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                                <button
                                    onClick={() => toggleYear(year)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-gray-900 text-lg">{year}</span>
                                        <span className="text-sm text-gray-400">
                                            {yearArticles.length} artículo{yearArticles.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isOpen && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                                        {yearArticles.map((article: any) => (
                                            <a
                                                key={article.id}
                                                href={`/blog/${article.slug}`}
                                                className="flex items-start gap-4 px-6 py-3 hover:bg-amber-50 transition-colors group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors text-sm leading-snug line-clamp-2">
                                                        {article.translation?.title ?? article.slug}
                                                    </p>
                                                    {article.author_name && (
                                                        <p className="text-xs text-gray-400 mt-0.5">Por {article.author_name}</p>
                                                    )}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 flex-shrink-0 mt-0.5 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── GRID VIEW ────────────────────────────────────────────── */}
            {viewMode === 'grid' && (
                <>
                    {/* Results count */}
                    <p className="text-sm text-gray-400 mb-6">
                        {filtered.length} artículo{filtered.length !== 1 ? 's' : ''} — página {safePage} de {totalPages}
                    </p>

                    {pageItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            No hay artículos en esta categoría.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pageItems.map((article: any) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <button
                                onClick={() => goTo(safePage - 1)}
                                disabled={safePage === 1}
                                className="p-2 rounded-full border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Página anterior"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {pageRange[0] > 1 && (
                                <>
                                    <button onClick={() => goTo(1)} className="w-10 h-10 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-all">1</button>
                                    {pageRange[0] > 2 && <span className="text-gray-400 px-1">…</span>}
                                </>
                            )}

                            {pageRange.map(p => (
                                <button
                                    key={p}
                                    onClick={() => goTo(p)}
                                    className={`w-10 h-10 rounded-full border text-sm font-semibold transition-all ${
                                        p === safePage
                                            ? 'bg-amber-600 border-amber-600 text-white shadow'
                                            : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            {pageRange[pageRange.length - 1] < totalPages && (
                                <>
                                    {pageRange[pageRange.length - 1] < totalPages - 1 && (
                                        <span className="text-gray-400 px-1">…</span>
                                    )}
                                    <button onClick={() => goTo(totalPages)} className="w-10 h-10 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-all">{totalPages}</button>
                                </>
                            )}

                            <button
                                onClick={() => goTo(safePage + 1)}
                                disabled={safePage === totalPages}
                                className="p-2 rounded-full border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Página siguiente"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
