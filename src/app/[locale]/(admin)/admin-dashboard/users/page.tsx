export const dynamic = 'force-dynamic'

import { cmsService } from '@/features/cms/services/cmsService'
import { UserManagement } from '@/features/cms/components/users/UserManagement'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata = { title: 'Usuarios · CMS Conozca' }

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let currentUserRole = 'admin'
    if (user) {
        try {
            const supabaseAdmin = createServiceClient()
            const { data: roleData } = await supabaseAdmin
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .maybeSingle()
            currentUserRole = roleData?.role ?? 'admin'
        } catch {
            // Si no hay service key, buscar con cliente normal
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .maybeSingle()
            currentUserRole = roleData?.role ?? 'admin'
        }
    }

    let users: any[] = []
    let fetchError: string | null = null
    try {
        users = await cmsService.getUsers()
    } catch (e: any) {
        fetchError = e?.message ?? 'Error al cargar usuarios'
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Gestión de usuarios</h1>
                <p className="text-gray-500 text-sm mt-1">{users.length} usuarios en la plataforma</p>
            </div>

            {fetchError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
                    <p className="font-semibold mb-1">⚠ No se pudo cargar la lista de usuarios</p>
                    <p className="text-xs font-mono">{fetchError}</p>
                    <p className="text-xs mt-2 text-red-300">
                        Para ver todos los usuarios agregá <code className="bg-red-500/20 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> a las variables de entorno del servidor.
                    </p>
                </div>
            )}

            <UserManagement initialUsers={users} userRole={currentUserRole} />
        </div>
    )
}
