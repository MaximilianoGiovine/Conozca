import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar rol del usuario
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = roleData?.role

  // Redirigir al dashboard apropiado según el rol
  if (role === 'admin' || role === 'superadmin' || role === 'editor') {
    redirect('/admin-dashboard')
  }

  // Dashboard para usuarios normales
  redirect('/')
}
