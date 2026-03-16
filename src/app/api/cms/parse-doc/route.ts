import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const filename = file.name.toLowerCase()
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        let html = ''
        let plainText = ''

        if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
            // Parse Word document
            const result = await mammoth.convertToHtml({ buffer })
            html = result.value
            plainText = result.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        } else if (filename.endsWith('.txt')) {
            // Plain text — wrap in paragraphs
            plainText = buffer.toString('utf-8')
            html = plainText
                .split('\n\n')
                .filter(p => p.trim())
                .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
                .join('')
        } else if (filename.endsWith('.pdf')) {
            // PDF: return message asking for different format (pdfjs requires browser APIs)
            return NextResponse.json({
                error: 'PDF parsing is not supported server-side. Please convert to .docx or .txt first.',
            }, { status: 400 })
        } else {
            return NextResponse.json({ error: 'Unsupported file format. Use .docx, .doc, or .txt' }, { status: 400 })
        }

        // Extract a title from first heading or first line
        const titleMatch = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i)
        const title = titleMatch
            ? titleMatch[1].replace(/<[^>]*>/g, '').trim()
            : plainText.split('\n')[0]?.substring(0, 100).trim() ?? ''

        // Remove title from body if found
        const body = titleMatch ? html.replace(titleMatch[0], '').trim() : html

        // Create excerpt from first 200 chars of plain text (after removing title)
        const bodyText = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        const excerpt = bodyText.substring(0, 200).trim()

        return NextResponse.json({ title, html: body, excerpt })
    } catch (error: any) {
        console.error('[/api/cms/parse-doc]', error)
        return NextResponse.json({ error: error.message ?? 'Parse failed' }, { status: 500 })
    }
}
