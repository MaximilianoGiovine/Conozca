import type { Response } from "express";
import { ArticleService } from "./article.service";
import { CreateArticleDto, UpdateArticleDto, CreateCategoryDto, CreateAuthorDto, CreateArticleBlockDto, UpdateArticleBlockDto, CreateMultipleBlocksDto, ReorderBlocksDto } from "./article.dto";
import * as seoService from "../common/seo.service";
import type { AuthenticatedRequest } from "../common/interfaces/authenticated-request.interface";
export declare class ArticleController {
    private articleService;
    private seo;
    constructor(articleService: ArticleService, seo: seoService.SeoService);
    createCategory(createCategoryDto: CreateCategoryDto, req: AuthenticatedRequest): Promise<any>;
    findAllCategories(): Promise<any>;
    createAuthor(createAuthorDto: CreateAuthorDto, req: AuthenticatedRequest): Promise<any>;
    findAllAuthors(): Promise<any>;
    create(createArticleDto: CreateArticleDto, req: AuthenticatedRequest): Promise<import("./article.dto").ArticleResponseDto>;
    findAll(page: string | undefined, pageSize: string | undefined, req: AuthenticatedRequest): Promise<import("./article.dto").ArticleListResponseDto>;
    findOne(slugOrId: string, req: AuthenticatedRequest): Promise<import("./article.dto").ArticleResponseDto>;
    update(id: string, updateArticleDto: UpdateArticleDto, req: AuthenticatedRequest): Promise<import("./article.dto").ArticleResponseDto>;
    delete(id: string, req: AuthenticatedRequest): Promise<void>;
    createBlock(articleId: string, createBlockDto: CreateArticleBlockDto, req: AuthenticatedRequest): Promise<import("./article-block.dto").ArticleBlockResponseDto>;
    createMultipleBlocks(articleId: string, createBlocksDto: CreateMultipleBlocksDto, req: AuthenticatedRequest): Promise<import("./article-block.dto").ArticleBlockResponseDto[]>;
    getBlocksByArticle(articleId: string): Promise<import("./article-block.dto").ArticleBlockResponseDto[]>;
    search(q: string): Promise<any>;
    getBlock(blockId: string): Promise<import("./article-block.dto").ArticleBlockResponseDto>;
    updateBlock(blockId: string, updateBlockDto: UpdateArticleBlockDto, req: AuthenticatedRequest): Promise<import("./article-block.dto").ArticleBlockResponseDto>;
    deleteBlock(blockId: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    reorderBlocks(articleId: string, reorderDto: ReorderBlocksDto, req: AuthenticatedRequest): Promise<import("./article-block.dto").ArticleBlockResponseDto[]>;
    getArticleWithBlocks(id: string, req: AuthenticatedRequest): Promise<import("./article-block.dto").ArticleWithBlocksResponseDto>;
    downloadPdf(id: string, includeWatermark: string | undefined, watermarkText: string | undefined, res: Response): Promise<void>;
    getSeo(id: string): seoService.SeoMeta;
    setSeo(id: string, body: seoService.SeoMeta): {
        ok: boolean;
    };
}
