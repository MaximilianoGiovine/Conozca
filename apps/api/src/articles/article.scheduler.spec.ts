import { ArticleScheduler } from './article.scheduler';
import { PrismaService } from '../prisma.service';
import { PostStatus } from '@conozca/database';

describe('ArticleScheduler', () => {
  it('processes due publish/unpublish jobs', async () => {
    const prisma = {
      article: {
        update: jest.fn(),
      },
    } as any as PrismaService;
    (prisma as any).articleSchedule = {
      findMany: jest.fn().mockResolvedValue([
        { id: 'j1', articleId: 'a1', action: 'PUBLISH', scheduledAt: new Date(), processedAt: null },
        { id: 'j2', articleId: 'a2', action: 'UNPUBLISH', scheduledAt: new Date(), processedAt: null },
      ]),
      update: jest.fn(),
    };

    const sched = new ArticleScheduler(prisma);
    await sched.handleSchedules();

    expect(prisma.article.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: expect.objectContaining({ status: PostStatus.PUBLISHED }),
    });
    expect(prisma.article.update).toHaveBeenCalledWith({
      where: { id: 'a2' },
      data: expect.objectContaining({ status: PostStatus.DRAFT }),
    });
    expect((prisma as any).articleSchedule.update).toHaveBeenCalledTimes(2);
  });
});
