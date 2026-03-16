"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleModule = void 0;
const common_1 = require("@nestjs/common");
const article_service_1 = require("./article.service");
const article_controller_1 = require("./article.controller");
const prisma_service_1 = require("../prisma.service");
const pdf_service_1 = require("./pdf.service");
const seo_service_1 = require("../common/seo.service");
const article_scheduler_1 = require("./article.scheduler");
const audit_interceptor_1 = require("../common/audit.interceptor");
const audit_log_service_1 = require("../common/audit-log.service");
let ArticleModule = class ArticleModule {
};
exports.ArticleModule = ArticleModule;
exports.ArticleModule = ArticleModule = __decorate([
    (0, common_1.Module)({
        controllers: [article_controller_1.ArticleController],
        providers: [
            article_service_1.ArticleService,
            prisma_service_1.PrismaService,
            pdf_service_1.PdfService,
            seo_service_1.SeoService,
            article_scheduler_1.ArticleScheduler,
            audit_interceptor_1.AuditInterceptor,
            audit_log_service_1.AuditLogService,
        ],
        exports: [article_service_1.ArticleService],
    })
], ArticleModule);
//# sourceMappingURL=article.module.js.map