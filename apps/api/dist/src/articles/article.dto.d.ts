import { PostStatus, Role } from "@conozca/database";
export { CreateArticleBlockDto, UpdateArticleBlockDto, ArticleBlockResponseDto, CreateMultipleBlocksDto, ReorderBlocksDto, DownloadPdfDto, ArticleWithBlocksResponseDto, } from "./article-block.dto";
export declare class CreateArticleDto {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status?: PostStatus;
    authorId: string;
    categoryId: string;
}
export declare class UpdateArticleDto {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    status?: PostStatus;
    authorId?: string;
    categoryId?: string;
}
export declare class ArticleResponseDto {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status: PostStatus;
    author: {
        id: string;
        name: string;
        bio?: string;
        avatarUrl?: string;
    };
    editor?: {
        id: string;
        email: string;
        name: string;
        role: Role;
    };
    category: {
        id: string;
        name: string;
        slug: string;
    };
    viewCount?: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}
export declare class ArticleListResponseDto {
    items: ArticleResponseDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare class CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
}
export declare class CreateAuthorDto {
    name: string;
    bio?: string;
    avatarUrl?: string;
}
