"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const pdf_service_1 = require("./pdf.service");
const database_1 = require("@conozca/database");
let ArticleService = class ArticleService {
    prisma;
    pdfService;
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async create(createArticleDto, userId, userRole) {
        if (userRole === database_1.Role.USER) {
            throw new common_1.ForbiddenException("Solo administradores y editores pueden crear artículos");
        }
        const existingArticle = await this.prisma.article.findUnique({
            where: { slug: createArticleDto.slug },
        });
        if (existingArticle) {
            throw new common_1.BadRequestException("El slug del artículo ya existe");
        }
        const author = await this.prisma.author.findUnique({
            where: { id: createArticleDto.authorId },
        });
        if (!author) {
            throw new common_1.NotFoundException("El autor especificado no existe");
        }
        const category = await this.prisma.category.findUnique({
            where: { id: createArticleDto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException("La categoría especificada no existe");
        }
        const article = await this.prisma.article.create({
            data: {
                title: createArticleDto.title,
                slug: createArticleDto.slug,
                content: createArticleDto.content,
                excerpt: createArticleDto.excerpt,
                featuredImage: createArticleDto.featuredImage,
                status: createArticleDto.status || database_1.PostStatus.DRAFT,
                authorId: createArticleDto.authorId,
                editorId: userId,
                categoryId: createArticleDto.categoryId,
                publishedAt: createArticleDto.status === database_1.PostStatus.PUBLISHED ? new Date() : null,
            },
            include: {
                author: true,
                category: true,
                editor: true,
                views: true,
            },
        });
        return this.formatArticleResponse(article);
    }
    async findAll(page = 1, pageSize = 10, userRole, userId) {
        const skip = (page - 1) * pageSize;
        const where = userRole === database_1.Role.USER
            ? { status: database_1.PostStatus.PUBLISHED }
            : {
                OR: [
                    { status: database_1.PostStatus.PUBLISHED },
                    { editorId: userId },
                ],
            };
        const [articles, total] = await Promise.all([
            this.prisma.article.findMany({
                where,
                skip,
                take: pageSize,
                include: {
                    author: true,
                    category: true,
                    editor: true,
                    views: true,
                },
                orderBy: { publishedAt: "desc" },
            }),
            this.prisma.article.count({ where }),
        ]);
        return {
            items: articles.map((article) => this.formatArticleResponse(article)),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async findOne(slugOrId, userRole, userId) {
        let article = await this.prisma.article.findUnique({
            where: {
                slug: slugOrId,
            },
            include: {
                author: true,
                category: true,
                editor: true,
                views: true,
            },
        });
        if (!article) {
            article = await this.prisma.article.findUnique({
                where: { id: slugOrId },
                include: {
                    author: true,
                    category: true,
                    editor: true,
                    views: true,
                },
            });
        }
        if (!article) {
            throw new common_1.NotFoundException("Artículo no encontrado");
        }
        if (article.status !== database_1.PostStatus.PUBLISHED) {
            if (!userRole || userRole === database_1.Role.USER) {
                throw new common_1.NotFoundException("Artículo no encontrado");
            }
        }
        if (userId && article.status === database_1.PostStatus.PUBLISHED) {
            await this.prisma.view.create({
                data: {
                    articleId: article.id,
                    userId,
                },
            });
            article =
                (await this.prisma.article.findUnique({
                    where: { id: article.id },
                    include: {
                        author: true,
                        category: true,
                        editor: true,
                        views: true,
                    },
                })) || article;
        }
        return this.formatArticleResponse(article);
    }
    async update(id, updateArticleDto, userId, userRole) {
        const article = await this.prisma.article.findUnique({
            where: { id },
        });
        if (!article) {
            throw new common_1.NotFoundException("Artículo no encontrado");
        }
        if (userRole !== database_1.Role.ADMIN && article.editorId !== userId) {
            throw new common_1.ForbiddenException("No tienes permisos para actualizar este artículo");
        }
        if (updateArticleDto.slug && updateArticleDto.slug !== article.slug) {
            const existingArticle = await this.prisma.article.findUnique({
                where: { slug: updateArticleDto.slug },
            });
            if (existingArticle) {
                throw new common_1.BadRequestException("El slug del artículo ya existe");
            }
        }
        if (updateArticleDto.authorId &&
            updateArticleDto.authorId !== article.authorId) {
            const author = await this.prisma.author.findUnique({
                where: { id: updateArticleDto.authorId },
            });
            if (!author) {
                throw new common_1.NotFoundException("El autor especificado no existe");
            }
        }
        if (updateArticleDto.categoryId &&
            updateArticleDto.categoryId !== article.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: updateArticleDto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException("La categoría especificada no existe");
            }
        }
        const oldSlug = article.slug;
        const updatedArticle = await this.prisma.article.update({
            where: { id },
            data: {
                ...updateArticleDto,
                publishedAt: updateArticleDto.status === database_1.PostStatus.PUBLISHED &&
                    !article.publishedAt
                    ? new Date()
                    : article.publishedAt,
            },
            include: {
                author: true,
                category: true,
                editor: true,
                views: true,
            },
        });
        try {
            if (updateArticleDto.slug && updateArticleDto.slug !== oldSlug) {
                await this.prisma.redirect?.create({
                    data: {
                        fromSlug: oldSlug,
                        toSlug: updateArticleDto.slug,
                        articleId: id,
                    },
                });
            }
        }
        catch {
        }
        return this.formatArticleResponse(updatedArticle);
    }
    async delete(id, userId, userRole) {
        const article = await this.prisma.article.findUnique({
            where: { id },
        });
        if (!article) {
            throw new common_1.NotFoundException("Artículo no encontrado");
        }
        if (userRole !== database_1.Role.ADMIN && article.editorId !== userId) {
            throw new common_1.ForbiddenException("No tienes permisos para eliminar este artículo");
        }
        await this.prisma.view.deleteMany({
            where: { articleId: id },
        });
        await this.prisma.article.delete({
            where: { id },
        });
    }
    async createCategory(createCategoryDto, userRole) {
        if (userRole !== database_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("Solo administradores pueden crear categorías");
        }
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { slug: createCategoryDto.slug },
                    { name: createCategoryDto.name },
                ],
            },
        });
        if (existingCategory) {
            throw new common_1.BadRequestException("La categoría ya existe");
        }
        return await this.prisma.category.create({
            data: createCategoryDto,
        });
    }
    async findAllCategories() {
        return await this.prisma.category.findMany({
            include: {
                _count: {
                    select: { articles: true },
                },
            },
        });
    }
    async createAuthor(createAuthorDto, userRole) {
        if (userRole !== database_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("Solo administradores pueden crear autores");
        }
        return await this.prisma.author.create({
            data: createAuthorDto,
        });
    }
    async findAllAuthors() {
        return await this.prisma.author.findMany({
            include: {
                _count: {
                    select: { articles: true },
                },
            },
        });
    }
    async createBlock(articleId, createBlockDto, userId, userRole) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
            select: { editorId: true },
        });
        if (!article) {
            throw new common_1.NotFoundException("El artículo especificado no existe");
        }
        if (userRole !== database_1.Role.ADMIN && article.editorId !== userId) {
            throw new common_1.ForbiddenException("No tienes permiso para crear bloques en este artículo");
        }
        const lastBlock = await this.prisma.articleBlock.findFirst({
            where: { articleId },
            orderBy: { order: "desc" },
            select: { order: true },
        });
        const nextOrder = (lastBlock?.order ?? -1) + 1;
        const block = await this.prisma.articleBlock.create({
            data: {
                articleId,
                order: nextOrder,
                type: createBlockDto.type,
                content: createBlockDto.content,
                fontSize: createBlockDto.fontSize ?? 16,
                fontFamily: createBlockDto.fontFamily ?? database_1.FontFamily.ARIAL,
                textAlign: createBlockDto.textAlign ?? database_1.TextAlign.LEFT,
                textColor: createBlockDto.textColor ?? "#000000",
                backgroundColor: createBlockDto.backgroundColor ?? null,
                isBold: createBlockDto.isBold ?? false,
                isItalic: createBlockDto.isItalic ?? false,
                isUnderline: createBlockDto.isUnderline ?? false,
                isStrikethrough: createBlockDto.isStrikethrough ?? false,
                listItemLevel: createBlockDto.listItemLevel ?? 0,
                imageUrl: createBlockDto.imageUrl ?? null,
                imageAlt: createBlockDto.imageAlt ?? null,
                imageWidth: createBlockDto.imageWidth ?? null,
                imageHeight: createBlockDto.imageHeight ?? null,
            },
        });
        return this.formatBlockResponse(block);
    }
    async createMultipleBlocks(articleId, createBlocksDto, userId, userRole) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
            select: { editorId: true },
        });
        if (!article) {
            throw new common_1.NotFoundException("El artículo especificado no existe");
        }
        if (userRole !== database_1.Role.ADMIN && article.editorId !== userId) {
            throw new common_1.ForbiddenException("No tienes permiso para crear bloques en este artículo");
        }
        return await this.prisma.$transaction(async (tx) => {
            const lastBlock = await tx.articleBlock.findFirst({
                where: { articleId },
                orderBy: { order: "desc" },
                select: { order: true },
            });
            let nextOrder = (lastBlock?.order ?? -1) + 1;
            const created = [];
            for (const blockDto of createBlocksDto.blocks) {
                const block = await tx.articleBlock.create({
                    data: {
                        articleId,
                        order: nextOrder,
                        type: blockDto.type,
                        content: blockDto.content,
                        fontSize: blockDto.fontSize ?? 16,
                        fontFamily: blockDto.fontFamily ?? database_1.FontFamily.ARIAL,
                        textAlign: blockDto.textAlign ?? database_1.TextAlign.LEFT,
                        textColor: blockDto.textColor ?? "#000000",
                        backgroundColor: blockDto.backgroundColor ?? null,
                        isBold: blockDto.isBold ?? false,
                        isItalic: blockDto.isItalic ?? false,
                        isUnderline: blockDto.isUnderline ?? false,
                        isStrikethrough: blockDto.isStrikethrough ?? false,
                        listItemLevel: blockDto.listItemLevel ?? 0,
                        imageUrl: blockDto.imageUrl ?? null,
                        imageAlt: blockDto.imageAlt ?? null,
                        imageWidth: blockDto.imageWidth ?? null,
                        imageHeight: blockDto.imageHeight ?? null,
                    },
                });
                created.push(this.formatBlockResponse(block));
                nextOrder++;
            }
            return created;
        });
    }
    async getBlocksByArticle(articleId) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
        });
        if (!article) {
            throw new common_1.NotFoundException("El artículo especificado no existe");
        }
        const blocks = await this.prisma.articleBlock.findMany({
            where: { articleId },
            orderBy: { order: "asc" },
        });
        return blocks.map((block) => this.formatBlockResponse(block));
    }
    async searchArticles(query) {
        const articles = await this.prisma.article.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { content: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 20,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                status: true,
                createdAt: true,
            },
        });
        return articles;
    }
    async getBlock(blockId) {
        const block = await this.prisma.articleBlock.findUnique({
            where: { id: blockId },
        });
        if (!block) {
            throw new common_1.NotFoundException("El bloque especificado no existe");
        }
        return this.formatBlockResponse(block);
    }
    async updateBlock(blockId, updateBlockDto, userId, userRole) {
        const block = await this.prisma.articleBlock.findUnique({
            where: { id: blockId },
            select: {
                articleId: true,
                article: {
                    select: { editorId: true },
                },
            },
        });
        if (!block) {
            throw new common_1.NotFoundException("El bloque especificado no existe");
        }
        if (userRole !== database_1.Role.ADMIN && block.article.editorId !== userId) {
            throw new common_1.ForbiddenException("No tienes permiso para actualizar este bloque");
        }
        const updatedBlock = await this.prisma.articleBlock.update({
            where: { id: blockId },
            data: {
                ...(updateBlockDto.type && { type: updateBlockDto.type }),
                ...(updateBlockDto.content !== undefined && {
                    content: updateBlockDto.content,
                }),
                ...(updateBlockDto.fontSize !== undefined && {
                    fontSize: updateBlockDto.fontSize,
                }),
                ...(updateBlockDto.fontFamily && {
                    fontFamily: updateBlockDto.fontFamily,
                }),
                ...(updateBlockDto.textAlign && {
                    textAlign: updateBlockDto.textAlign,
                }),
                ...(updateBlockDto.textColor && {
                    textColor: updateBlockDto.textColor,
                }),
                ...(updateBlockDto.backgroundColor !== undefined && {
                    backgroundColor: updateBlockDto.backgroundColor,
                }),
                ...(updateBlockDto.isBold !== undefined && {
                    isBold: updateBlockDto.isBold,
                }),
                ...(updateBlockDto.isItalic !== undefined && {
                    isItalic: updateBlockDto.isItalic,
                }),
                ...(updateBlockDto.isUnderline !== undefined && {
                    isUnderline: updateBlockDto.isUnderline,
                }),
                ...(updateBlockDto.isStrikethrough !== undefined && {
                    isStrikethrough: updateBlockDto.isStrikethrough,
                }),
                ...(updateBlockDto.listItemLevel !== undefined && {
                    listItemLevel: updateBlockDto.listItemLevel,
                }),
                ...(updateBlockDto.imageUrl && { imageUrl: updateBlockDto.imageUrl }),
                ...(updateBlockDto.imageAlt !== undefined && {
                    imageAlt: updateBlockDto.imageAlt,
                }),
                ...(updateBlockDto.imageWidth !== undefined && {
                    imageWidth: updateBlockDto.imageWidth,
                }),
                ...(updateBlockDto.imageHeight !== undefined && {
                    imageHeight: updateBlockDto.imageHeight,
                }),
            },
        });
        return this.formatBlockResponse(updatedBlock);
    }
    async deleteBlock(blockId, userId, userRole) {
        const block = await this.prisma.articleBlock.findUnique({
            where: { id: blockId },
            select: {
                articleId: true,
                order: true,
                article: {
                    select: { editorId: true },
                },
            },
        });
        if (!block) {
            throw new common_1.NotFoundException("El bloque especificado no existe");
        }
        if (userRole !== database_1.Role.ADMIN && block.article.editorId !== userId) {
            throw new common_1.ForbiddenException("No tienes permiso para eliminar este bloque");
        }
        await this.prisma.articleBlock.delete({
            where: { id: blockId },
        });
        const remainingBlocks = await this.prisma.articleBlock.findMany({
            where: { articleId: block.articleId },
            orderBy: { order: "asc" },
            select: { id: true },
        });
        for (let i = 0; i < remainingBlocks.length; i++) {
            await this.prisma.articleBlock.update({
                where: { id: remainingBlocks[i].id },
                data: { order: i },
            });
        }
        return { message: "Bloque eliminado correctamente" };
    }
    async reorderBlocks(articleId, reorderDto, userId, userRole) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
            select: { editorId: true },
        });
        if (!article) {
            throw new common_1.NotFoundException("El artículo especificado no existe");
        }
        if (userRole !== database_1.Role.ADMIN && article.editorId !== userId) {
            throw new common_1.ForbiddenException("No tienes permiso para reordenar bloques en este artículo");
        }
        return await this.prisma.$transaction(async (tx) => {
            for (let i = 0; i < reorderDto.blockIds.length; i++) {
                await tx.articleBlock.update({
                    where: { id: reorderDto.blockIds[i] },
                    data: { order: 10000 + i },
                });
            }
            const updatedBlocks = [];
            for (let i = 0; i < reorderDto.blockIds.length; i++) {
                const block = await tx.articleBlock.update({
                    where: { id: reorderDto.blockIds[i] },
                    data: { order: i },
                    select: {
                        id: true,
                        articleId: true,
                        order: true,
                        type: true,
                        content: true,
                        fontSize: true,
                        fontFamily: true,
                        textAlign: true,
                        textColor: true,
                        backgroundColor: true,
                        isBold: true,
                        isItalic: true,
                        isUnderline: true,
                        isStrikethrough: true,
                        listItemLevel: true,
                        imageUrl: true,
                        imageAlt: true,
                        imageWidth: true,
                        imageHeight: true,
                        createdAt: true,
                        updatedAt: true,
                        metadata: true,
                    },
                });
                updatedBlocks.push(this.formatBlockResponse(block));
            }
            return updatedBlocks;
        });
    }
    async getArticleWithBlocks(articleId, userRole, _userId) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
            include: {
                author: true,
                editor: true,
                category: true,
                blocks: {
                    orderBy: { order: "asc" },
                },
                views: true,
            },
        });
        if (!article) {
            throw new common_1.NotFoundException("El artículo especificado no existe");
        }
        if (userRole === database_1.Role.USER && article.status !== database_1.PostStatus.PUBLISHED) {
            throw new common_1.ForbiddenException("No tienes permiso para ver este artículo");
        }
        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            featuredImage: article.featuredImage,
            status: article.status,
            author: {
                id: article.author.id,
                name: article.author.name,
                bio: article.author.bio,
                avatarUrl: article.author.avatarUrl,
            },
            editor: {
                id: article.editor.id,
                email: article.editor.email,
                name: article.editor.name,
            },
            category: {
                id: article.category.id,
                name: article.category.name,
                slug: article.category.slug,
            },
            blocks: article.blocks.map((block) => this.formatBlockResponse(block)),
            viewCount: article.views?.length || 0,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            publishedAt: article.publishedAt,
        };
    }
    async generatePdf(articleId, includeWatermark = true, watermarkText = "Propiedad de Conozca") {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
            include: {
                author: true,
                blocks: {
                    orderBy: { order: "asc" },
                },
            },
        });
        if (!article) {
            throw new common_1.NotFoundException("El artículo especificado no existe");
        }
        return this.pdfService.generateArticlePdf({
            title: article.title,
            author: { name: article.author.name },
            createdAt: article.createdAt,
            blocks: article.blocks,
        }, includeWatermark, watermarkText);
    }
    formatArticleResponse(article) {
        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt || undefined,
            featuredImage: article.featuredImage || undefined,
            status: article.status,
            author: {
                id: article.author.id,
                name: article.author.name,
                bio: article.author.bio || undefined,
                avatarUrl: article.author.avatarUrl || undefined,
            },
            editor: article.editor
                ? {
                    id: article.editor.id,
                    email: article.editor.email,
                    name: article.editor.name,
                    role: article.editor.role,
                }
                : undefined,
            category: {
                id: article.category.id,
                name: article.category.name,
                slug: article.category.slug,
            },
            viewCount: article.views?.length || 0,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            publishedAt: article.publishedAt || undefined,
        };
    }
    formatBlockResponse(block) {
        return {
            id: block.id,
            articleId: block.articleId,
            order: block.order,
            type: block.type,
            content: block.content,
            fontSize: block.fontSize || 16,
            fontFamily: block.fontFamily || database_1.FontFamily.ARIAL,
            textAlign: block.textAlign || database_1.TextAlign.LEFT,
            textColor: block.textColor || "#000000",
            backgroundColor: block.backgroundColor,
            isBold: block.isBold || false,
            isItalic: block.isItalic || false,
            isUnderline: block.isUnderline || false,
            isStrikethrough: block.isStrikethrough || false,
            listItemLevel: block.listItemLevel || 0,
            imageUrl: block.imageUrl,
            imageAlt: block.imageAlt,
            imageWidth: block.imageWidth,
            imageHeight: block.imageHeight,
            createdAt: block.createdAt,
            updatedAt: block.updatedAt,
        };
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService])
], ArticleService);
//# sourceMappingURL=article.service.js.map