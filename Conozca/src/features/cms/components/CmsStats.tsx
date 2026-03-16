import type { CmsStats } from '../types/cms'
import { FileText, BookOpen, MessageSquare, Users, UserCheck, FolderOpen } from 'lucide-react'

interface Props { stats: CmsStats }

const statCards = (s: CmsStats) => [
    { label: 'Artículos publicados', value: s.publishedArticles, sub: `${s.draftArticles} borradores`, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Total artículos', value: s.totalArticles, sub: 'en el CMS', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Comentarios pendientes', value: s.pendingComments, sub: `${s.totalComments} totales`, icon: MessageSquare, color: s.pendingComments > 0 ? 'text-red-400' : 'text-green-400', bg: s.pendingComments > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20' },
    { label: 'Categorías', value: s.totalCategories, sub: 'activas', icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Autores', value: s.totalAuthors, sub: 'registrados', icon: UserCheck, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Usuarios', value: s.totalUsers, sub: 'en la plataforma', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
]

export function CmsStats({ stats }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards(stats).map(({ label, value, sub, icon: Icon, color, bg }) => (
                <div key={label} className={`rounded-xl border p-5 ${bg}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
                            <p className={`text-3xl font-bold ${color}`}>{value}</p>
                            <p className="text-gray-500 text-xs mt-1">{sub}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
