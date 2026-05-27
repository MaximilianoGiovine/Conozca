export const dynamic = 'force-dynamic'

import { cmsService } from '@/features/cms/services/cmsService'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { ArticlesTable } from '@/features/cms/components/articles/ArticlesTable'

export const metadata = { title: 'Artículos · CMS Conozca' }

const PAGE_SIZE = 20

type ArticlesPageProps = {
    searchParams: Promise<{ page?: string } | undefined> | { page?: string } | undefined
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams)
    const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams?.page ?? '1', 10) || 1)
    const firstPass = await cmsService.getArticlesPaginated(currentPage, PAGE_SIZE)
    const totalCount = firstPass.totalCount
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const { articles } = safePage === currentPage
        ? firstPass
        : await cmsService.getArticlesPaginated(safePage, PAGE_SIZE)

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Artículos</h1>
                    <p className="text-gray-500 text-sm mt-1">{totalCount} artículos en el CMS · página {safePage} de {totalPages}</p>
                </div>
                <Link
                    href="/admin-dashboard/articles/new"
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    Nuevo artículo
                </Link>
            </div>

            <ArticlesTable articles={articles} currentPage={safePage} totalPages={totalPages} />
        </div>
    )
}
