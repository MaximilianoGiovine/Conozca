'use client'
import { useState } from 'react'
import type { CommentListItem } from '../../types/cms'
import { CheckCircle, Trash2, Clock, MessageSquare } from 'lucide-react'

interface Props { initialComments: CommentListItem[] }

export function CommentModeration({ initialComments }: Props) {
    const [comments, setComments] = useState(initialComments)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')

    const filtered = comments.filter(c => {
        if (filter === 'pending') return !c.is_approved
        if (filter === 'approved') return c.is_approved
        return true
    })

    async function approve(id: string) {
        await fetch(`/api/cms/comments/${id}/approve`, { method: 'POST' })
        setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c))
    }

    async function remove(id: string) {
        await fetch(`/api/cms/comments/${id}`, { method: 'DELETE' })
        setComments(prev => prev.filter(c => c.id !== id))
    }

    const pending = comments.filter(c => !c.is_approved).length

    return (
        <div className="space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2 border-b border-gray-800 pb-3">
                {(['pending', 'approved', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {f === 'pending' ? `Pendientes (${pending})` : f === 'approved' ? 'Aprobados' : 'Todos'}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No hay comentarios {filter === 'pending' ? 'pendientes' : ''}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(comment => {
                        const articleTitle = comment.article?.translations?.find(t => t.language_code === 'es')?.title
                            ?? comment.article?.slug ?? 'Artículo'
                        return (
                            <div key={comment.id} className={`rounded-xl border p-4 ${comment.is_approved ? 'border-gray-800 bg-gray-900/50' : 'border-amber-500/20 bg-amber-500/5'
                                }`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {!comment.is_approved && (
                                                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                    <Clock className="w-3 h-3" /> Pendiente
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500 truncate">
                                                {comment.user?.full_name ?? comment.user?.email ?? 'Usuario'} · en &quot;{articleTitle}&quot;
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                                        <p className="text-gray-600 text-xs mt-2">
                                            {new Date(comment.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        {!comment.is_approved && (
                                            <button
                                                onClick={() => approve(comment.id)}
                                                className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                                                title="Aprobar"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => remove(comment.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
