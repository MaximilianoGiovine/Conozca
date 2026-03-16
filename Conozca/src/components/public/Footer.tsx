import Link from 'next/link'
import { siteConfig } from '@/config/siteConfig'
import { BookOpenIcon } from './icons'
import { useTranslations } from 'next-intl'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const t = useTranslations('Footer')

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: About & Vision */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpenIcon className="w-7 h-7 text-amber-500" />
              <span className="font-heading text-lg font-bold text-white uppercase">{siteConfig.firmName}</span>
            </Link>
            <p className="text-body-sm text-gray-400 leading-relaxed mb-6 font-semibold">
              CONOZCA es el organo oficial del Servicio de Educación Cristiana de las Asambleas de Dios en América Latina.
            </p>

            <h3 className="font-heading text-white font-semibold mb-3">Declaración de Visión</h3>
            <p className="text-body-sm text-gray-400 leading-relaxed">
              CONOZCA, como la voz oficial del SEC, existe para informar, motivar, orientar y equipar a los educadores cristianos de las Asambleas de Dios de habla hispana, en las áreas espiritual, teológica y ministerial.
            </p>
          </div>

          {/* Column 2: Editorial Board */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-4">Comisión Editorial</h3>
            <ul className="space-y-2 text-body-sm text-gray-400">
              <li><span className="font-semibold text-gray-300">Editor:</span> Nicolás Marcón </li>
              <li className="pt-2">Jaime A. Mazurek</li>
              <li>Pablo Kazim</li>
              <li>Silverio Manuel Bello</li>
              <li>Jorge Canto</li>
              <li>Esteban Pari</li>
              <li>Betty Zenone</li>
              <li>Jon Dahlager</li>
              <li>Miguel Morales</li>
            </ul>
          </div>

          {/* Column 3: Magazine Links */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-4">Mapeo del Sitio</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Artículos
                </Link>
              </li>
              <li>
                <Link href="/enlaces" className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Enlaces
                </Link>
              </li>
              <li>
                <Link href="/acerca-de" className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright rules bar */}
      <div className="border-t border-gray-900 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h4 className="text-white font-semibold mb-3 text-sm">Derechos Del Autor</h4>
          <p className="text-xs text-gray-500 leading-relaxed max-w-4xl mb-6">
            Todos los contenidos en CONOZCA.org son propiedad de Revista CONOZCA y el Servicio de Educación Cristiana. Para reproducir un artículo sírvase pedir permiso al Editor. Se permite la cita directa de citas textuales breves para fines académicos. Dirige toda correspondencia a: <a href="mailto:conozcaeditor@gmail.com" className="hover:text-amber-500 transition-colors">conozcaeditor@gmail.com</a>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-body-xs text-gray-600 border-t border-gray-900 pt-5">
            <p>Copyright &copy; {currentYear} {siteConfig.firmName}. {t('allRightsReserved')}</p>
            <div className="flex items-center gap-4">
              <Link href="/privacidad" className="hover:text-amber-500 transition-colors">{t('privacyPolicy')}</Link>
              <span>|</span>
              <Link href="/terminos" className="hover:text-amber-500 transition-colors">{t('termsOfService')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
