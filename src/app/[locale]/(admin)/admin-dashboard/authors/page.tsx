import { cmsService } from '@/features/cms/services/cmsService'
import { AuthorManagement } from '@/features/cms/components/authors/AuthorManagement'

export const metadata = { title: 'Autores · CMS Conozca' }

export default async function AuthorsPage() {
    const authors = await cmsService.getAuthors()
    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Autores</h1>
                <p className="text-gray-500 text-sm mt-1">{authors.length} autores registrados</p>
            </div>
            <AuthorManagement authors={authors} />
        </div>
    )
}
