import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

const PAGE_LINK = 'w-10 h-10 flex items-center justify-center rounded-full border text-sm font-semibold transition-all';
const PAGE_IDLE = 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700';
const ARROW = 'p-2 rounded-full border border-gray-200 text-gray-600 transition-all';

interface Props {
    query: string;
    page: number;
    totalPages: number;
}

export function SearchPagination({ query, page, totalPages }: Props) {
    const t = useTranslations('Search');
    if (totalPages <= 1) return null;

    const hrefFor = (target: number) => ({
        pathname: '/buscar',
        query: target === 1 ? { q: query } : { q: query, page: target },
    });

    const delta = 2;
    const first = Math.max(1, page - delta);
    const last = Math.min(totalPages, page + delta);
    const range = Array.from({ length: last - first + 1 }, (_, i) => first + i);

    return (
        <nav aria-label={t('pagination')} className="flex flex-wrap items-center justify-center gap-2 mt-12">
            {page > 1 ? (
                <Link href={hrefFor(page - 1)} aria-label={t('previousPage')} className={`${ARROW} hover:border-amber-400 hover:text-amber-700`}>
                    <ChevronLeft className="w-5 h-5" />
                </Link>
            ) : (
                <span aria-hidden="true" className={`${ARROW} opacity-30`}>
                    <ChevronLeft className="w-5 h-5" />
                </span>
            )}

            {first > 1 && (
                <>
                    <Link href={hrefFor(1)} className={`${PAGE_LINK} ${PAGE_IDLE}`}>1</Link>
                    {first > 2 && <span className="text-gray-400 px-1">…</span>}
                </>
            )}

            {range.map((p) => (
                <Link
                    key={p}
                    href={hrefFor(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`${PAGE_LINK} ${p === page ? 'bg-amber-600 border-amber-600 text-white shadow' : PAGE_IDLE}`}
                >
                    {p}
                </Link>
            ))}

            {last < totalPages && (
                <>
                    {last < totalPages - 1 && <span className="text-gray-400 px-1">…</span>}
                    <Link href={hrefFor(totalPages)} className={`${PAGE_LINK} ${PAGE_IDLE}`}>{totalPages}</Link>
                </>
            )}

            {page < totalPages ? (
                <Link href={hrefFor(page + 1)} aria-label={t('nextPage')} className={`${ARROW} hover:border-amber-400 hover:text-amber-700`}>
                    <ChevronRight className="w-5 h-5" />
                </Link>
            ) : (
                <span aria-hidden="true" className={`${ARROW} opacity-30`}>
                    <ChevronRight className="w-5 h-5" />
                </span>
            )}
        </nav>
    );
}
