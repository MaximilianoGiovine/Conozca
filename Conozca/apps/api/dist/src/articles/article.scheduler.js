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
var ArticleScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
const database_1 = require("@conozca/database");
let ArticleScheduler = ArticleScheduler_1 = class ArticleScheduler {
    prisma;
    logger = new common_1.Logger(ArticleScheduler_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleSchedules() {
        try {
            const now = new Date();
            const scheduleModel = this.prisma.articleSchedule;
            if (!scheduleModel)
                return;
            const due = (await scheduleModel.findMany({
                where: { scheduledFor: { lte: now }, processedAt: null },
                take: 50,
            }));
            if (!due || due.length === 0)
                return;
            for (const job of due) {
                if (job.action === "PUBLISH") {
                    await this.prisma.article.update({
                        where: { id: job.articleId },
                        data: { status: database_1.PostStatus.PUBLISHED, publishedAt: new Date() },
                    });
                }
                else if (job.action === "UNPUBLISH") {
                    await this.prisma.article.update({
                        where: { id: job.articleId },
                        data: { status: database_1.PostStatus.DRAFT },
                    });
                }
                await scheduleModel.update({
                    where: { id: job.id },
                    data: { processedAt: new Date() },
                });
            }
        }
        catch (e) {
            console.warn("Scheduler skipped (no table?):", e?.message || e);
        }
    }
};
exports.ArticleScheduler = ArticleScheduler;
__decorate([
    (0, schedule_1.Cron)("*/1 * * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticleScheduler.prototype, "handleSchedules", null);
exports.ArticleScheduler = ArticleScheduler = ArticleScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArticleScheduler);
//# sourceMappingURL=article.scheduler.js.map