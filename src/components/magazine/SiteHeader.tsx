'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Search, X, Menu } from 'lucide-react'
import styles from './site-shell.module.css'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SearchResult {
    id: string
    slug: string
    title: string
    excerpt: string | null
}

export default function SiteHeader() {
    const t = useTranslations('MagazineHeader')
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [open, setOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const overlayInputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Search logic
    useEffect(() => {
        if (!query.trim()) { setResults([]); return }
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            setSearching(true)
            try {
                const { data } = await supabase
                    .from('article_translations')
                    .select('title, excerpt, article:article_id(id, slug, published_at)')
                    .ilike('title', `%${query}%`)
                    .eq('language_code', 'es')
                    .limit(6)
                const now = new Date().toISOString()
                setResults((data ?? [])
                    .filter((d: any) => d.article?.published_at && d.article.published_at <= now)
                    .map((d: any) => ({ id: d.article.id, slug: d.article.slug, title: d.title, excerpt: d.excerpt }))
                )
            } catch { setResults([]) }
            finally { setSearching(false) }
        }, 300)
    }, [query])

    // Auto-focus overlay input when it opens
    useEffect(() => {
        if (open) setTimeout(() => overlayInputRef.current?.focus(), 30)
    }, [open])

    // Close on Escape
    useEffect(() => {
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
        document.addEventListener('keydown', fn)
        return () => document.removeEventListener('keydown', fn)
    }, [])

    function handleClose() {
        setOpen(false)
        setQuery('')
        setResults([])
    }

    const showResults = searching || results.length > 0 || query.trim().length > 0

    return (
        <>
            {/* ── Search overlay ─────────────────────────────────────────
                Fixed z-[200], NO backdrop-blur → evita el bug de Safari
                donde los hijos de un backdrop-blur aparecen transparentes.
                Fondo sólido semi-opaco para enfocar el buscador.
            ─────────────────────────────────────────────────────────── */}
            {open && (
                <div
                    className="fixed inset-0 z-[200] bg-black/50 flex flex-col items-center pt-20 px-4"
                    onClick={handleClose}
                >
                    <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        {/* Input bar */}
                        <div className="relative bg-white rounded-2xl shadow-2xl ring-2 ring-amber-400/40">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                ref={overlayInputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Buscar artículos..."
                                className="w-full pl-14 pr-14 py-4 text-lg text-gray-900 bg-transparent rounded-2xl outline-none"
                            />
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Results */}
                        {showResults && (
                            <div className="mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
                                {searching ? (
                                    <div className="px-5 py-4 text-sm text-gray-500 text-center">Buscando...</div>
                                ) : results.length > 0 ? (
                                    <ul>
                                        {results.map(r => (
                                            <li key={r.id} className="border-b border-gray-50 last:border-0">
                                                <Link
                                                    href={`/blog/${r.slug}`}
                                                    onClick={handleClose}
                                                    className="flex flex-col px-5 py-4 hover:bg-amber-50 transition-colors"
                                                >
                                                    <span className="font-semibold text-gray-900">{r.title}</span>
                                                    {r.excerpt && <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.excerpt}</span>}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-5 py-4 text-sm text-gray-500 text-center">No se encontraron resultados.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <header className={`${styles.header} relative z-[50]`}>
                <Link className={styles.logo} href="/">
                    <Image src="/images/logo.png" alt="Conozca Logo" width={320} height={106} className="object-contain h-20 w-auto" />
                </Link>

                <nav className={styles.nav}>
                    <Link href="/blog">{t('articles')}</Link>
                    <Link href="/revistas">Revistas</Link>
                    <Link href="/enlaces">{t('enlaces')}</Link>
                    <Link href="/acerca-de">{t('about')}</Link>
                </nav>

                <div className={styles.headerActions}>
                    {/* Trigger — click abre el overlay */}
                    <button
                        onClick={() => setOpen(true)}
                        className="relative hidden sm:flex items-center gap-3 pl-4 pr-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-base text-gray-500 transition-colors w-72 cursor-text"
                    >
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">Buscar artículos...</span>
                    </button>

                    <Link className={styles.primaryButton} href="/blog">{t('startReading')}</Link>
                </div>

                <button className={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {menuOpen && (
                    <nav className={styles.mobileNav} onClick={() => setMenuOpen(false)}>
                        <Link href="/blog">{t('articles')}</Link>
                        <Link href="/revistas">Revistas</Link>
                        <Link href="/enlaces">{t('enlaces')}</Link>
                        <Link href="/acerca-de">{t('about')}</Link>
                        <Link href="/blog" className={styles.mobileNavCta}>{t('startReading')}</Link>
                    </nav>
                )}
            </header>
        </>
    )
}
