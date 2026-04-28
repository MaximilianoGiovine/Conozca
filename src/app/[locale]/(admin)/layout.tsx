import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CmsSidebar } from '@/features/cms/components/CmsSidebar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Check admin role (fallback to profiles.role for legacy users)
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

    const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    const role = (roleData?.role ?? profileData?.role ?? '').toLowerCase()
    if (!role || !['superadmin', 'admin', 'editor'].includes(role)) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
                <div className="max-w-lg w-full rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
                    <h1 className="text-2xl font-bold">Acceso denegado</h1>
                    <p className="text-gray-400 mt-3">
                        Tu usuario está autenticado, pero no tiene permisos para ingresar al panel administrativo.
                    </p>
                    <p className="text-gray-500 mt-2 text-sm">
                        Email: {user.email ?? 'sin email'}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-700"
                        >
                            Ir al inicio
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-950">
            <CmsSidebar userRole={role} />
            <main className="flex-1 overflow-auto pt-14 md:pt-0">
                {children}
            </main>
        </div>
    )
}
