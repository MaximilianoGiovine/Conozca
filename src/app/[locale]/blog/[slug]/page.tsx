export const dynamic = 'force-dynamic';

import { articleService } from '@/features/blog/services/articleService';
import { notFound } from 'next/navigation';
import PageShell from '@/components/magazine/PageShell';
import { DownloadPdfButton } from '@/features/blog/components/DownloadPdfButton';
import { sanitizeRichHtml } from '@/shared/lib/sanitize-rich-html';

export default async function ArticlePage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params;
    const article = await articleService.getArticleBySlug(slug, locale);

    if (!article || !article.translation) {
        notFound();
    }

    const sanitizedContent = sanitizeRichHtml(String(article.translation.content));

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
                    className="prose prose-lg max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </article>
        </PageShell>
    );
}

