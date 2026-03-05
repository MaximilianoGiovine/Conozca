'use client'
import { useState } from 'react'
import type { UserListItem } from '../../types/cms'
import { Shield, User, ChevronDown } from 'lucide-react'

interface Props { initialUsers: UserListItem[] }

const ROLES = ['user', 'author', 'admin', 'superadmin'] as const

const roleColors: Record<string, string> = {
    superadmin: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    admin: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    author: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    user: 'text-gray-400 bg-gray-700 border-gray-600',
}

export function UserManagement({ initialUsers }: Props) {
    const [users, setUsers] = useState(initialUsers)
    const [updating, setUpdating] = useState<string | null>(null)

    async function handleRoleChange(userId: string, newRole: string) {
        setUpdating(userId)
        try {
            await fetch(`/api/cms/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } finally {
            setUpdating(null)
        }
    }

    return (
        <div className="space-y-3">
            {users.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name ?? ''} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-gray-400" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                            {user.full_name ?? 'Sin nombre'}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>

                    {/* Role badge */}
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${roleColors[user.role ?? 'user']}`}>
                        {user.role ?? 'user'}
                    </span>

                    {/* Role selector */}
                    <div className="relative">
                        <select
                            value={user.role ?? 'user'}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            disabled={updating === user.id}
                            className="appearance-none bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
                        >
                            {ROLES.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            ))}
        </div>
    )
}
