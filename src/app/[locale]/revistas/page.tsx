'use client'
import { useState, useMemo } from 'react'
import { ChevronDown, FileText, ExternalLink, X, BookOpen } from 'lucide-react'
import PageShell from '@/components/magazine/PageShell'
import { REVISTAS_BY_YEAR, type RevistaPDF } from '@/data/revistas'

export default function RevistasPage() {
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())
    const [activeViewer, setActiveViewer] = useState<RevistaPDF | null>(null)
    const [searchYear, setSearchYear] = useState('')

    const filteredYears = useMemo(() => {
        if (!searchYear.trim()) return REVISTAS_BY_YEAR
        return REVISTAS_BY_YEAR.filter(g => String(g.year).includes(searchYear.trim()))
    }, [searchYear])

    function toggleYear(year: number) {
        setExpandedYears(prev => {
            const next = new Set(prev)
            if (next.has(year)) next.delete(year)
            else next.add(year)
            return next
        })
    }

    function openViewer(revista: RevistaPDF) {
        setActiveViewer(revista)
    }

    function closeViewer() {
        setActiveViewer(null)
    }

    const totalEditions = REVISTAS_BY_YEAR.reduce((s, g) => s + g.editions.length, 0)

    return (
        <PageShell>
            {/* PDF Viewer Modal */}
            {activeViewer && (
                <div className="fixed inset-0 z-50 flex flex-col bg-gray-950/95 backdrop-blur-sm">
                    {/* Modal header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-amber-400" />
                            <div>
                                <p className="font-bold text-white text-sm leading-none">{activeViewer.year} — {activeViewer.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Revista Conozca</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={activeViewer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir en nueva pestaña
                            </a>
                            <button
                                onClick={closeViewer}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="Cerrar visor"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* PDF iframe */}
                    <iframe
                        src={activeViewer.url}
                        className="flex-1 w-full"
                        title={`Revista Conozca ${activeViewer.year} - ${activeViewer.label}`}
                    />
                </div>
            )}

            <div className="container mx-auto py-16 px-4 md:px-8 max-w-4xl">
                {/* Page header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm font-semibold mb-6">
                        <BookOpen className="w-4 h-4" />
                        Archivo histórico
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
                        Revista Conozca en PDF
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        {totalEditions} ediciones digitalizadas desde 1961 hasta 2002.
                        Selecciona un año para explorar y leer cada número directamente en el navegador.
                    </p>
                </div>

                {/* Year search */}
                <div className="mb-8">
                    <input
                        type="text"
                        value={searchYear}
                        onChange={e => setSearchYear(e.target.value)}
                        placeholder="Buscar por año (ej: 1977)"
                        className="w-full max-w-xs px-5 py-3 bg-white border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-gray-800"
                    />
                </div>

                {/* Year accordions */}
                <div className="space-y-3">
                    {filteredYears.map(({ year, editions }) => {
                        const isOpen = expandedYears.has(year)
                        return (
                            <div
                                key={year}
                                className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-amber-200 transition-colors"
                            >
                                {/* Year header (trigger) */}
                                <button
                                    onClick={() => toggleYear(year)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-amber-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-gray-900 text-xl tabular-nums">{year}</span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                            <FileText className="w-3 h-3" />
                                            {editions.length} edición{editions.length !== 1 ? 'es' : ''}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Editions list */}
                                {isOpen && (
                                    <div className="border-t border-gray-100 px-6 py-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {editions.map(revista => (
                                                <div key={revista.filename} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group">
                                                    <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 leading-snug">{revista.label}</p>
                                                        <p className="text-xs text-gray-400">Revista Conozca {revista.year}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {/* Read inline */}
                                                        <button
                                                            onClick={() => openViewer(revista)}
                                                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
                                                        >
                                                            Leer
                                                        </button>
                                                        {/* Open in new tab */}
                                                        <a
                                                            href={revista.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            aria-label="Abrir en nueva pestaña"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {filteredYears.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No se encontraron ediciones para el año <strong>{searchYear}</strong>.
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    )
}
