"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const article_service_1 = require("./article.service");
const article_dto_1 = require("./article.dto");
const auth_guard_1 = require("../auth/auth.guard");
const optional_auth_guard_1 = require("../auth/optional-auth.guard");
const audit_interceptor_1 = require("../common/audit.interceptor");
const seoService = __importStar(require("../common/seo.service"));
let ArticleController = class ArticleController {
    articleService;
    seo;
    constructor(articleService, seo) {
        this.articleService = articleService;
        this.seo = seo;
    }
    async createCategory(createCategoryDto, req) {
        return this.articleService.createCategory(createCategoryDto, req.user.role);
    }
    async findAllCategories() {
        return this.articleService.findAllCategories();
    }
    async createAuthor(createAuthorDto, req) {
        return this.articleService.createAuthor(createAuthorDto, req.user.role);
    }
    async findAllAuthors() {
        return this.articleService.findAllAuthors();
    }
    async create(createArticleDto, req) {
        return this.articleService.create(createArticleDto, req.user.sub, req.user.role);
    }
    async findAll(page = "1", pageSize = "10", req) {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 10));
        return this.articleService.findAll(pageNum, pageSizeNum, req.user?.role, req.user?.sub);
    }
    async findOne(slugOrId, req) {
        return this.articleService.findOne(slugOrId, req.user?.role, req.user?.sub);
    }
    async update(id, updateArticleDto, req) {
        return this.articleService.update(id, updateArticleDto, req.user.sub, req.user.role);
    }
    async delete(id, req) {
        return this.articleService.delete(id, req.user.sub, req.user.role);
    }
    async createBlock(articleId, createBlockDto, req) {
        return this.articleService.createBlock(articleId, createBlockDto, req.user.sub, req.user.role);
    }
    async createMultipleBlocks(articleId, createBlocksDto, req) {
        return this.articleService.createMultipleBlocks(articleId, createBlocksDto, req.user.sub, req.user.role);
    }
    async getBlocksByArticle(articleId) {
        return this.articleService.getBlocksByArticle(articleId);
    }
    async search(q) {
        if (!q || q.trim().length === 0)
            return [];
        return this.articleService.searchArticles(q.trim());
    }
    async getBlock(blockId) {
        return this.articleService.getBlock(blockId);
    }
    async updateBlock(blockId, updateBlockDto, req) {
        return this.articleService.updateBlock(blockId, updateBlockDto, req.user.sub, req.user.role);
    }
    async deleteBlock(blockId, req) {
        return this.articleService.deleteBlock(blockId, req.user.sub, req.user.role);
    }
    async reorderBlocks(articleId, reorderDto, req) {
        return this.articleService.reorderBlocks(articleId, reorderDto, req.user.sub, req.user.role);
    }
    async getArticleWithBlocks(id, req) {
        return this.articleService.getArticleWithBlocks(id, req.user?.role, req.user?.sub);
    }
    async downloadPdf(id, includeWatermark = "true", watermarkText = "Propiedad de Conozca", res) {
        const includeWatermarkBool = includeWatermark === "true";
        const pdfStream = await this.articleService.generatePdf(id, includeWatermarkBool, watermarkText);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="article-${id}.pdf"`);
        pdfStream.pipe(res);
    }
    getSeo(id) {
        return this.seo.getMeta(id) ?? {};
    }
    setSeo(id, body) {
        this.seo.setMeta(id, body || {});
        return { ok: true };
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Post)("categories"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [article_dto_1.CreateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)("categories"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Post)("authors"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [article_dto_1.CreateAuthorDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createAuthor", null);
__decorate([
    (0, common_1.Get)("authors"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findAllAuthors", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 3600000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [article_dto_1.CreateArticleDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("pageSize")),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":slugOrId"),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Param)("slugOrId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, article_dto_1.UpdateArticleDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(":articleId/blocks"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("articleId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, article_dto_1.CreateArticleBlockDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createBlock", null);
__decorate([
    (0, common_1.Post)(":articleId/blocks/multiple"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("articleId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, article_dto_1.CreateMultipleBlocksDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createMultipleBlocks", null);
__decorate([
    (0, common_1.Get)(":articleId/blocks"),
    __param(0, (0, common_1.Param)("articleId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getBlocksByArticle", null);
__decorate([
    (0, common_1.Get)("search"),
    __param(0, (0, common_1.Query)("q")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(":articleId/blocks/:blockId"),
    __param(0, (0, common_1.Param)("blockId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getBlock", null);
__decorate([
    (0, common_1.Patch)(":articleId/blocks/:blockId"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("blockId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, article_dto_1.UpdateArticleBlockDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "updateBlock", null);
__decorate([
    (0, common_1.Delete)(":articleId/blocks/:blockId"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("blockId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "deleteBlock", null);
__decorate([
    (0, common_1.Post)(":articleId/blocks/reorder"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("articleId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, article_dto_1.ReorderBlocksDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "reorderBlocks", null);
__decorate([
    (0, common_1.Get)(":id/full"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getArticleWithBlocks", null);
__decorate([
    (0, common_1.Get)(":id/pdf"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("includeWatermark")),
    __param(2, (0, common_1.Query)("watermarkText")),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Get)(":id/seo"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArticleController.prototype, "getSeo", null);
__decorate([
    (0, common_1.Patch)(":id/seo"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ArticleController.prototype, "setSeo", null);
exports.ArticleController = ArticleController = __decorate([
    (0, swagger_1.ApiTags)("articles"),
    (0, common_1.Controller)("articles"),
    __metadata("design:paramtypes", [article_service_1.ArticleService, seoService.SeoService])
], ArticleController);
//# sourceMappingURL=article.controller.js.map