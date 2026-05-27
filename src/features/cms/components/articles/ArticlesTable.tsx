'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Edit3, Search } from 'lucide-react'
import type { ArticleListItem } from '../../types/cms'

interface ArticlesTableProps {
    articles: ArticleListItem[]
    currentPage: number
    totalPages: number
    searchQuery: string
    totalCount: number
}

function getArticleTitle(article: ArticleListItem) {
    return article.translations?.find(t => t.language_code === 'es')?.title
        ?? article.translations?.[0]?.title
        ?? article.slug
}

function getArticleAuthor(article: ArticleListItem) {
    return article.author_name
        ?? article.author?.user?.full_name
        ?? article.author?.slug
        ?? '—'
}

export function ArticlesTable({ articles, currentPage, totalPages, searchQuery, totalCount }: ArticlesTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchQuery)

    useEffect(() => {
        setSearch(searchQuery)
    }, [searchQuery])

    useEffect(() => {
        const handle = window.setTimeout(() => {
            const normalizedSearch = search.trim()
            const currentUrlSearch = searchParams.get('q') ?? ''

            if (normalizedSearch === currentUrlSearch) return

            const params = new URLSearchParams(searchParams.toString())
            if (normalizedSearch) params.set('q', normalizedSearch)
            else params.delete('q')
            params.delete('page')

            const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
            router.replace(nextUrl)
        }, 250)

        return () => window.clearTimeout(handle)
    }, [pathname, router, search, searchParams])

    const filteredArticles = articles

    const pageRange = useMemo(() => {
        const delta = 2
        const range: number[] = []
        const left = Math.max(1, currentPage - delta)
        const right = Math.min(totalPages, currentPage + delta)

        for (let page = left; page <= right; page += 1) range.push(page)
        return range
    }, [currentPage, totalPages])

    const buildPageHref = (page: number) => {
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set('q', searchQuery.trim())
        params.set('page', String(page))
        return `/admin-dashboard/articles?${params.toString()}`
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por título, slug o autor..."
                        className="w-full rounded-xl border border-gray-800 bg-gray-950/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                    />
                </div>

                <p className="text-sm text-gray-500">
                    {articles.length} de {totalCount} artículo{totalCount !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/50">
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Título (ES)</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Autor</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Idiomas</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Estado</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-600">
                                    {search.trim()
                                        ? 'No se encontraron artículos con esa búsqueda.'
                                        : 'No hay artículos todavía. ¡Creá el primero!'}
                                </td>
                            </tr>
                        ) : filteredArticles.map(article => {
                            const title = getArticleTitle(article)
                            const langs = article.translations?.map(t => t.language_code) ?? []
                            const authorName = getArticleAuthor(article)

                            return (
                                <tr key={article.id} className="border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-white text-sm font-medium truncate max-w-xs">{title}</p>
                                        <p className="text-gray-600 text-xs font-mono mt-0.5">{article.slug}</p>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <p className="text-gray-400 text-sm">{authorName}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-1">
                                            {(['es', 'en', 'fr', 'pt'] as const).map(language => (
                                                <span
                                                    key={language}
                                                    className={`text-xs w-6 h-5 flex items-center justify-center rounded font-medium ${langs.includes(language) ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-700'}`}
                                                >
                                                    {language}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${article.published_at
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-gray-800 text-gray-500'
                                            }`}>
                                            {article.published_at ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Link
                                                href={`/admin-dashboard/articles/${article.id}/edit`}
                                                className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                    <Link
                        href={buildPageHref(Math.max(1, currentPage - 1))}
                        aria-disabled={currentPage === 1}
                        className={`p-2 rounded-full border transition-all ${currentPage === 1
                            ? 'pointer-events-none border-gray-800 text-gray-700 opacity-40'
                            : 'border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400'
                            }`}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    {pageRange[0] > 1 && (
                        <>
                            <Link
                                href={buildPageHref(1)}
                                className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-gray-700 text-sm font-semibold text-gray-400 hover:border-amber-500 hover:text-amber-400 transition-all"
                            >
                                1
                            </Link>
                            {pageRange[0] > 2 && <span className="px-1 text-gray-500">…</span>}
                        </>
                    )}

                    {pageRange.map(page => (
                        <Link
                            key={page}
                            href={buildPageHref(page)}
                            className={`w-10 h-10 inline-flex items-center justify-center rounded-full border text-sm font-semibold transition-all ${page === currentPage
                                ? 'bg-amber-600 border-amber-600 text-white shadow'
                                : 'border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400'
                                }`}
                        >
                            {page}
                        </Link>
                    ))}

                    {pageRange[pageRange.length - 1] < totalPages && (
                        <>
                            {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="px-1 text-gray-500">…</span>}
                            <Link
                                href={buildPageHref(totalPages)}
                                className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-gray-700 text-sm font-semibold text-gray-400 hover:border-amber-500 hover:text-amber-400 transition-all"
                            >
                                {totalPages}
                            </Link>
                        </>
                    )}

                    <Link
                        href={buildPageHref(Math.min(totalPages, currentPage + 1))}
                        aria-disabled={currentPage === totalPages}
                        className={`p-2 rounded-full border transition-all ${currentPage === totalPages
                            ? 'pointer-events-none border-gray-800 text-gray-700 opacity-40'
                            : 'border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400'
                            }`}
                        aria-label="Página siguiente"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            )}
        </div>
    )
}