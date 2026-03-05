import { cmsService } from '@/features/cms/services/cmsService'
import { UserManagement } from '@/features/cms/components/users/UserManagement'

export const metadata = { title: 'Usuarios · CMS Conozca' }

export default async function UsersPage() {
    const users = await cmsService.getUsers()
    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Gestión de usuarios</h1>
                <p className="text-gray-500 text-sm mt-1">{users.length} usuarios en la plataforma</p>
            </div>
            <UserManagement initialUsers={users} />
        </div>
    )
}
