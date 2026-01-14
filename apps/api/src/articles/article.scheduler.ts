import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma.service";
import { PostStatus } from "@conozca/database";

@Injectable()
export class ArticleScheduler {
  private readonly logger = new Logger(ArticleScheduler.name);
  constructor(private prisma: PrismaService) {}

  // Ejecuta cada minuto; procesa programaciones vencidas
  @Cron("*/1 * * * *")
  async handleSchedules() {
    try {
      const now = new Date();
      const due = await (this.prisma as any).articleSchedule?.findMany({
        where: { scheduledAt: { lte: now }, processedAt: null },
        take: 50,
      });
      if (!due || due.length === 0) return;

      for (const job of due) {
        if (job.action === "PUBLISH") {
          await this.prisma.article.update({
            where: { id: job.articleId },
            data: { status: PostStatus.PUBLISHED, publishedAt: new Date() },
          });
        } else if (job.action === "UNPUBLISH") {
          await this.prisma.article.update({
            where: { id: job.articleId },
            data: { status: PostStatus.DRAFT },
          });
        }
        await (this.prisma as any).articleSchedule?.update({
          where: { id: job.id },
          data: { processedAt: new Date() },
        });
      }
    } catch (e) {
      console.warn("Scheduler skipped (no table?):", e?.message || e);
    }
  }
}
