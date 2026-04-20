export const dynamic = 'force-dynamic'

import { cmsService } from '@/features/cms/services/cmsService'
import Link from 'next/link'
import { PlusCircle, Edit3, Trash2 } from 'lucide-react'

export const metadata = { title: 'Artículos · CMS Conozca' }

export default async function ArticlesPage() {
    const articles = await cmsService.getArticles()

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Artículos</h1>
                    <p className="text-gray-500 text-sm mt-1">{articles.length} artículos en el CMS</p>
                </div>
                <Link
                    href="/admin-dashboard/articles/new"
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    Nuevo artículo
                </Link>
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
                        {articles.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-600">
                                    No hay artículos todavía. ¡Creá el primero!
                                </td>
                            </tr>
                        ) : articles.map(article => {
                            const title = article.translations?.find(t => t.language_code === 'es')?.title
                                ?? article.translations?.[0]?.title ?? article.slug
                            const langs = article.translations?.map(t => t.language_code) ?? []
                            const authorName = article.author_name ?? (article.author as any)?.user?.full_name ?? (article.author as any)?.slug ?? '—'

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
                                            {(['es', 'en', 'fr', 'pt'] as const).map(l => (
                                                <span key={l} className={`text-xs w-6 h-5 flex items-center justify-center rounded font-medium ${langs.includes(l) ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-700'
                                                    }`}>{l}</span>
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
