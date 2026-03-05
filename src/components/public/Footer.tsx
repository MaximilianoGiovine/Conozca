import Link from 'next/link'
import { siteConfig } from '@/config/siteConfig'
import {
  BookOpenIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon
} from './icons'
import { useTranslations } from 'next-intl'

export function Footer() {
  const { contact, social, services } = siteConfig
  const currentYear = new Date().getFullYear()
  const t = useTranslations('Footer')
  const tNav = useTranslations('Navigation')
  const tServ = useTranslations('Services')

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpenIcon className="w-7 h-7 text-amber-500" />
              <span className="font-heading text-lg font-bold text-white">CONOZCA</span>
            </Link>
            <p className="text-body-sm text-gray-400 leading-relaxed mb-4">
              Revista digital con historias pensadas, claras y creadas para enfocarse.
            </p>
            <p className="text-body-sm text-gray-400">
              Cultura, Negocios y Diseño.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-4">{t('aboutUs')}</h3>
            <ul className="space-y-2.5">
              {siteConfig.navigation.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                    {tNav(item.label)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacidad" className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-body-sm text-gray-400 hover:text-teal-400 transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Magazine */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-4">Magazine</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/blog" className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Últimos Artículos
                </Link>
              </li>
              <li>
                <Link href="/enlaces" className="text-body-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Enlaces Útiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-heading text-white font-semibold mb-4">{t('getInTouch')}</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-body-xs text-gray-500 block">{siteConfig.firmName}</span>
                <div className="flex items-start gap-2 mt-1">
                  <MapPinIcon className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-body-sm">{contact.address}, {contact.city}, {contact.country}</span>
                </div>
              </li>
              <li>
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-body-sm hover:text-amber-500 transition-colors">
                  <PhoneIcon className="w-4 h-4 text-amber-500" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-body-sm hover:text-amber-500 transition-colors">
                  <MailIcon className="w-4 h-4 text-amber-500" />
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-body-sm">
                <ClockIcon className="w-4 h-4 text-amber-500" />
                {contact.officeHours}
              </li>
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-5">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <FacebookIcon className="w-4 h-4 text-teal-400" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <InstagramIcon className="w-4 h-4 text-teal-400" />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <LinkedInIcon className="w-4 h-4 text-teal-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-body-xs text-gray-500">
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
