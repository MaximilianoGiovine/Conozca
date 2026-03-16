import { ArticleEditor } from '@/features/cms/components/articles/ArticleEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Nuevo Artículo · CMS Conozca' }

export default function NewArticlePage() {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin-dashboard/articles" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Nuevo artículo</h1>
                    <p className="text-gray-500 text-sm">Editor académico con traducción automática</p>
                </div>
            </div>

            <ArticleEditor />
        </div>
    )
}
