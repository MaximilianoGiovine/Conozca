import { NextRequest, NextResponse } from 'next/server'
import { translateArticleToAllLanguages } from '@/features/cms/services/translationService'

export async function POST(request: NextRequest) {
    try {
        const { title, content, excerpt, sourceLang } = await request.json()

        if (!title || !content) {
            return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
        }

        const translations = await translateArticleToAllLanguages(title, content, excerpt ?? '', sourceLang)

        return NextResponse.json({ translations })
    } catch (error: any) {
        console.error('[/api/cms/translate]', error)
        return NextResponse.json({ error: error.message ?? 'Translation failed' }, { status: 500 })
    }
}
