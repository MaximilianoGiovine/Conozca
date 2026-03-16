'use client'
import { useState } from 'react'
import { ArticleCard } from './ArticleCard'

const CATEGORIES = [
    { id: null, label: 'Todos' },
    { id: '11111111-1111-1111-1111-111111111111', label: 'Literatura Bíblica' },
    { id: '22222222-2222-2222-2222-222222222222', label: 'Teología' },
    { id: '33333333-3333-3333-3333-333333333333', label: 'Ministerio' },
    { id: '44444444-4444-4444-4444-444444444444', label: 'Misceláneo' },
]

interface Props {
    articles: any[]
}

export function BlogContent({ articles }: Props) {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

    const filtered = activeCategoryId
        ? articles.filter((a: any) => a.category_id === activeCategoryId)
        : articles

    return (
        <div>
            {/* Category filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.label}
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                            activeCategoryId === cat.id
                                ? 'bg-amber-600 border-amber-600 text-white shadow'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-700'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No hay artículos en esta categoría.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((article: any) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}
        </div>
    )
}
