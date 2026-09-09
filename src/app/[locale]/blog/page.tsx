export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { articleService } from '@/features/blog/services/articleService';
import { BlogContent } from '@/features/blog/components/BlogContent';
import PageShell from '@/components/magazine/PageShell';
import { absoluteUrl, buildLanguageAlternates } from '@/shared/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Blog' });
    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        alternates: {
            canonical: absoluteUrl(locale, '/blog'),
            languages: buildLanguageAlternates('/blog'),
        },
    };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Blog' });
    const articles = await articleService.getArticles(locale);

    return (
        <PageShell>
            <div className="container mx-auto py-20 px-4 md:px-8 max-w-7xl">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
                        {t('pageTitle')}
                    </h1>
                </div>
                <BlogContent articles={articles} />
            </div>
        </PageShell>
    );
}
