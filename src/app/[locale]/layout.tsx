import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next'
import { siteConfig } from '@/config/siteConfig'
import { SITE_URL, absoluteUrl, buildLanguageAlternates, getOgLocale } from '@/shared/lib/seo'
import '../globals.css'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteConfig.seo.siteTitle,
      template: `%s | ${siteConfig.firmName}`,
    },
    description: siteConfig.seo.defaultDescription,
    alternates: {
      canonical: absoluteUrl(locale, '/'),
      languages: buildLanguageAlternates('/'),
    },
    openGraph: {
      title: siteConfig.seo.siteTitle,
      description: siteConfig.seo.defaultDescription,
      locale: getOgLocale(locale),
      siteName: siteConfig.firmName,
      type: 'website',
      url: absoluteUrl(locale, '/'),
    },
    twitter: {
      card: 'summary',
      title: siteConfig.seo.siteTitle,
      description: siteConfig.seo.defaultDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.firmName,
  url: SITE_URL,
  description: siteConfig.seo.defaultDescription,
  slogan: siteConfig.firmSlogan,
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
