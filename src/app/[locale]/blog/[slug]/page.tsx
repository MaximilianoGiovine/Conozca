import { articleService } from '@/features/blog/services/articleService';
import { notFound } from 'next/navigation';
import PageShell from '@/components/magazine/PageShell';

export default async function ArticlePage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params;
    const article = await articleService.getArticleBySlug(slug, locale);

    if (!article || !article.translation) {
        notFound();
    }

    return (
        <PageShell>
            <article className="container mx-auto py-20 px-4 md:px-8 max-w-4xl">
                <header className="mb-12 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        {article.translation.title}
                    </h1>
                    <div className="flex items-center justify-center space-x-4 text-gray-500 dark:text-gray-400">
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
                </header>
                <div className="prose prose-lg dark:prose-invert mx-auto">
                    <div dangerouslySetInnerHTML={{ __html: String(article.translation.content) }} />
                </div>
            </article>
        </PageShell>
    );
}
