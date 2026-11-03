export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { articleService } from '@/features/blog/services/articleService';
import { ArticleCard } from '@/features/blog/components/ArticleCard';
import { SearchPagination } from '@/features/blog/components/SearchPagination';
import PageShell from '@/components/magazine/PageShell';

const PAGE_SIZE = 10;

type SearchParams = Promise<{ q?: string | string[]; page?: string | string[] }>;

function firstValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Search' });
    return {
        title: t('metaTitle'),
        robots: { index: false, follow: true },
    };
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
    const { locale } = await params;
    const { q, page } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Search' });
    const tBlog = await getTranslations({ locale, namespace: 'Blog' });

    const query = (firstValue(q) ?? '').trim();
    const requestedPage = Number.parseInt(firstValue(page) ?? '1', 10) || 1;
    const results = await articleService.searchArticles(locale, query, requestedPage, PAGE_SIZE);

    return (
        <PageShell>
            <div className="container mx-auto py-20 px-4 md:px-8 max-w-5xl">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4 break-words">
                    {query ? t('resultsFor', { query }) : t('pageTitle')}
                </h1>

                {!query ? (
                    <p className="text-gray-500 py-12 text-center">{t('emptyQuery')}</p>
                ) : results.total === 0 ? (
                    <p className="text-gray-500 py-12 text-center break-words">{t('noResults', { query })}</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-400 mb-8">
                            {tBlog('results', { count: results.total })} — {tBlog('pageIndicator', { page: results.page, total: results.totalPages })}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {results.articles.map((article: any) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                        <SearchPagination query={query} page={results.page} totalPages={results.totalPages} />
                    </>
                )}
            </div>
        </PageShell>
    );
}
