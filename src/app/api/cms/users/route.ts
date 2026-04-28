import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    // Verificar que el solicitante es superadmin
    const supabaseNormal = await createClient()
    const { data: { user } } = await supabaseNormal.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseAdmin = createServiceClient()
    const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (roleData?.role !== 'superadmin') {
        return NextResponse.json({ error: 'Solo el superadmin puede crear usuarios' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password, role = 'admin', full_name = '' } = body

    if (!email || !password) {
        return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 })
    }

    try {
        // Crear usuario en auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // confirmar email automáticamente
            user_metadata: { full_name },
        })

        if (createError) throw createError

        const userId = newUser.user.id

        // Insertar en tabla pública users (si existe trigger, ya se habrá creado; upsert por si acaso)
        await supabaseAdmin.from('users').upsert({
            id: userId,
            email,
            full_name: full_name || null,
        }, { onConflict: 'id' })

        // Asignar rol
        await supabaseAdmin.from('user_roles').upsert({
            user_id: userId,
            role,
            is_approved: true,
        }, { onConflict: 'user_id' })

        return NextResponse.json({ success: true, userId })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
