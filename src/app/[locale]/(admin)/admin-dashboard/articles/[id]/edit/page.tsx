import { ArticleEditor } from '@/features/cms/components/articles/ArticleEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { articleCmsService } from '@/features/cms/services/articleCmsService'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Editar Artículo · CMS Conozca' }

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const article = await articleCmsService.getById(id)

    if (!article) {
        notFound()
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin-dashboard/articles" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Editar artículo</h1>
                    <p className="text-gray-500 text-sm">{article.slug}</p>
                </div>
            </div>

            <ArticleEditor 
                articleId={article.id}
                initialData={{
                    slug: article.slug,
                    category_id: article.category_id,
                    published_at: article.published_at,
                    author_name: article.author_name,
                    translations: article.translations || []
                }}
            />
        </div>
    )
}
