import { Link } from '@/i18n/routing';
import { Article } from '../types/article';

export function ArticleCard({ article }: { article: Article }) {
    if (!article.translation) return null;

    return (
        <div className="border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition bg-white dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                <Link href={`/blog/${article.slug}`}>{article.translation.title}</Link>
            </h3>
            {article.translation.excerpt && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {article.translation.excerpt}
                </p>
            )}
            <div className="text-sm text-gray-400 font-medium">
                {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Borrador'}
            </div>
        </div>
    );
}
