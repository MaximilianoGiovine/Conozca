import { cmsService } from '@/features/cms/services/cmsService'
import { CommentModeration } from '@/features/cms/components/comments/CommentModeration'

export const metadata = { title: 'Moderación · CMS Conozca' }

export default async function CommentsPage() {
    const comments = await cmsService.getComments()
    const pending = comments.filter(c => !c.is_approved).length

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Moderación de comentarios</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {pending > 0 ? `${pending} comentarios pendientes de aprobación` : 'Sin comentarios pendientes'}
                </p>
            </div>
            <CommentModeration initialComments={comments} />
        </div>
    )
}
