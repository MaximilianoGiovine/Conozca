'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/siteConfig'
import {
  BookOpenIcon,
  MenuIcon,
  CloseIcon,
  PhoneIcon,
  ChevronDownIcon
} from './icons'
import { MobileMenu } from './MobileMenu'
import { useTranslations } from 'next-intl'

export function Navbar() {
  const t = useTranslations('Navigation')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-elevated' : 'shadow-card'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <BookOpenIcon className="w-6 h-6 text-white group-hover:text-amber-600 transition-colors" />
              <div>
                <span className="font-heading text-xl font-bold text-gray-900 tracking-tight">
                  CONOZCA
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {siteConfig.navigation.items.map((item) => (
                <div key={item.label} className="relative">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                        className={`flex items-center gap-1 px-4 py-2 text-body-sm font-medium uppercase tracking-wider transition-colors ${openDropdown === item.label ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
                          }`}
                      >
                        {t(item.label)}
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdown === item.label && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-elevated border border-gray-100 py-2 animate-fade-in">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="block px-4 py-2.5 text-body-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                              onClick={() => setOpenDropdown(null)}
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
                      className="px-4 py-2 text-body-sm font-medium uppercase tracking-wider text-gray-700 hover:text-teal-600 transition-colors"
                    >
                      {t(item.label)}
                    </Link>
                  )}
                </div>
              ))}
              <Link
                href="/login"
                className="ml-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 text-body-sm font-semibold rounded-lg transition-colors"
              >
                {t('Portal Editorial')}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-amber-600 transition-colors"
              aria-label="Abrir menú"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
