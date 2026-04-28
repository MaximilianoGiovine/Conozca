'use client'
import { useState } from 'react'
import type { UserListItem } from '../../types/cms'
import { Shield, User, ChevronDown, Plus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
    initialUsers: UserListItem[]
    userRole: string // role del usuario logueado
}

const ROLES = ['client', 'editor', 'admin', 'superadmin'] as const

const roleColors: Record<string, string> = {
    superadmin: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    admin: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    editor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    client: 'text-gray-400 bg-gray-700 border-gray-600',
}

const emptyForm = { email: '', password: '', full_name: '', role: 'admin' as string }

export function UserManagement({ initialUsers, userRole }: Props) {
    const [users, setUsers] = useState(initialUsers)
    const [updating, setUpdating] = useState<string | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [createSuccess, setCreateSuccess] = useState(false)

    const isSuperadmin = userRole === 'superadmin'

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

    async function handleToggleApproval(userId: string, isApproved: boolean) {
        setUpdating(userId)
        try {
            await fetch(`/api/cms/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_approved: !isApproved }),
            })
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: !isApproved } : u))
        } finally {
            setUpdating(null)
        }
    }

    async function handleDeleteUser(userId: string) {
        if (!window.confirm('¿Eliminar este usuario permanentemente?')) return
        setUpdating(userId)
        try {
            await fetch(`/api/cms/users/${userId}`, { method: 'DELETE' })
            setUsers(prev => prev.filter(u => u.id !== userId))
        } finally {
            setUpdating(null)
        }
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault()
        setCreating(true)
        setCreateError(null)
        setCreateSuccess(false)
        try {
            const res = await fetch('/api/cms/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Error al crear usuario')

            // Agregar el usuario nuevo a la lista local
            setUsers(prev => [{
                id: data.userId,
                email: form.email,
                full_name: form.full_name || null,
                avatar_url: null,
                created_at: new Date().toISOString(),
                role: form.role,
                is_approved: true,
            } as UserListItem, ...prev])

            setCreateSuccess(true)
            setForm(emptyForm)
            setTimeout(() => {
                setShowCreate(false)
                setCreateSuccess(false)
            }, 1500)
        } catch (err: any) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* ── Botón crear (solo superadmin) ── */}
            {isSuperadmin && (
                <div className="flex justify-end">
                    <button
                        onClick={() => { setShowCreate(true); setCreateError(null); setForm(emptyForm) }}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Crear usuario
                    </button>
                </div>
            )}

            {/* ── Modal crear usuario ── */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-amber-400" />
                                </div>
                                <h2 className="text-white font-bold text-lg">Crear nuevo usuario</h2>
                            </div>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    value={form.full_name}
                                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="usuario@conozca.com"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">
                                    Contraseña temporal <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="Mínimo 8 caracteres"
                                    minLength={8}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">
                                    Rol
                                </label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                                >
                                    {ROLES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {createError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                    {createError}
                                </div>
                            )}

                            {createSuccess && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm">
                                    ✓ Usuario creado exitosamente
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/40 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {creating ? 'Creando...' : 'Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Lista de usuarios ── */}
            <div className="space-y-3">
                {users.map(user => (
                    <div key={user.id} className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800 flex-wrap">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {user.avatar_url ? (
                                <Image src={user.avatar_url} alt={user.full_name ?? ''} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <User className="w-5 h-5 text-gray-400" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{user.full_name ?? 'Sin nombre'}</p>
                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        </div>

                        {/* Role badge */}
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${roleColors[user.role ?? 'client']}`}>
                            {user.role ?? 'client'}
                        </span>

                        {/* Role selector — solo superadmin */}
                        {isSuperadmin && (
                            <div className="relative">
                                <select
                                    value={user.role ?? 'client'}
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
                        )}

                        {/* Approval toggle */}
                        <button
                            type="button"
                            onClick={() => handleToggleApproval(user.id, user.is_approved ?? false)}
                            disabled={updating === user.id}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium disabled:opacity-50 ${user.is_approved
                                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                }`}
                        >
                            {user.is_approved ? 'Aprobado' : 'Aprobar'}
                        </button>

                        {/* Delete — solo superadmin */}
                        {isSuperadmin && (
                            <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={updating === user.id}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Eliminar usuario"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                        )}
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="py-12 text-center text-gray-600 italic">
                        No hay usuarios registrados todavía.
                    </div>
                )}
            </div>
        </div>
    )
}
