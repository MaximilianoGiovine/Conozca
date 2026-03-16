import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'

export const metadata = { title: 'Acceso · Conozca' }

export default function LoginPage() {
  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
          <span className="text-gray-900 font-black text-lg">C</span>
        </div>
        <div>
          <span className="text-white font-bold text-xl block leading-tight">Conozca</span>
          <span className="text-amber-400/70 text-xs">La voz del SEC en América Latina</span>
        </div>
      </div>

      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-white">Acceso al panel</h1>
        <p className="mt-2 text-gray-500 text-sm">Ingresá con tu cuenta de administrador</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-medium text-amber-400 hover:text-amber-300 hover:underline">
          Registrarse
        </Link>
      </p>
    </div>
  )
}
