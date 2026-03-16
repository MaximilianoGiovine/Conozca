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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const comment_service_1 = require("./comment.service");
const comment_dto_1 = require("./comment.dto");
const auth_guard_1 = require("../auth/auth.guard");
const optional_auth_guard_1 = require("../auth/optional-auth.guard");
let CommentController = class CommentController {
    commentService;
    constructor(commentService) {
        this.commentService = commentService;
    }
    async create(articleId, createCommentDto, req) {
        return this.commentService.create(articleId, req.user.sub, createCommentDto);
    }
    async findByArticle(articleId, includeUnapproved, req) {
        const isAdmin = req.user?.role === "ADMIN";
        const shouldIncludeUnapproved = includeUnapproved === "true" && isAdmin;
        return this.commentService.findByArticle(articleId, shouldIncludeUnapproved);
    }
    async findOne(id) {
        return this.commentService.findOne(id);
    }
    async update(id, updateCommentDto, req) {
        return this.commentService.update(id, req.user.sub, req.user.role, updateCommentDto);
    }
    async remove(id, req) {
        await this.commentService.remove(id, req.user.sub, req.user.role);
        return { message: "Comentario eliminado" };
    }
    async findPendingModeration(req) {
        if (req.user.role !== "ADMIN") {
            throw new Error("Acceso denegado");
        }
        return this.commentService.findPendingModeration();
    }
    async approve(id, req) {
        if (req.user.role !== "ADMIN") {
            throw new Error("Acceso denegado");
        }
        return this.commentService.approve(id);
    }
    async report(id) {
        return this.commentService.report(id);
    }
};
exports.CommentController = CommentController;
__decorate([
    (0, common_1.Post)("article/:articleId"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Crear un comentario en un artículo" }),
    (0, swagger_1.ApiParam)({ name: "articleId", description: "ID del artículo" }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Comentario creado",
        type: comment_dto_1.CommentResponseDto,
    }),
    __param(0, (0, common_1.Param)("articleId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("article/:articleId"),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Obtener comentarios de un artículo" }),
    (0, swagger_1.ApiParam)({ name: "articleId", description: "ID del artículo" }),
    (0, swagger_1.ApiQuery)({
        name: "includeUnapproved",
        required: false,
        description: "Incluir comentarios no aprobados (solo ADMIN)",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Lista de comentarios",
        type: [comment_dto_1.CommentResponseDto],
    }),
    __param(0, (0, common_1.Param)("articleId")),
    __param(1, (0, common_1.Query)("includeUnapproved")),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "findByArticle", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener un comentario por ID" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del comentario" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Comentario encontrado",
        type: comment_dto_1.CommentResponseDto,
    }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Actualizar un comentario" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del comentario" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Comentario actualizado",
        type: comment_dto_1.CommentResponseDto,
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_dto_1.UpdateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Eliminar un comentario" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del comentario" }),
    (0, swagger_1.ApiResponse)({ status: 204, description: "Comentario eliminado" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)("admin/pending"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Obtener comentarios pendientes de moderación (ADMIN)",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de comentarios pendientes" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "findPendingModeration", null);
__decorate([
    (0, common_1.Patch)(":id/approve"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Aprobar un comentario (ADMIN)" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del comentario" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Comentario aprobado",
        type: comment_dto_1.CommentResponseDto,
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(":id/report"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Reportar un comentario inapropiado" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del comentario" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Comentario reportado",
        type: comment_dto_1.CommentResponseDto,
    }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "report", null);
exports.CommentController = CommentController = __decorate([
    (0, swagger_1.ApiTags)("comments"),
    (0, common_1.Controller)("comments"),
    __metadata("design:paramtypes", [comment_service_1.CommentService])
], CommentController);
//# sourceMappingURL=comment.controller.js.map