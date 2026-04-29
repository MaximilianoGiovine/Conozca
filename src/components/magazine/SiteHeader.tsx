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
    const [focused, setFocused] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }
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
                const filtered = (data ?? [])
                    .filter((d: any) => d.article?.published_at && d.article.published_at <= now)
                    .map((d: any) => ({
                        id: d.article.id,
                        slug: d.article.slug,
                        title: d.title,
                        excerpt: d.excerpt,
                    }))
                setResults(filtered)
            } catch {
                setResults([])
            } finally {
                setSearching(false)
            }
        }, 300)
    }, [query])

    const isOpen = focused && (query.trim().length > 0 || results.length > 0)

    function handleClear() {
        setQuery('')
        setResults([])
        inputRef.current?.blur()
        setFocused(false)
    }

    return (
        <>
            {/* Glassmorphism backdrop — z-[15] cubre el contenido pero NO el header (z-[50] en CSS module) */}
            {isOpen && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-[15] backdrop-blur-sm bg-black/20"
                    onClick={handleClear}
                />
            )}

            <header className={`${styles.header} relative z-[50]`}>
                <Link
                    className={`${styles.logo} transition-opacity duration-200 ${focused ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
                    href="/"
                >
                    <Image
                        src="/images/logo.png"
                        alt="Conozca Logo"
                        width={320}
                        height={106}
                        className="object-contain h-20 w-auto"
                    />
                </Link>

                {/* Desktop nav */}
                <nav className={`${styles.nav} transition-opacity duration-200 ${focused ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                    <Link href="/blog">{t('articles')}</Link>
                    <Link href="/revistas">Revistas</Link>
                    <Link href="/enlaces">{t('enlaces')}</Link>
                    <Link href="/acerca-de">{t('about')}</Link>
                </nav>

                <div className={styles.headerActions}>
                    {/* Interactive search — hidden on mobile via CSS */}
                    <div className={`relative hidden sm:block transition-all duration-200 ${focused ? 'z-[60]' : ''}`} style={focused ? { isolation: 'isolate' } : {}}>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setTimeout(() => setFocused(false), 150)}
                                placeholder="Buscar artículos..."
                                className={`pl-12 pr-10 py-3 rounded-full text-base outline-none transition-all text-gray-800 ${
                                    focused
                                        ? 'w-96 bg-white shadow-2xl shadow-amber-500/25 ring-2 ring-amber-400/60 border-transparent'
                                        : 'w-80 bg-gray-100 border-transparent'
                                }`}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            {query && (
                                <button
                                    onClick={handleClear}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Results dropdown */}
                        {isOpen && (
                            <div className="absolute top-full mt-2 w-full bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                                {searching ? (
                                    <div className="px-5 py-4 text-sm text-gray-500 text-center">Buscando...</div>
                                ) : results.length > 0 ? (
                                    <ul>
                                        {results.map(r => (
                                            <li key={r.id}>
                                                <Link
                                                    href={`/blog/${r.slug}`}
                                                    onClick={handleClear}
                                                    className="flex flex-col px-5 py-3 hover:bg-amber-50 transition-colors"
                                                >
                                                    <span className="font-semibold text-gray-900 text-sm">{r.title}</span>
                                                    {r.excerpt && (
                                                        <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.excerpt}</span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : query.trim().length > 0 ? (
                                    <div className="px-5 py-4 text-sm text-gray-500 text-center">No se encontraron resultados.</div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <Link
                        className={`${styles.primaryButton} transition-opacity duration-200 ${focused ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
                        href="/blog"
                    >
                        {t('startReading')}
                    </Link>
                </div>

                {/* Hamburger — visible only on mobile via CSS */}
                <button
                    className={styles.hamburger}
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile nav drawer */}
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
