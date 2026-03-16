import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next'
import { siteConfig } from '@/config/siteConfig'
import '../globals.css'

export const metadata: Metadata = {
  title: siteConfig.seo.siteTitle,
  description: siteConfig.seo.defaultDescription,
  openGraph: {
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.defaultDescription,
    locale: siteConfig.seo.locale,
    siteName: siteConfig.firmName,
    type: 'website',
  },
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
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
