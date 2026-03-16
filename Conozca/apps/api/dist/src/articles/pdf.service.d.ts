import { Readable } from "stream";
import { ArticleBlock } from "@conozca/database";
export declare class PdfService {
    generateArticlePdf(article: {
        title: string;
        author: {
            name: string;
        };
        createdAt: Date;
        blocks: ArticleBlock[];
    }, includeWatermark?: boolean, watermarkText?: string): Promise<Readable>;
    private renderBlock;
    private addWatermark;
    private mapFontFamily;
    private mapTextAlign;
}
