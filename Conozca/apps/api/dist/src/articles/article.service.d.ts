import { PrismaService } from "../prisma.service";
import { PdfService } from "./pdf.service";
import { CreateArticleDto, UpdateArticleDto, ArticleResponseDto, ArticleListResponseDto, CreateCategoryDto, CreateAuthorDto, CreateArticleBlockDto, UpdateArticleBlockDto, ArticleBlockResponseDto, CreateMultipleBlocksDto, ReorderBlocksDto, ArticleWithBlocksResponseDto } from "./article.dto";
import { Role } from "@conozca/database";
import { Readable } from "stream";
export declare class ArticleService {
    private prisma;
    private pdfService;
    constructor(prisma: PrismaService, pdfService: PdfService);
    create(createArticleDto: CreateArticleDto, userId: string, userRole: Role): Promise<ArticleResponseDto>;
    findAll(page?: number, pageSize?: number, userRole?: Role, userId?: string): Promise<ArticleListResponseDto>;
    findOne(slugOrId: string, userRole?: Role, userId?: string): Promise<ArticleResponseDto>;
    update(id: string, updateArticleDto: UpdateArticleDto, userId: string, userRole: Role): Promise<ArticleResponseDto>;
    delete(id: string, userId: string, userRole: Role): Promise<void>;
    createCategory(createCategoryDto: CreateCategoryDto, userRole: Role): Promise<any>;
    findAllCategories(): Promise<any>;
    createAuthor(createAuthorDto: CreateAuthorDto, userRole: Role): Promise<any>;
    findAllAuthors(): Promise<any>;
    createBlock(articleId: string, createBlockDto: CreateArticleBlockDto, userId: string, userRole: Role): Promise<ArticleBlockResponseDto>;
    createMultipleBlocks(articleId: string, createBlocksDto: CreateMultipleBlocksDto, userId: string, userRole: Role): Promise<ArticleBlockResponseDto[]>;
    getBlocksByArticle(articleId: string): Promise<ArticleBlockResponseDto[]>;
    searchArticles(query: string): Promise<any>;
    getBlock(blockId: string): Promise<ArticleBlockResponseDto>;
    updateBlock(blockId: string, updateBlockDto: UpdateArticleBlockDto, userId: string, userRole: Role): Promise<ArticleBlockResponseDto>;
    deleteBlock(blockId: string, userId: string, userRole: Role): Promise<{
        message: string;
    }>;
    reorderBlocks(articleId: string, reorderDto: ReorderBlocksDto, userId: string, userRole: Role): Promise<ArticleBlockResponseDto[]>;
    getArticleWithBlocks(articleId: string, userRole?: Role, _userId?: string): Promise<ArticleWithBlocksResponseDto>;
    generatePdf(articleId: string, includeWatermark?: boolean, watermarkText?: string): Promise<Readable>;
    private formatArticleResponse;
    private formatBlockResponse;
}
