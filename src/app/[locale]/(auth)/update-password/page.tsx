import { UpdatePasswordForm } from '@/features/auth/components'

export default function UpdatePasswordPage() {
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
        <div className="mx-auto lg:mx-0 w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-display-xs text-foreground font-serif">Nueva contraseña</h1>
        <p className="mt-2 text-foreground-secondary italic">Establece una contraseña segura para tu acceso editorial</p>
      </div>

      <UpdatePasswordForm />
    </div>
  )
}
