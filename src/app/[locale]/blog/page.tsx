import { articleService } from '@/features/blog/services/articleService';
import { ArticleCard } from '@/features/blog/components/ArticleCard';
import PageShell from '@/components/magazine/PageShell';
import { getTranslations } from 'next-intl/server';

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Hero');
    const articles = await articleService.getArticles(locale);

    return (
        <PageShell>
            <div className="container mx-auto py-20 px-4 md:px-8 max-w-7xl">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        {t('articlesTitle' as any) || 'Artículos Conozca'}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('articlesLead' as any) || 'Periodismo independiente, cultura y diseño para una lectura pausada.'}
                    </p>
                </div>

                {articles.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">No hay artículos publicados aún.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article: any) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
}
