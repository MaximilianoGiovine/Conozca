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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const logger_service_1 = require("../common/logger.service");
let CommentService = class CommentService {
    prisma;
    logger = new logger_service_1.LoggerService("CommentService");
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(articleId, userId, createCommentDto) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
        });
        if (!article) {
            throw new common_1.NotFoundException("Artículo no encontrado");
        }
        const comment = await this.prisma.comment.create({
            data: {
                content: createCommentDto.content,
                articleId,
                userId,
                isApproved: false,
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
        this.logger.logBusinessEvent("comment_created", {
            commentId: comment.id,
            articleId,
            userId,
        });
        return comment;
    }
    async findByArticle(articleId, includeUnapproved = false) {
        const whereClause = {
            articleId,
        };
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
                createdAt: "desc",
            },
        });
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException("Comentario no encontrado");
        }
        return comment;
    }
    async update(id, userId, userRole, updateCommentDto) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            throw new common_1.NotFoundException("Comentario no encontrado");
        }
        if (updateCommentDto.content && comment.userId !== userId) {
            throw new common_1.ForbiddenException("No puedes editar el comentario de otro usuario");
        }
        if ((updateCommentDto.isApproved !== undefined ||
            updateCommentDto.isReported !== undefined) &&
            userRole !== "ADMIN") {
            throw new common_1.ForbiddenException("Solo los administradores pueden moderar comentarios");
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
        this.logger.logBusinessEvent("comment_updated", {
            commentId: id,
            userId,
            userRole,
        });
        return updatedComment;
    }
    async remove(id, userId, userRole) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            throw new common_1.NotFoundException("Comentario no encontrado");
        }
        if (comment.userId !== userId && userRole !== "ADMIN") {
            throw new common_1.ForbiddenException("No puedes eliminar el comentario de otro usuario");
        }
        await this.prisma.comment.delete({
            where: { id },
        });
        this.logger.logBusinessEvent("comment_deleted", {
            commentId: id,
            userId,
            userRole,
        });
    }
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
                createdAt: "desc",
            },
        });
    }
    async approve(id) {
        return this.update(id, "", "ADMIN", {
            isApproved: true,
            isReported: false,
        });
    }
    async report(id) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            throw new common_1.NotFoundException("Comentario no encontrado");
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
        this.logger.logBusinessEvent("comment_reported", { commentId: id });
        return updated;
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentService);
//# sourceMappingURL=comment.service.js.map