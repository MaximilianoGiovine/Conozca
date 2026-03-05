'use client'
import { useRef, useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'

interface Props {
    onImport: (data: { title: string; html: string; excerpt: string }) => void
}

export function ArticleImporter({ onImport }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragging, setDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    async function processFile(file: File) {
        setLoading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/cms/parse-doc', { method: 'POST', body: formData })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error ?? 'Error al parsear el archivo')

            onImport(data)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) processFile(file)
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Importar documento</p>
            <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragging ? 'border-amber-400 bg-amber-500/10' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                    }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Procesando archivo...</span>
                    </div>
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm mb-1">Arrastrá o hacé clic para subir</p>
                        <p className="text-gray-600 text-xs">.docx · .doc · .txt</p>
                    </>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept=".docx,.doc,.txt"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
            />
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </p>
                </div>
            )}
        </div>
    )
}
