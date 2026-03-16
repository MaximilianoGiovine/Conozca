import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      {/* Logo móvil */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
          <span className="text-gray-900 font-bold text-xl">C</span>
        </div>
        <span className="text-xl font-bold text-amber-500">Conozca</span>
      </div>

      <div className="text-center lg:text-left">
        <h1 className="text-display-xs text-foreground font-serif">Recuperar contraseña</h1>
        <p className="mt-2 text-foreground-secondary italic">Ingresa tu correo y te enviaremos un enlace editorial para restablecerla</p>
      </div>

      <ForgotPasswordForm />

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm font-medium text-foreground-secondary hover:text-foreground"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio de sesión
      </Link>
    </div>
  )
}
