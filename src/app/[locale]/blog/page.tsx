export const dynamic = 'force-dynamic';

import { articleService } from '@/features/blog/services/articleService';
import { BlogContent } from '@/features/blog/components/BlogContent';
import PageShell from '@/components/magazine/PageShell';

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const articles = await articleService.getArticles(locale);

    return (
        <PageShell>
            <div className="container mx-auto py-20 px-4 md:px-8 max-w-7xl">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        Artículos Conozca
                    </h1>
                </div>
                <BlogContent articles={articles} />
            </div>
        </PageShell>
    );
}
