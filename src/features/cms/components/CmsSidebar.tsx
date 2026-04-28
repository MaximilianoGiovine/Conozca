'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, FileText, MessageSquare, Users, UserCheck, LogOut, Menu, X
} from 'lucide-react'

const allNavItems = [
    { href: '/admin-dashboard', label: 'Stats', icon: LayoutDashboard, roles: ['admin', 'superadmin'] },
    { href: '/admin-dashboard/articles', label: 'Artículos', icon: FileText, roles: ['editor', 'admin', 'superadmin'] },
    { href: '/admin-dashboard/comments', label: 'Comentarios', icon: MessageSquare, roles: ['admin', 'superadmin'] },
    { href: '/admin-dashboard/authors', label: 'Autores', icon: UserCheck, roles: ['admin', 'superadmin'] },
    { href: '/admin-dashboard/users', label: 'Usuarios', icon: Users, roles: ['superadmin'] },
]

interface Props { userRole: string }

export function CmsSidebar({ userRole }: Props) {
    const pathname = usePathname()
    const navItems = allNavItems.filter(item => item.roles.includes(userRole))
    const [mobileOpen, setMobileOpen] = useState(false)

    const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
        <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname?.includes(href) && (href !== '/admin-dashboard' || pathname.endsWith('/admin-dashboard'))
                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                    </Link>
                )
            })}
        </nav>
    )

    const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <span className="text-gray-900 font-black text-sm">C</span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Conozca</p>
                        <p className="text-gray-500 text-xs capitalize">{userRole}</p>
                    </div>
                </div>
            </div>

            <NavLinks onNavigate={onNavigate} />

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <Link
                    href="/"
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Ir al sitio
                </Link>
            </div>
        </>
    )

    return (
        <>
            {/* ── Desktop sidebar (md+) ─────────────────────────── */}
            <aside className="hidden md:flex w-64 bg-gray-900 border-r border-gray-800 flex-col min-h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* ── Mobile: top bar ───────────────────────────────── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 flex items-center gap-3 px-4 h-14">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                        <span className="text-gray-900 font-black text-xs">C</span>
                    </div>
                    <span className="text-white font-bold text-sm">Conozca CMS</span>
                </div>
            </div>

            {/* ── Mobile: drawer overlay ─────────────────────────── */}
            {mobileOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer */}
                    <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
                        {/* Close button */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <span className="text-white font-bold text-sm">Menú</span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <SidebarContent onNavigate={() => setMobileOpen(false)} />
                    </aside>
                </>
            )}
        </>
    )
}
