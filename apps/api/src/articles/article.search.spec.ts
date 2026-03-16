import { Test } from "@nestjs/testing";
import { ArticleService } from "./article.service";
import { PrismaService } from "../prisma.service";
import { PdfService } from "./pdf.service";

describe("ArticleService search", () => {
  let service: ArticleService;
  const prisma = { article: { findMany: jest.fn() } } as any as PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: PrismaService, useValue: prisma },
        { provide: PdfService, useValue: {} },
      ],
    }).compile();
    service = module.get(ArticleService);
    (prisma.article.findMany as any).mockResolvedValue([]);
  });

  it("builds OR contains filters", async () => {
    await service.searchArticles("hola");
    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });
});
