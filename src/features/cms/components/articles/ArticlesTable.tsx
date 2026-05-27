'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Edit3, Search } from 'lucide-react'
import type { ArticleListItem } from '../../types/cms'

interface ArticlesTableProps {
    articles: ArticleListItem[]
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

export function ArticlesTable({ articles }: ArticlesTableProps) {
    const [search, setSearch] = useState('')

    const filteredArticles = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        if (!normalizedSearch) return articles

        return articles.filter(article => {
            const title = getArticleTitle(article).toLowerCase()
            const slug = article.slug.toLowerCase()
            const author = getArticleAuthor(article).toLowerCase()
            const category = article.category?.slug?.toLowerCase() ?? ''
            const languages = article.translations?.map(t => t.language_code).join(' ') ?? ''

            return [title, slug, author, category, languages].some(value => value.includes(normalizedSearch))
        })
    }, [articles, search])

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
                    {filteredArticles.length} de {articles.length} artículo{articles.length !== 1 ? 's' : ''}
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
        </div>
    )
}