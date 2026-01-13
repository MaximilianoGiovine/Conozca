import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './comment.dto';
import { LoggerService } from '../common/logger.service';

/**
 * Service para gestión de comentarios
 */
@Injectable()
export class CommentService {
  private logger = new LoggerService('CommentService');

  constructor(private prisma: PrismaService) {}

  /**
   * Crear un comentario en un artículo
   */
  async create(
    articleId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    // Verificar que el artículo existe
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Artículo no encontrado');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        articleId,
        userId,
        isApproved: false, // Por defecto requiere aprobación
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.logBusinessEvent('comment_created', {
      commentId: comment.id,
      articleId,
      userId,
    });

    return comment;
  }

  /**
   * Obtener comentarios de un artículo (solo aprobados para usuarios normales)
   */
  async findByArticle(articleId: string, includeUnapproved: boolean = false) {
    const whereClause: any = { articleId };

    if (!includeUnapproved) {
      whereClause.isApproved = true;
    }

    return this.prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtener un comentario por ID
   */
  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comment;
  }

  /**
   * Actualizar un comentario
   */
  async update(
    id: string,
    userId: string,
    userRole: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    // Solo el autor puede editar contenido, solo ADMIN puede cambiar estados
    if (updateCommentDto.content && comment.userId !== userId) {
      throw new ForbiddenException('No puedes editar el comentario de otro usuario');
    }

    if (
      (updateCommentDto.isApproved !== undefined || updateCommentDto.isReported !== undefined) &&
      userRole !== 'ADMIN'
    ) {
      throw new ForbiddenException('Solo los administradores pueden moderar comentarios');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.logBusinessEvent('comment_updated', {
      commentId: id,
      userId,
      userRole,
    });

    return updatedComment;
  }

  /**
   * Eliminar un comentario
   */
  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    // Solo el autor o ADMIN pueden eliminar
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('No puedes eliminar el comentario de otro usuario');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    this.logger.logBusinessEvent('comment_deleted', {
      commentId: id,
      userId,
      userRole,
    });
  }

  /**
   * Obtener todos los comentarios pendientes de moderación (ADMIN)
   */
  async findPendingModeration() {
    return this.prisma.comment.findMany({
      where: {
        OR: [{ isApproved: false }, { isReported: true }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Aprobar un comentario (ADMIN)
   */
  async approve(id: string): Promise<CommentResponseDto> {
    return this.update(id, '', 'ADMIN', { isApproved: true, isReported: false });
  }

  /**
   * Reportar un comentario
   */
  async report(id: string): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { isReported: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.logBusinessEvent('comment_reported', { commentId: id });

    return updated;
  }
}
