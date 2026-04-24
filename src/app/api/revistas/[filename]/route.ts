import { type NextRequest, NextResponse } from 'next/server'

// Proxy interno para servir PDFs de revistas desde nginx (puerto 8080) a través de Next.js (mismo origen)
// Esto evita restricciones del visor de PDF de Chrome en iframes cross-origin

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params

    // nginx escucha en puerto 80 internamente dentro de la red Docker
    const internalUrl = `http://conozca-gateway/revistas/pdfs/${encodeURIComponent(filename)}`

    try {
        const upstream = await fetch(internalUrl, {
            // cache de Next.js: usamos force-cache ya que los PDFs son inmutables
            next: { revalidate: 86400 },
        })

        if (!upstream.ok) {
            return new NextResponse(null, { status: upstream.status })
        }

        // Streamed response — no buffering en memoria para PDFs grandes
        return new NextResponse(upstream.body, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=31536000, immutable',
                ...(upstream.headers.get('content-length')
                    ? { 'Content-Length': upstream.headers.get('content-length')! }
                    : {}),
            },
        })
    } catch (err) {
        console.error('[PDF Proxy] Error fetching:', internalUrl, err)
        return new NextResponse(null, { status: 502 })
    }
}
