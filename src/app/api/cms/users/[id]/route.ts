import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cmsService } from '@/features/cms/services/cmsService'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params
    const supabaseAdmin = createServiceClient() // needed to delete from auth.users
    
    // Validate current user is superadmin
    // createServiceClient uses the service role key and acts as admin.
    // For getting the auth user, we shouldn't use the service client since it bypasses RLS and might not have the user session.
    // We should use the normal client to verify the caller.
    const { createClient } = await import('@/lib/supabase/server')
    const supabaseNormal = await createClient()
    const { data: { user } } = await supabaseNormal.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleData } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).single()
    if (roleData?.role !== 'superadmin') {
         return NextResponse.json({ error: 'Sólo un superadmin puede eliminar usuarios' }, { status: 403 })
    }

    try {
        if (user.id === id) {
             return NextResponse.json({ error: 'No podés eliminarte a vos mismo' }, { status: 400 })
        }
        
        // Deleting from auth.users cascades to public.users automatically if setup correctly,
        // but we'll use the Admin API to delete the auth user outright.
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
