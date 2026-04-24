import PageShell from '@/components/magazine/PageShell'
import RevistasContent from '@/features/revistas/components/RevistasContent'

export const metadata = {
    title: 'Revista Conozca en PDF — Archivo Histórico 1961–2002',
    description: 'Accede a las ediciones digitalizadas de la Revista Conozca desde 1961 hasta 2002. Más de 70 números disponibles para leer en línea.',
}

export default function RevistasPage() {
    return (
        <PageShell>
            <RevistasContent />
        </PageShell>
    )
}
