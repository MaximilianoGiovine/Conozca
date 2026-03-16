'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, FileText, MessageSquare, Users, UserCheck, LogOut
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

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen sticky top-0">
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

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname?.includes(href) && (href !== '/admin-dashboard' || pathname.endsWith('/admin-dashboard'))
                    return (
                        <Link
                            key={href}
                            href={href}
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

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Ir al sitio
                </Link>
            </div>
        </aside>
    )
}
