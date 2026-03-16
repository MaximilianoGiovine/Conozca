import { BlockType, FontFamily, TextAlign, PostStatus } from "@conozca/database";
export declare class CreateArticleBlockDto {
    type: BlockType;
    content: string;
    fontSize?: number;
    fontFamily?: FontFamily;
    textAlign?: TextAlign;
    textColor?: string;
    backgroundColor?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    isStrikethrough?: boolean;
    listItemLevel?: number;
    imageUrl?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
}
export declare class UpdateArticleBlockDto {
    type?: BlockType;
    content?: string;
    fontSize?: number;
    fontFamily?: FontFamily;
    textAlign?: TextAlign;
    textColor?: string;
    backgroundColor?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    isStrikethrough?: boolean;
    listItemLevel?: number;
    imageUrl?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
}
export declare class ArticleBlockResponseDto {
    id: string;
    articleId: string;
    order: number;
    type: BlockType;
    content: string;
    fontSize: number;
    fontFamily: FontFamily;
    textAlign: TextAlign;
    textColor: string;
    backgroundColor: string | null;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    listItemLevel: number;
    imageUrl: string | null;
    imageAlt: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateMultipleBlocksDto {
    blocks: CreateArticleBlockDto[];
}
export declare class ReorderBlocksDto {
    blockIds: string[];
}
export declare class DownloadPdfDto {
    includeWatermark?: boolean;
    watermarkText?: string;
}
export declare class ArticleWithBlocksResponseDto {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    status: PostStatus;
    author: {
        id: string;
        name: string;
        bio: string | null;
        avatarUrl: string | null;
    };
    editor: {
        id: string;
        email: string;
        name: string;
    };
    category: {
        id: string;
        name: string;
        slug: string;
    };
    blocks: ArticleBlockResponseDto[];
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
}
