import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cmsService } from '@/features/cms/services/cmsService'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        
        if (body.role !== undefined) {
             await cmsService.updateUserRole(id, body.role)
        }
        
        if (body.is_approved !== undefined) {
             await cmsService.updateUserApproval(id, body.is_approved)
        }
        
        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
