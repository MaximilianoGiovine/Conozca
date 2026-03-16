import Link from 'next/link'
import { siteConfig } from '@/config/siteConfig'
import { SectionHeading } from './SectionHeading'
import { ServiceIcon, ChevronRightIcon } from './icons'
import { useTranslations } from 'next-intl'

export function ServicesGrid() {
  const t = useTranslations('Services')
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label={t('label')}
          title={t('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {siteConfig.services.map((service) => (
            <Link
              key={service.slug}
              href={`/servicios#${service.slug}`}
              className="group bg-white rounded-xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-gray-100 hover:border-teal-200"
            >
              <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-lg flex items-center justify-center mb-5 transition-colors">
                <ServiceIcon icon={service.icon} className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-heading text-display-xs text-gray-900 mb-3">
                {t(`items.${service.slug}.title`)}
              </h3>
              <p className="text-body-sm text-foreground-secondary leading-relaxed mb-4">
                {t(`items.${service.slug}.shortDescription`)}
              </p>
              <span className="inline-flex items-center text-body-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                {t('more_info')}
                <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
