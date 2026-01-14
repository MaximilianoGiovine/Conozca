import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PdfService } from "./pdf.service";
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleResponseDto,
  ArticleListResponseDto,
  CreateCategoryDto,
  CreateAuthorDto,
  CreateArticleBlockDto,
  UpdateArticleBlockDto,
  ArticleBlockResponseDto,
  CreateMultipleBlocksDto,
  ReorderBlocksDto,
  ArticleWithBlocksResponseDto,
} from "./article.dto";
import {
  PostStatus,
  Role,
  BlockType,
  FontFamily,
  TextAlign,
} from "@conozca/database";
import { Readable } from "stream";

/**
 * ArticleService
 *
 * Servicio para gestionar artículos, categorías y autores
 * Incluye control de acceso basado en roles
 */
@Injectable()
export class ArticleService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  /**
   * Crear un nuevo artículo
   * Solo ADMIN y EDITOR pueden crear artículos
   */
  async create(
    createArticleDto: CreateArticleDto,
    userId: string,
    userRole: Role,
  ): Promise<ArticleResponseDto> {
    // Validar que solo ADMIN y EDITOR puedan crear artículos
    if (userRole === Role.USER) {
      throw new ForbiddenException(
        "Solo administradores y editores pueden crear artículos",
      );
    }

    // Validar que el slug es único
    const existingArticle = await this.prisma.article.findUnique({
      where: { slug: createArticleDto.slug },
    });

    if (existingArticle) {
      throw new BadRequestException("El slug del artículo ya existe");
    }

    // Validar que el autor existe
    const author = await this.prisma.author.findUnique({
      where: { id: createArticleDto.authorId },
    });

    if (!author) {
      throw new NotFoundException("El autor especificado no existe");
    }

    // Validar que la categoría existe
    const category = await this.prisma.category.findUnique({
      where: { id: createArticleDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException("La categoría especificada no existe");
    }

    // Crear el artículo
    const article = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        slug: createArticleDto.slug,
        content: createArticleDto.content,
        excerpt: createArticleDto.excerpt,
        featuredImage: createArticleDto.featuredImage,
        status: createArticleDto.status || PostStatus.DRAFT,
        authorId: createArticleDto.authorId,
        editorId: userId,
        categoryId: createArticleDto.categoryId,
        publishedAt:
          createArticleDto.status === PostStatus.PUBLISHED ? new Date() : null,
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

  /**
   * Obtener todos los artículos publicados con paginación
   * Los USER solo ven artículos publicados
   * Los ADMIN/EDITOR ven todos sus artículos
   */
  async findAll(
    page: number = 1,
    pageSize: number = 10,
    userRole?: Role,
    userId?: string,
  ): Promise<ArticleListResponseDto> {
    const skip = (page - 1) * pageSize;

    // Construir filtro según el rol
    const where =
      userRole === Role.USER
        ? { status: PostStatus.PUBLISHED }
        : {
            OR: [
              { status: PostStatus.PUBLISHED },
              { editorId: userId }, // Los editores ven sus propios artículos
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

  /**
   * Obtener un artículo por slug o ID
   */
  async findOne(slugOrId: string, userRole?: Role, userId?: string) {
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

    // Si no encuentra por slug, intenta por ID
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
      throw new NotFoundException("Artículo no encontrado");
    }

    // Validar acceso: Drafts solo visibles para EDITOR/ADMIN
    if (article.status !== PostStatus.PUBLISHED) {
      if (!userRole || userRole === Role.USER) {
        throw new NotFoundException("Artículo no encontrado");
      }
    }

    // Registrar visualización
    if (userId && article.status === PostStatus.PUBLISHED) {
      await this.prisma.view.create({
        data: {
          articleId: article.id,
          userId,
        },
      });

      // Reload article to get updated view count
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

  /**
   * Actualizar un artículo
   * Solo el editor que lo creó o un ADMIN pueden actualizar
   */
  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    userId: string,
    userRole: Role,
  ): Promise<ArticleResponseDto> {
    // Obtener el artículo actual
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException("Artículo no encontrado");
    }

    // Validar permisos: solo el editor que lo creó o un ADMIN
    if (userRole !== Role.ADMIN && article.editorId !== userId) {
      throw new ForbiddenException(
        "No tienes permisos para actualizar este artículo",
      );
    }

    // Validar slug único si se está cambiando
    if (updateArticleDto.slug && updateArticleDto.slug !== article.slug) {
      const existingArticle = await this.prisma.article.findUnique({
        where: { slug: updateArticleDto.slug },
      });

      if (existingArticle) {
        throw new BadRequestException("El slug del artículo ya existe");
      }
    }

    // Validar que el autor existe si se está cambiando
    if (
      updateArticleDto.authorId &&
      updateArticleDto.authorId !== article.authorId
    ) {
      const author = await this.prisma.author.findUnique({
        where: { id: updateArticleDto.authorId },
      });

      if (!author) {
        throw new NotFoundException("El autor especificado no existe");
      }
    }

    // Validar que la categoría existe si se está cambiando
    if (
      updateArticleDto.categoryId &&
      updateArticleDto.categoryId !== article.categoryId
    ) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateArticleDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException("La categoría especificada no existe");
      }
    }

    const oldSlug = article.slug;
    // Actualizar artículo
    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        ...updateArticleDto,
        // Si se cambia a PUBLISHED, establecer publishedAt
        publishedAt:
          updateArticleDto.status === PostStatus.PUBLISHED &&
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

    // Si cambió el slug, crear un redirect básico
    try {
      if (updateArticleDto.slug && updateArticleDto.slug !== oldSlug) {
        await (this.prisma as any).redirect?.create({
          data: {
            fromSlug: oldSlug,
            toSlug: updateArticleDto.slug,
            articleId: id,
          },
        });
      }
    } catch {
      // tabla redirect puede no existir en dev/tests
    }

    return this.formatArticleResponse(updatedArticle);
  }

  /**
   * Eliminar un artículo
   * Solo ADMIN o el editor que lo creó
   */
  async delete(id: string, userId: string, userRole: Role): Promise<void> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException("Artículo no encontrado");
    }

    // Validar permisos
    if (userRole !== Role.ADMIN && article.editorId !== userId) {
      throw new ForbiddenException(
        "No tienes permisos para eliminar este artículo",
      );
    }

    // Eliminar vistas primero (constraint de FK)
    await this.prisma.view.deleteMany({
      where: { articleId: id },
    });

    // Eliminar artículo
    await this.prisma.article.delete({
      where: { id },
    });
  }

  /**
   * Crear una categoría
   * Solo ADMIN
   */
  async createCategory(createCategoryDto: CreateCategoryDto, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        "Solo administradores pueden crear categorías",
      );
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
      throw new BadRequestException("La categoría ya existe");
    }

    return await this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  /**
   * Obtener todas las categorías
   */
  async findAllCategories() {
    return await this.prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  /**
   * Crear un autor
   * Solo ADMIN
   */
  async createAuthor(createAuthorDto: CreateAuthorDto, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException("Solo administradores pueden crear autores");
    }

    return await this.prisma.author.create({
      data: createAuthorDto,
    });
  }

  /**
   * Obtener todos los autores
   */
  async findAllAuthors() {
    return await this.prisma.author.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  /**
   * Crear un bloque de contenido para un artículo
   * Solo el editor o admin del artículo puede crear bloques
   */
  async createBlock(
    articleId: string,
    createBlockDto: CreateArticleBlockDto,
    userId: string,
    userRole: Role,
  ): Promise<ArticleBlockResponseDto> {
    // Validar que el artículo existe
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { editorId: true },
    });

    if (!article) {
      throw new NotFoundException("El artículo especificado no existe");
    }

    // Validar acceso: solo el editor o admin pueden crear bloques
    if (userRole !== Role.ADMIN && article.editorId !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para crear bloques en este artículo",
      );
    }

    // Obtener el siguiente número de orden
    const lastBlock = await this.prisma.articleBlock.findFirst({
      where: { articleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastBlock?.order ?? -1) + 1;

    // Crear el bloque
    const block = await this.prisma.articleBlock.create({
      data: {
        articleId,
        order: nextOrder,
        type: createBlockDto.type,
        content: createBlockDto.content,
        fontSize: createBlockDto.fontSize ?? 16,
        fontFamily: createBlockDto.fontFamily ?? FontFamily.ARIAL,
        textAlign: createBlockDto.textAlign ?? TextAlign.LEFT,
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

  /**
   * Crear múltiples bloques para un artículo
   */
  async createMultipleBlocks(
    articleId: string,
    createBlocksDto: CreateMultipleBlocksDto,
    userId: string,
    userRole: Role,
  ): Promise<ArticleBlockResponseDto[]> {
    // Validar acceso
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { editorId: true },
    });

    if (!article) {
      throw new NotFoundException("El artículo especificado no existe");
    }

    if (userRole !== Role.ADMIN && article.editorId !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para crear bloques en este artículo",
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const lastBlock = await tx.articleBlock.findFirst({
        where: { articleId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      let nextOrder = (lastBlock?.order ?? -1) + 1;
      const created: ArticleBlockResponseDto[] = [];
      for (const blockDto of createBlocksDto.blocks) {
        const block = await tx.articleBlock.create({
          data: {
            articleId,
            order: nextOrder,
            type: blockDto.type,
            content: blockDto.content,
            fontSize: blockDto.fontSize ?? 16,
            fontFamily: blockDto.fontFamily ?? FontFamily.ARIAL,
            textAlign: blockDto.textAlign ?? TextAlign.LEFT,
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

  /**
   * Obtener todos los bloques de un artículo
   */
  async getBlocksByArticle(
    articleId: string,
  ): Promise<ArticleBlockResponseDto[]> {
    // Validar que el artículo existe
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException("El artículo especificado no existe");
    }

    const blocks = await this.prisma.articleBlock.findMany({
      where: { articleId },
      orderBy: { order: "asc" },
    });

    return blocks.map((block) => this.formatBlockResponse(block));
  }

  /**
   * Búsqueda simple por título o contenido (contiene, case-insensitive)
   * Nota: Para producción, migrar a full-text con índices GIN/tsvector.
   */
  async searchArticles(query: string) {
    const q = `%${query}%`;
    const articles = await this.prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" as any } },
          { content: { contains: query, mode: "insensitive" as any } },
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

  /**
   * Obtener un bloque específico
   */
  async getBlock(blockId: string): Promise<ArticleBlockResponseDto> {
    const block = await this.prisma.articleBlock.findUnique({
      where: { id: blockId },
    });

    if (!block) {
      throw new NotFoundException("El bloque especificado no existe");
    }

    return this.formatBlockResponse(block);
  }

  /**
   * Actualizar un bloque
   */
  async updateBlock(
    blockId: string,
    updateBlockDto: UpdateArticleBlockDto,
    userId: string,
    userRole: Role,
  ): Promise<ArticleBlockResponseDto> {
    // Obtener el bloque y validar acceso
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
      throw new NotFoundException("El bloque especificado no existe");
    }

    if (userRole !== Role.ADMIN && block.article.editorId !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para actualizar este bloque",
      );
    }

    // Actualizar el bloque
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

  /**
   * Eliminar un bloque
   */
  async deleteBlock(
    blockId: string,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string }> {
    // Obtener el bloque y validar acceso
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
      throw new NotFoundException("El bloque especificado no existe");
    }

    if (userRole !== Role.ADMIN && block.article.editorId !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para eliminar este bloque",
      );
    }

    // Eliminar el bloque
    await this.prisma.articleBlock.delete({
      where: { id: blockId },
    });

    // Reordenar los bloques restantes
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

  /**
   * Reordenar bloques
   */
  async reorderBlocks(
    articleId: string,
    reorderDto: ReorderBlocksDto,
    userId: string,
    userRole: Role,
  ): Promise<ArticleBlockResponseDto[]> {
    // Validar acceso
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { editorId: true },
    });

    if (!article) {
      throw new NotFoundException("El artículo especificado no existe");
    }

    if (userRole !== Role.ADMIN && article.editorId !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para reordenar bloques en este artículo",
      );
    }

    // Reordenar bloques atomícamente
    return await this.prisma.$transaction(async (tx) => {
      // Paso 1: órdenes temporales
      for (let i = 0; i < reorderDto.blockIds.length; i++) {
        await tx.articleBlock.update({
          where: { id: reorderDto.blockIds[i] },
          data: { order: 10000 + i },
        });
      }

      const updatedBlocks: ArticleBlockResponseDto[] = [];
      // Paso 2: órdenes finales
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
          },
        });
        updatedBlocks.push(this.formatBlockResponse(block));
      }
      return updatedBlocks;
    });
  }

  /**
   * Obtener artículo con bloques (completo)
   */
  async getArticleWithBlocks(
    articleId: string,
    userRole?: Role,
    userId?: string,
  ): Promise<ArticleWithBlocksResponseDto> {
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
      throw new NotFoundException("El artículo especificado no existe");
    }

    // Validar visibilidad: USER solo ve artículos publicados
    if (userRole === Role.USER && article.status !== PostStatus.PUBLISHED) {
      throw new ForbiddenException("No tienes permiso para ver este artículo");
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

  /**
   * Generar PDF de un artículo con marca de agua
   */
  async generatePdf(
    articleId: string,
    includeWatermark: boolean = true,
    watermarkText: string = "Propiedad de Conozca",
  ): Promise<Readable> {
    // Obtener artículo con bloques
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
      throw new NotFoundException("El artículo especificado no existe");
    }

    // Generar PDF
    return this.pdfService.generateArticlePdf(
      {
        title: article.title,
        author: { name: article.author.name },
        createdAt: article.createdAt,
        blocks: article.blocks,
      },
      includeWatermark,
      watermarkText,
    );
  }

  /**
   * Formato privado para respuestas de artículos
   */
  private formatArticleResponse(article: any): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      status: article.status,
      author: {
        id: article.author.id,
        name: article.author.name,
        bio: article.author.bio,
        avatarUrl: article.author.avatarUrl,
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
      publishedAt: article.publishedAt,
    };
  }

  /**
   * Formato privado para respuestas de bloques
   */
  private formatBlockResponse(block: any): ArticleBlockResponseDto {
    return {
      id: block.id,
      articleId: block.articleId,
      order: block.order,
      type: block.type,
      content: block.content,
      fontSize: block.fontSize,
      fontFamily: block.fontFamily,
      textAlign: block.textAlign,
      textColor: block.textColor,
      backgroundColor: block.backgroundColor,
      isBold: block.isBold,
      isItalic: block.isItalic,
      isUnderline: block.isUnderline,
      isStrikethrough: block.isStrikethrough,
      listItemLevel: block.listItemLevel,
      imageUrl: block.imageUrl,
      imageAlt: block.imageAlt,
      imageWidth: block.imageWidth,
      imageHeight: block.imageHeight,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    };
  }
}
