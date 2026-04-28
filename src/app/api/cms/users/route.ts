import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    // Verificar que el solicitante es superadmin
    const supabaseNormal = await createClient()
    const { data: { user } } = await supabaseNormal.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let supabaseAdmin
    try {
        supabaseAdmin = createServiceClient()
    } catch {
        return NextResponse.json({ error: 'Service role key no configurada' }, { status: 500 })
    }

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
        // Llamar directamente a la REST API de GoTrue (más compatible con self-hosted)
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabaseUrl = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!

        const gotrueRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
            },
            body: JSON.stringify({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: full_name || undefined },
            }),
        })

        const gotrueData = await gotrueRes.json()

        if (!gotrueRes.ok) {
            const msg = gotrueData?.msg || gotrueData?.message || gotrueData?.error_description || JSON.stringify(gotrueData)
            return NextResponse.json({ error: msg }, { status: gotrueRes.status })
        }

        const userId = gotrueData.id

        // Insertar en tabla pública users (upsert por si el trigger ya lo creó)
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
