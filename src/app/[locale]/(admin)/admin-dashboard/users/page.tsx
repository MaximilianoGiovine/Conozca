export const dynamic = 'force-dynamic'

import { cmsService } from '@/features/cms/services/cmsService'
import { UserManagement } from '@/features/cms/components/users/UserManagement'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata = { title: 'Usuarios · CMS Conozca' }

export default async function UsersPage() {
    // Obtener rol del usuario logueado para pasarlo al componente
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let currentUserRole = 'admin'
    if (user) {
        const supabaseAdmin = createServiceClient()
        const { data: roleData } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle()
        currentUserRole = roleData?.role ?? 'admin'
    }

    const users = await cmsService.getUsers()

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Gestión de usuarios</h1>
                <p className="text-gray-500 text-sm mt-1">{users.length} usuarios en la plataforma</p>
            </div>
            <UserManagement initialUsers={users} userRole={currentUserRole} />
        </div>
    )
}
