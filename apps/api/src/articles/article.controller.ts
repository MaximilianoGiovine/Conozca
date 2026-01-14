import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { ArticleService } from "./article.service";
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCategoryDto,
  CreateAuthorDto,
  CreateArticleBlockDto,
  UpdateArticleBlockDto,
  CreateMultipleBlocksDto,
  ReorderBlocksDto,
  ArticleResponseDto,
  ArticleListResponseDto,
} from "./article.dto";
import { AuthGuard } from "../auth/auth.guard";
import { OptionalAuthGuard } from "../auth/optional-auth.guard";
import { Role } from "@conozca/database";
import { AuditInterceptor } from "../common/audit.interceptor";
import * as seoService from "../common/seo.service";

/**
 * ArticleController
 *
 * Controlador para gestionar artículos
 * NOTA: Las rutas específicas (categories, authors) DEBEN estar antes de :slugOrId
 * Endpoints:
 * - GET /articles - Obtener artículos
 * - GET /articles/categories - Listar categorías
 * - GET /articles/authors - Listar autores
 * - GET /articles/:slugOrId - Obtener un artículo
 * - POST /articles - Crear artículo (requiere auth)
 * - PATCH /articles/:id - Actualizar artículo (requiere auth)
 * - DELETE /articles/:id - Eliminar artículo (requiere auth)
 */
@ApiTags("articles")
@Controller("articles")
export class ArticleController {
  constructor(
    private articleService: ArticleService,
    private seo: seoService.SeoService,
  ) {}

  // ===== Categorías (SPECIFIC ROUTES FIRST!) =====

