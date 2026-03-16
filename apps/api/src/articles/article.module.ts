import { Module } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { ArticleController } from "./article.controller";
import { PrismaService } from "../prisma.service";
import { PdfService } from "./pdf.service";
import { SeoService } from "../common/seo.service";
import { ArticleScheduler } from "./article.scheduler";
import { AuditInterceptor } from "../common/audit.interceptor";
import { AuditLogService } from "../common/audit-log.service";

/**
 * ArticleModule
 *
 * Módulo para la gestión de artículos
 * Incluye: servicio, controlador y dependencias
 */
@Module({
  controllers: [ArticleController],
  providers: [
    ArticleService,
    PrismaService,
    PdfService,
    SeoService,
    ArticleScheduler,
    AuditInterceptor,
    AuditLogService,
  ],
  exports: [ArticleService],
})
export class ArticleModule {}
