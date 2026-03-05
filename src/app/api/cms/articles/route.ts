// API routes for article CRUD
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { articleCmsService } from '@/features/cms/services/articleCmsService'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get author id for current user
        const { data: author } = await supabase.from('authors').select('id').eq('id', user.id).single()
        if (!author) return NextResponse.json({ error: 'No tienes perfil de autor' }, { status: 403 })

        const body = await request.json()
        const article = await articleCmsService.create(author.id, body)
        return NextResponse.json(article, { status: 201 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
