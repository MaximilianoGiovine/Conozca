'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'
import { useTour } from '@/components/onboarding'
import {
  Home as HomeIcon,
  FileText as FileTextIcon,
  MessageSquare as MessageSquareIcon,
  UserPlus as UserCheckIcon,
  Users as UsersIcon,
  LogOut as LogoutIcon,
  HelpCircle as HelpIcon,
  Bell as BellIcon
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

interface NavItem {
  href: string
  label: string
  icon: React.FC<{ className?: string }>
  roles: UserRole[]
  badge?: string
  tourId?: string
}

const navItems: NavItem[] = [
  { href: '/admin-dashboard', label: 'CMS Dashboard', icon: HomeIcon, roles: ['admin', 'superadmin'] },
  { href: '/admin-dashboard/articles', label: 'Artículos', icon: FileTextIcon, roles: ['admin', 'superadmin', 'author'] },
  { href: '/admin-dashboard/comments', label: 'Comentarios', icon: MessageSquareIcon, roles: ['admin', 'superadmin'] },
  { href: '/admin-dashboard/authors', label: 'Autores', icon: UserCheckIcon, roles: ['admin', 'superadmin'] },
  { href: '/admin-dashboard/users', label: 'Usuarios', icon: UsersIcon, roles: ['superadmin'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { startTour } = useTour()
  const [userRole, setUserRole] = useState<UserRole>('client')
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        // Check user_roles table first (Conozca roles)
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (roleData) {
          setUserRole(roleData.role as UserRole)
        }
        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Usuario')
      }
      setIsLoading(false)
    }

    fetchUserRole()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole))

  const getRoleBadge = (role: UserRole) => {
    const badges: Record<string, { label: string, color: string }> = {
      superadmin: { label: 'Superadmin', color: 'bg-amber-600' },
      admin: { label: 'Admin', color: 'bg-amber-500' },
      author: { label: 'Autor', color: 'bg-purple-500' },
      lawyer: { label: 'Abogado', color: 'bg-accent-500' },
      client: { label: 'Cliente', color: 'bg-success-500' },
      user: { label: 'Usuario', color: 'bg-gray-500' },
    }
    return badges[role]
  }

  const roleBadge = getRoleBadge(userRole)

  return (
    <aside data-tour="sidebar" className="fixed left-0 top-0 bottom-0 w-64 bg-primary-500 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin-dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <span className="text-gray-900 font-bold text-xl">C</span>
          </div>
          <div>
            <h1 className="font-heading font-semibold text-lg">Conozca</h1>
            <p className="text-xs text-white/60">Digital Magazine</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div data-tour="user-profile" className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-semibold">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full ${roleBadge.color} text-white`}>
              {roleBadge.label}
            </span>
          </div>
          {/* Notifications */}
          {userId && (
            <NotificationCenter userId={userId} />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-white/10 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Sección Principal */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-white/40 px-4 mb-2">
                Principal
              </p>
              {filteredNavItems.slice(0, 5).map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && item.href !== '/appointments/new' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={item.tourId}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-white/15 text-white border-l-4 border-secondary-500'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-secondary-500 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Sección Admin */}
            {userRole === 'admin' && filteredNavItems.length > 5 && (
              <div data-tour="admin-section">
                <p className="text-[10px] uppercase tracking-wider text-white/40 px-4 mb-2">
                  Administración
                </p>
                {filteredNavItems.slice(5).map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${isActive
                          ? 'bg-white/15 text-white border-l-4 border-secondary-500'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <button
          onClick={startTour}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <HelpIcon className="w-5 h-5" />
          <span className="font-medium">Tour de la App</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}


