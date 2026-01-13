import { Injectable } from '@nestjs/common';

export type SeoMeta = {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
};

@Injectable()
export class SeoService {
  private metaByArticle = new Map<string, SeoMeta>();

  setMeta(articleId: string, meta: SeoMeta) {
    const current = this.metaByArticle.get(articleId) || {};
    this.metaByArticle.set(articleId, { ...current, ...meta });
  }

  getMeta(articleId: string): SeoMeta | undefined {
    return this.metaByArticle.get(articleId);
  }
}