  /**
   * POST /articles/categories
   * Crear una categoría
   * Requiere autenticación y rol ADMIN
   */
  @Post("categories")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: any,
  ) {
    return this.articleService.createCategory(createCategoryDto, req.user.role);
  }

  /**
   * GET /articles/categories
   * Obtener todas las categorías
   */
  @Get("categories")
  async findAllCategories() {
    return this.articleService.findAllCategories();
  }

  // ===== Autores =====

  /**
   * POST /articles/authors
   * Crear un autor
   * Requiere autenticación y rol ADMIN
   */
  @Post("authors")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
    @Request() req: any,
  ) {
    return this.articleService.createAuthor(createAuthorDto, req.user.role);
  }

  /**
   * GET /articles/authors
   * Obtener todos los autores
   */
  @Get("authors")
  async findAllAuthors() {
    return this.articleService.findAllAuthors();
  }

  // ===== Artículos (Generic routes last) =====

  /**
   * POST /articles
   * Crear un nuevo artículo
   * Requiere autenticación y rol EDITOR o ADMIN
   */
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 articles per hour
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req: any,
  ) {
    return this.articleService.create(
      createArticleDto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * GET /articles
   * Obtener todos los artículos con paginación
   * Parámetros de query:
   * - page: número de página (default: 1)
   * - pageSize: cantidad de artículos por página (default: 10)
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(
    @Query("page") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Request() req: any,
  ) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

    return this.articleService.findAll(
      pageNum,
      pageSizeNum,
      req.user?.role,
      req.user?.sub,
    );
  }

  /**
   * GET /articles/:slugOrId
   * Obtener un artículo por slug o ID
   * Registra una vista del artículo si el usuario está autenticado
   * NOTA: Esta ruta DEBE estar al final porque es genérica
   */
  @Get(":slugOrId")
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param("slugOrId") slugOrId: string, @Request() req: any) {
    return this.articleService.findOne(slugOrId, req.user?.role, req.user?.sub);
  }

  /**
   * PATCH /articles/:id
   * Actualizar un artículo
   * Requiere autenticación
   * Solo el editor que lo creó o un ADMIN pueden actualizar
   */
  @Patch(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async update(
    @Param("id") id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req: any,
  ) {
    return this.articleService.update(
      id,
      updateArticleDto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * DELETE /articles/:id
   * Eliminar un artículo
   * Requiere autenticación
   * Solo el editor que lo creó o un ADMIN pueden eliminar
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async delete(@Param("id") id: string, @Request() req: any) {
    return this.articleService.delete(id, req.user.sub, req.user.role);
  }

  // ===== ARTICLE BLOCKS =====

  /**
   * POST /articles/:articleId/blocks
   * Crear un bloque de contenido para un artículo
   * Requiere autenticación y ser editor del artículo o admin
   */
  @Post(":articleId/blocks")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async createBlock(
    @Param("articleId") articleId: string,
    @Body() createBlockDto: CreateArticleBlockDto,
    @Request() req: any,
  ) {
    return this.articleService.createBlock(
      articleId,
      createBlockDto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * POST /articles/:articleId/blocks/multiple
   * Crear múltiples bloques de contenido para un artículo
   * Requiere autenticación y ser editor del artículo o admin
   */
  @Post(":articleId/blocks/multiple")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async createMultipleBlocks(
    @Param("articleId") articleId: string,
    @Body() createBlocksDto: CreateMultipleBlocksDto,
    @Request() req: any,
  ) {
    return this.articleService.createMultipleBlocks(
      articleId,
      createBlocksDto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * GET /articles/:articleId/blocks
   * Obtener todos los bloques de un artículo ordenados
   */
  @Get(":articleId/blocks")
  async getBlocksByArticle(@Param("articleId") articleId: string) {
    return this.articleService.getBlocksByArticle(articleId);
  }

  /**
   * GET /articles/search?q=term
   * Búsqueda simple por título/contenido (case-insensitive)
   */
  @Get("search")
  async search(@Query("q") q: string) {
    if (!q || q.trim().length === 0) return [];
    return this.articleService.searchArticles(q.trim());
  }

  /**
   * GET /articles/:articleId/blocks/:blockId
   * Obtener un bloque específico
   */
  @Get(":articleId/blocks/:blockId")
  async getBlock(@Param("blockId") blockId: string) {
    return this.articleService.getBlock(blockId);
  }

  /**
   * PATCH /articles/:articleId/blocks/:blockId
   * Actualizar un bloque
   * Requiere autenticación y ser editor del artículo o admin
   */
  @Patch(":articleId/blocks/:blockId")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async updateBlock(
    @Param("blockId") blockId: string,
    @Body() updateBlockDto: UpdateArticleBlockDto,
    @Request() req: any,
  ) {
    return this.articleService.updateBlock(
      blockId,
      updateBlockDto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * DELETE /articles/:articleId/blocks/:blockId
   * Eliminar un bloque
   * Requiere autenticación y ser editor del artículo o admin
   */
  @Delete(":articleId/blocks/:blockId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async deleteBlock(@Param("blockId") blockId: string, @Request() req: any) {
    return this.articleService.deleteBlock(
      blockId,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * POST /articles/:articleId/blocks/reorder
   * Reordenar bloques de un artículo
   * Requiere autenticación y ser editor del artículo o admin
   */
  @Post(":articleId/blocks/reorder")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async reorderBlocks(
    @Param("articleId") articleId: string,
    @Body() reorderDto: ReorderBlocksDto,
    @Request() req: any,
  ) {
    return this.articleService.reorderBlocks(
      articleId,
      reorderDto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * GET /articles/:id/full
   * Obtener artículo completo con todos sus bloques
   * Requiere autenticación para artículos no publicados
   */
  @Get(":id/full")
  @UseGuards(AuthGuard)
  async getArticleWithBlocks(@Param("id") id: string, @Request() req: any) {
    return this.articleService.getArticleWithBlocks(
      id,
      req.user?.role,
      req.user?.sub,
    );
  }

  /**
   * GET /articles/:id/pdf
   * Descargar artículo en formato PDF con marca de agua
   * Query params:
   * - includeWatermark: incluir marca de agua (default: true)
   * - watermarkText: texto de marca de agua (default: "Propiedad de Conozca")
   */
  @Get(":id/pdf")
  async downloadPdf(
    @Param("id") id: string,
    @Query("includeWatermark") includeWatermark: string = "true",
    @Query("watermarkText") watermarkText: string = "Propiedad de Conozca",
    @Res() res: Response,
  ) {
    const includeWatermarkBool = includeWatermark === "true";

    const pdfStream = await this.articleService.generatePdf(
      id,
      includeWatermarkBool,
      watermarkText,
    );

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="article-${id}.pdf"`,
    );

    // Pipe del stream al response
    pdfStream.pipe(res);
  }

  /**
   * GET /articles/:id/seo
   * Devuelve metadatos SEO almacenados en memoria (fallback)
   */
  @Get(":id/seo")
  async getSeo(@Param("id") id: string) {
    return this.seo.getMeta(id) ?? {};
  }

  /**
   * PATCH /articles/:id/seo
   * Actualiza metadatos SEO (fallback en memoria)
   */
  @Patch(":id/seo")
  @UseGuards(AuthGuard)
  @UseInterceptors(AuditInterceptor)
  async setSeo(@Param("id") id: string, @Body() body: seoService.SeoMeta) {
    this.seo.setMeta(id, body || {});
    return { ok: true };
  }
}
