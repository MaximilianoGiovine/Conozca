'use client'

import { useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/siteConfig'
import {
  BookOpenIcon,
  CloseIcon,
  PhoneIcon,
  MailIcon,
  ChevronDownIcon,
  MapPinIcon
} from './icons'
import { useTranslations } from 'next-intl'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations('Navigation')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-modal animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <BookOpenIcon className="w-8 h-8 text-amber-500" />
            <span className="font-heading text-xl font-bold text-gray-900 tracking-tight">CONOZCA</span>
          </Link>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Cerrar menú">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {siteConfig.navigation.items.map((item) => (
            <div key={item.label} className="border-b border-gray-50">
              {item.children ? (
                <>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                    className="flex items-center justify-between w-full py-3.5 text-body-md font-medium text-gray-800"
                  >
                    {t(item.label)}
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${expandedItem === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedItem === item.label && (
                    <div className="pb-2 pl-4 space-y-1 animate-fade-in">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block py-2 text-body-sm text-gray-600 hover:text-amber-600"
                          onClick={onClose}
                        >
                          {t(child.label)}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="block py-3.5 text-body-md font-medium text-gray-800 hover:text-amber-600"
                  onClick={onClose}
                >
                  {t(item.label)}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Contact info */}
        <div className="p-4 mx-4 mb-4 bg-amber-50 rounded-xl space-y-3 border border-amber-100">
          <a href={`tel:${siteConfig.contact.phone}`} className="flex items-center gap-2 text-body-sm text-amber-900">
            <PhoneIcon className="w-4 h-4 text-amber-600" />
            {siteConfig.contact.phoneDisplay}
          </a>
          <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-2 text-body-sm text-amber-900">
            <MailIcon className="w-4 h-4 text-amber-600" />
            {siteConfig.contact.email}
          </a>
          <div className="flex items-start gap-2 text-body-sm text-amber-900">
            <MapPinIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span>{siteConfig.contact.address}, {siteConfig.contact.city}</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="p-4 space-y-3">
          <a
            href={`https://wa.me/${siteConfig.contact.phone}`}
            className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-body-xs"
          >
            Contactar por WhatsApp
          </a>
          <Link
            href="/login"
            className="block w-full text-center border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-body-xs"
            onClick={onClose}
          >
            {t('portalAdmin' as any) || 'Portal Editorial'}
          </Link>
        </div>
      </div>
    </div>
  )
}
