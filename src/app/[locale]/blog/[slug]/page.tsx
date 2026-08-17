export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { articleService } from '@/features/blog/services/articleService';
import { notFound } from 'next/navigation';
import PageShell from '@/components/magazine/PageShell';
import { DownloadPdfButton } from '@/features/blog/components/DownloadPdfButton';
import { sanitizeRichHtml } from '@/shared/lib/sanitize-rich-html';
import { routing } from '@/i18n/routing';
import { absoluteUrl, buildLanguageAlternates, getOgLocale, SITE_URL } from '@/shared/lib/seo';
import { siteConfig } from '@/config/siteConfig';

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }): Promise<Metadata> {
    const { locale, slug } = await params;
    const article = await articleService.getArticleBySlug(slug, locale);

    if (!article || !article.translation) {
        return {};
    }

    const description = article.translation.excerpt?.trim() || stripHtml(article.translation.content).slice(0, 160);
    const path = `/blog/${article.slug}`;
    const availableLocales = (article.translations ?? [])
        .map((t: { language_code: string }) => t.language_code)
        .filter((code: string): code is typeof routing.locales[number] => (routing.locales as readonly string[]).includes(code));

    return {
        title: article.translation.title,
        description,
        alternates: {
            canonical: absoluteUrl(locale, path),
            languages: buildLanguageAlternates(path, availableLocales.length > 0 ? availableLocales : undefined),
        },
        openGraph: {
            title: article.translation.title,
            description,
            locale: getOgLocale(locale),
            siteName: siteConfig.firmName,
            type: 'article',
            url: absoluteUrl(locale, path),
            publishedTime: article.published_at || undefined,
            modifiedTime: article.updated_at || undefined,
            authors: article.author_name ? [article.author_name] : undefined,
        },
        twitter: {
            card: 'summary',
            title: article.translation.title,
            description,
        },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params;
    const article = await articleService.getArticleBySlug(slug, locale);

    if (!article || !article.translation) {
        notFound();
    }

    const sanitizedContent = sanitizeRichHtml(String(article.translation.content));

    const articleUrl = absoluteUrl(locale, `/blog/${article.slug}`);
    const plainDescription = article.translation.excerpt?.trim() || stripHtml(sanitizedContent).slice(0, 160);

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.translation.title,
        description: plainDescription,
        datePublished: article.published_at || undefined,
        dateModified: article.updated_at || article.published_at || undefined,
        author: article.author_name ? { '@type': 'Person', name: article.author_name } : { '@type': 'Organization', name: siteConfig.firmName },
        publisher: { '@type': 'Organization', name: siteConfig.firmName, url: SITE_URL },
        mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: siteConfig.firmName, item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl(locale, '/blog') },
            { '@type': 'ListItem', position: 3, name: article.translation.title, item: articleUrl },
        ],
    };

    const pdfData = {
        title: article.translation.title,
        authorName: article.author_name || null,
        publishedAt: article.published_at || null,
        slug: article.slug,
        content: sanitizedContent,
        categoryName: article.category?.translation?.name || null,
    };

    return (
        <PageShell>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {/* Header sticky con botón de descargar */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        {article.category?.translation?.name && (
                            <span className="font-medium">{article.category.translation.name}</span>
                        )}
                    </div>
                    <DownloadPdfButton article={pdfData} />
                </div>
            </div>

            {/* Contenido del artículo */}
            <article className="max-w-4xl mx-auto py-20 px-6">
                <header className="mb-12 text-center">
                    <h1
                        className="text-5xl font-extrabold text-gray-900 mb-6"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {article.translation.title}
                    </h1>
                    <div className="flex items-center justify-center space-x-4 text-gray-700">
                        {article.published_at && (
                            <span>{new Date(article.published_at).toLocaleDateString(locale)}</span>
                        )}
                        {article.author_name && (
                            <>
                                <span>•</span>
                                <span>Por {article.author_name}</span>
                            </>
                        )}
                    </div>
                    {article.translation.excerpt && (
                        <p className="text-lg text-gray-600 italic mt-8 border-l-4 border-amber-500 pl-4 text-left">
                            {article.translation.excerpt}
                        </p>
                    )}
                </header>
                <div
                    className={[
                        'prose max-w-none',
                        // APA typography
                        '[&_p]:leading-[2] [&_p]:indent-8 [&_p]:text-left [&_p]:text-base',
                        '[&_h1]:text-center [&_h1]:font-bold [&_h1]:text-base',
                        '[&_h2]:text-left [&_h2]:font-bold [&_h2]:text-base',
                        '[&_h3]:text-left [&_h3]:font-bold [&_h3]:italic [&_h3]:text-base',
                        '[&_blockquote]:pl-12 [&_blockquote]:pr-12 [&_blockquote]:not-italic [&_blockquote]:border-none [&_blockquote]:leading-[2]',
                        '[&_li]:leading-[2]',
                        'text-gray-800',
                    ].join(' ')}
                    style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif', fontSize: '12pt' }}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </article>
        </PageShell>
    );
}

