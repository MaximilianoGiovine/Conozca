import { Test } from "@nestjs/testing";
import { ArticleService } from "./article.service";
import { PrismaService } from "../prisma.service";
import { PdfService } from "./pdf.service";
import { Role, PostStatus } from "@conozca/database";

describe("ArticleService redirects on slug change", () => {
  let service: ArticleService;
  const prisma = {
    article: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    view: { deleteMany: jest.fn() },
  } as any as PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    (prisma as any).redirect = { create: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: PrismaService, useValue: prisma },
        { provide: PdfService, useValue: {} },
      ],
    }).compile();

    service = module.get(ArticleService);
  });

  it("creates redirect when slug changes", async () => {
    const id = "a1";
    const old = {
      id,
      slug: "old-slug",
      authorId: "au",
      categoryId: "c",
      editorId: "e",
      publishedAt: null,
    };
    const updated = {
      ...old,
      slug: "new-slug",
      author: { id: "au", name: "A" },
      category: { id: "c", name: "C", slug: "cat" },
      editor: { id: "e", email: "e@e", name: "E", role: Role.EDITOR },
      views: [],
      title: "t",
      content: "x".repeat(50),
      status: PostStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 1st findUnique: current article by id
    (prisma.article.findUnique as any)
      .mockResolvedValueOnce(old) // for current by id
      .mockResolvedValueOnce(null); // for unique slug check

    (prisma.article.update as any).mockResolvedValue(updated);

    const res = await service.update(
      id,
      { slug: "new-slug" } as any,
      "e",
      Role.ADMIN,
    );

    expect(res.slug).toBe("new-slug");
    expect((prisma as any).redirect.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromSlug: "old-slug",
          toSlug: "new-slug",
          articleId: id,
        }),
      }),
    );
  });
});
