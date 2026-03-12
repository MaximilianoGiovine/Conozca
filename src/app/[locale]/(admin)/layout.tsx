import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CmsSidebar } from '@/features/cms/components/CmsSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Check admin role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    const role = roleData?.role
    if (!role || !['superadmin', 'admin', 'editor'].includes(role)) {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen bg-gray-950">
            <CmsSidebar userRole={role} />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
