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
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    try {
      const now = new Date();

      const scheduleModel = (this.prisma as any).articleSchedule;

      if (!scheduleModel) return;

      const due = (await scheduleModel.findMany({
        where: { scheduledAt: { lte: now }, processedAt: null },
        take: 50,
      })) as { id: string; articleId: string; action: string }[];

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
        await scheduleModel.update({
          where: { id: job.id },
          data: { processedAt: new Date() },
        });
      }
    } catch (e) {
      console.warn("Scheduler skipped (no table?):", e?.message || e);
    }
  }
}
