'use client'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArticleCard } from './ArticleCard'

const PAGE_SIZE = 12

interface Props {
    articles: any[]
}

export function BlogContent({ articles }: Props) {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Build dynamic category list from actual articles (max 10 most common)
    const categories = useMemo(() => {
        const counts: Record<string, { id: string; name: string; count: number }> = {}
        for (const a of articles) {
            if (!a.category_id) continue
            const name = a.category?.translations?.[0]?.name
                || a.category?.slug
                || a.category_id
            if (!counts[a.category_id]) {
                counts[a.category_id] = { id: a.category_id, name, count: 0 }
            }
            counts[a.category_id].count++
        }
        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
    }, [articles])

    // Filter by category
    const filtered = activeCategoryId
        ? articles.filter((a: any) => a.category_id === activeCategoryId)
        : articles

    // Reset to page 1 when filter changes — handled via key on category change
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    function handleCategory(id: string | null) {
        setActiveCategoryId(id)
        setCurrentPage(1)
    }

    function goTo(page: number) {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Page number range to display (max 5 buttons)
    const pageRange = useMemo(() => {
        const delta = 2
        const range: number[] = []
        const left = Math.max(1, safePage - delta)
        const right = Math.min(totalPages, safePage + delta)
        for (let i = left; i <= right; i++) range.push(i)
        return range
    }, [safePage, totalPages])

    return (
        <div>
            {/* Category filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                <button
                    onClick={() => handleCategory(null)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                        activeCategoryId === null
                            ? 'bg-amber-600 border-amber-600 text-white shadow'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-amber-400 hover:text-amber-700'
                    }`}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategory(cat.id)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                            activeCategoryId === cat.id
                                ? 'bg-amber-600 border-amber-600 text-white shadow'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-amber-400 hover:text-amber-700'
                        }`}
                    >
                        {cat.name}
                        <span className="ml-1.5 text-xs opacity-60">({cat.count})</span>
                    </button>
                ))}
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 text-center mb-6">
                {filtered.length} artículo{filtered.length !== 1 ? 's' : ''} —
                página {safePage} de {totalPages}
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

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    {/* Prev */}
                    <button
                        onClick={() => goTo(safePage - 1)}
                        disabled={safePage === 1}
                        className="p-2 rounded-full border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* First page if not in range */}
                    {pageRange[0] > 1 && (
                        <>
                            <button onClick={() => goTo(1)} className="w-10 h-10 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-all">
                                1
                            </button>
                            {pageRange[0] > 2 && <span className="text-gray-400 px-1">…</span>}
                        </>
                    )}

                    {/* Page range */}
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

                    {/* Last page if not in range */}
                    {pageRange[pageRange.length - 1] < totalPages && (
                        <>
                            {pageRange[pageRange.length - 1] < totalPages - 1 && (
                                <span className="text-gray-400 px-1">…</span>
                            )}
                            <button onClick={() => goTo(totalPages)} className="w-10 h-10 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-all">
                                {totalPages}
                            </button>
                        </>
                    )}

                    {/* Next */}
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
        </div>
    )
}
