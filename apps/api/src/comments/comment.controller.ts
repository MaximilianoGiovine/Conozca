import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './comment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';

/**
 * Controller para gestión de comentarios
 */
@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  /**
   * Crear un comentario en un artículo
   */
  @Post('article/:articleId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un comentario en un artículo' })
  @ApiParam({ name: 'articleId', description: 'ID del artículo' })
  @ApiResponse({ status: 201, description: 'Comentario creado', type: CommentResponseDto })
  async create(
    @Param('articleId') articleId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentService.create(articleId, req.user.sub, createCommentDto);
  }

  /**
   * Obtener comentarios de un artículo
   */
  @Get('article/:articleId')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Obtener comentarios de un artículo' })
  @ApiParam({ name: 'articleId', description: 'ID del artículo' })
  @ApiQuery({
    name: 'includeUnapproved',
    required: false,
    description: 'Incluir comentarios no aprobados (solo ADMIN)',
  })
  @ApiResponse({ status: 200, description: 'Lista de comentarios', type: [CommentResponseDto] })
  async findByArticle(
    @Param('articleId') articleId: string,
    @Query('includeUnapproved') includeUnapproved: string,
    @Request() req,
  ) {
    const isAdmin = req.user?.role === 'ADMIN';
    const shouldIncludeUnapproved = includeUnapproved === 'true' && isAdmin;

    return this.commentService.findByArticle(articleId, shouldIncludeUnapproved);
  }

  /**
   * Obtener un comentario por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un comentario por ID' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario encontrado', type: CommentResponseDto })
  async findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  /**
   * Actualizar un comentario
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario actualizado', type: CommentResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentService.update(id, req.user.sub, req.user.role, updateCommentDto);
  }

  /**
   * Eliminar un comentario
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 204, description: 'Comentario eliminado' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.commentService.remove(id, req.user.sub, req.user.role);
    return { message: 'Comentario eliminado' };
  }

  /**
   * Obtener comentarios pendientes de moderación (ADMIN)
   */
  @Get('admin/pending')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener comentarios pendientes de moderación (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios pendientes' })
  async findPendingModeration(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Acceso denegado');
    }
    return this.commentService.findPendingModeration();
  }

  /**
   * Aprobar un comentario (ADMIN)
   */
  @Patch(':id/approve')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprobar un comentario (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario aprobado', type: CommentResponseDto })
  async approve(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Acceso denegado');
    }
    return this.commentService.approve(id);
  }

  /**
   * Reportar un comentario
   */
  @Patch(':id/report')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reportar un comentario inapropiado' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario reportado', type: CommentResponseDto })
  async report(@Param('id') id: string) {
    return this.commentService.report(id);
  }
}
