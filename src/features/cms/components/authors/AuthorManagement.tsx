'use client'
import type { AuthorListItem } from '../../types/cms'
import { User, Twitter, Linkedin, Globe } from 'lucide-react'
import Image from 'next/image'

interface Props { authors: AuthorListItem[] }

export function AuthorManagement({ authors }: Props) {
    if (authors.length === 0) {
        return (
            <div className="text-center py-12 text-gray-600">
                <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No hay autores registrados aún.</p>
                <p className="text-xs text-gray-700 mt-1">Los usuarios con rol &quot;author&quot; o superior aparecerán aquí.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authors.map(author => (
                <div key={author.id} className="p-5 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {author.user?.avatar_url ? (
                                <Image src={author.user.avatar_url} alt={author.user.full_name ?? ''} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <User className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                                {author.user?.full_name ?? 'Sin nombre'}
                            </p>
                            <p className="text-gray-500 text-xs truncate">{author.user?.email}</p>
                            <p className="text-amber-400/80 text-xs font-mono mt-0.5">@{author.slug}</p>
                        </div>
                    </div>

                    {author.bio && (
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{author.bio}</p>
                    )}

                    {author.social_links && Object.keys(author.social_links).length > 0 && (
                        <div className="flex gap-2">
                            {author.social_links.twitter && (
                                <a href={author.social_links.twitter} target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 bg-gray-800 rounded-lg text-gray-500 hover:text-blue-400 transition-colors">
                                    <Twitter className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {author.social_links.linkedin && (
                                <a href={author.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 bg-gray-800 rounded-lg text-gray-500 hover:text-blue-400 transition-colors">
                                    <Linkedin className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {author.social_links.website && (
                                <a href={author.social_links.website} target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 bg-gray-800 rounded-lg text-gray-500 hover:text-amber-400 transition-colors">
                                    <Globe className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
