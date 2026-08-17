import type { Metadata } from 'next'
import PageShell from '@/components/magazine/PageShell'
import RevistasContent from '@/features/revistas/components/RevistasContent'
import { absoluteUrl, buildLanguageAlternates } from '@/shared/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    return {
        title: 'Revista Conozca en PDF — Archivo Histórico 1961–2002',
        description: 'Accede a las ediciones digitalizadas de la Revista Conozca desde 1961 hasta 2002. Más de 70 números disponibles para leer en línea.',
        alternates: {
            canonical: absoluteUrl(locale, '/revistas'),
            languages: buildLanguageAlternates('/revistas'),
        },
    }
}

export default function RevistasPage() {
    return (
        <PageShell>
            <RevistasContent />
        </PageShell>
    )
}
