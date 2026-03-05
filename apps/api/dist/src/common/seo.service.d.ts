export type SeoMeta = {
    title?: string;
    description?: string;
    image?: string;
    canonicalUrl?: string;
};
export declare class SeoService {
    private metaByArticle;
    setMeta(articleId: string, meta: SeoMeta): void;
    getMeta(articleId: string): SeoMeta | undefined;
}
