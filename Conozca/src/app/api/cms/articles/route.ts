// API routes for article CRUD
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { articleCmsService } from '@/features/cms/services/articleCmsService'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get user info and role to ensure administrative access
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
        if (!roleData || !['superadmin', 'admin', 'editor'].includes(roleData.role)) {
            return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
        }

        const body = await request.json()
        const article = await articleCmsService.create(user.id, body)
        return NextResponse.json(article, { status: 201 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
