import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('sets and gets meta, merging fields', () => {
    const seo = new SeoService();
    seo.setMeta('a1', { title: 'T1', description: 'D1' });
    seo.setMeta('a1', { image: 'img.png' });

    const meta = seo.getMeta('a1');
    expect(meta).toEqual({ title: 'T1', description: 'D1', image: 'img.png' });
  });
});
