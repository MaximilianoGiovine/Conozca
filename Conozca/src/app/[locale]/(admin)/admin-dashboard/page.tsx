import { cmsService } from '@/features/cms/services/cmsService'
import { CmsStats } from '@/features/cms/components/CmsStats'
import Link from 'next/link'
import { PlusCircle, ArrowRight, Clock } from 'lucide-react'

export const metadata = { title: 'CMS Dashboard · Conozca' }

export default async function AdminDashboardPage() {
    const [stats, recentArticles] = await Promise.all([
        cmsService.getStats(),
        cmsService.getArticles(),
    ])

    const recent = recentArticles.slice(0, 5)

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Panel CMS</h1>
                    <p className="text-gray-500 text-sm mt-1">Conozca, la voz del SEC en América Latina</p>
                </div>
                <Link
                    href="/admin-dashboard/articles/new"
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    Nuevo artículo
                </Link>
            </div>

            {/* Stats */}
            <CmsStats stats={stats} />

            {/* Pending comments alert */}
            {stats.pendingComments > 0 && (
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <p className="text-amber-300 text-sm font-medium">
                            Tenés <span className="font-bold">{stats.pendingComments}</span> comentario{stats.pendingComments !== 1 ? 's' : ''} esperando moderación
                        </p>
                    </div>
                    <Link href="/admin-dashboard/comments" className="text-amber-400 text-sm hover:underline flex items-center gap-1">
                        Revisar <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* Recent articles */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Artículos recientes</h2>
                    <Link href="/admin-dashboard/articles" className="text-amber-400 text-sm hover:underline flex items-center gap-1">
                        Ver todos <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                <div className="space-y-2">
                    {recent.map(article => {
                        const title = article.translations?.find(t => t.language_code === 'es')?.title
                            ?? article.translations?.[0]?.title
                            ?? article.slug
                        const langs = article.translations?.map(t => t.language_code) ?? []
                        return (
                            <div key={article.id} className="flex items-center gap-4 p-3 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{title}</p>
                                    <p className="text-gray-600 text-xs font-mono mt-0.5">{article.slug}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {(['es', 'en', 'fr', 'pt'] as const).map(l => (
                                        <span key={l} className={`text-xs w-6 h-5 flex items-center justify-center rounded ${langs.includes(l) ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-700'
                                            }`}>{l}</span>
                                    ))}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${article.published_at ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    {article.published_at ? 'Publicado' : 'Borrador'}
                                </span>
                                <Link href={`/admin-dashboard/articles/${article.id}/edit`} className="text-amber-400/70 hover:text-amber-400 text-xs transition-colors">
                                    Editar
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
