import { Test, TestingModule } from "@nestjs/testing";
import { ArticleService } from "./article.service";
import { PrismaService } from "../prisma.service";
import { PdfService } from "./pdf.service";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import {
  Role,
  PostStatus,
  BlockType,
  FontFamily,
  TextAlign,
} from "@conozca/database";

describe("ArticleService - Blocks", () => {
  let service: ArticleService;
  let prismaService: PrismaService;

  const mockArticleId = "1";
  const mockBlockId = "block-1";
  const mockUserId = "user-1";
  const mockEditorId = "editor-1";

  const mockArticle = {
    id: mockArticleId,
    title: "Test Article",
    slug: "test-article",
    content: "Test content",
    excerpt: "Test excerpt",
    featuredImage: null,
    status: PostStatus.DRAFT,
    authorId: "1",
    editorId: mockEditorId,
    categoryId: "1",
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
  };

  const mockBlock = {
    id: mockBlockId,
    articleId: mockArticleId,
    order: 0,
    type: BlockType.PARAGRAPH,
    content: "Test paragraph content",
    fontSize: 16,
    fontFamily: FontFamily.ARIAL,
    textAlign: TextAlign.LEFT,
    textColor: "#000000",
    backgroundColor: null,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    listItemLevel: 0,
    imageUrl: null,
    imageAlt: null,
    imageWidth: null,
    imageHeight: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const articleBlockMock = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(async (fn) =>
              fn({ articleBlock: articleBlockMock }),
            ),
            article: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            articleBlock: articleBlockMock,
          },
        },
        {
          provide: PdfService,
          useValue: {
            generateArticlePdf: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe("createBlock", () => {
    it("should create a block for an article when user is editor", async () => {
      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "Test content",
        fontSize: 16,
        fontFamily: FontFamily.ARIAL,
        textAlign: TextAlign.LEFT,
        textColor: "#000000",
      };

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue({ ...mockArticle, editorId: mockUserId });

      jest
        .spyOn((prismaService as any).articleBlock, "findFirst")
        .mockResolvedValue(null);

      jest
        .spyOn((prismaService as any).articleBlock, "create")
        .mockResolvedValue(mockBlock);

      const result = await service.createBlock(
        mockArticleId,
        createBlockDto,
        mockUserId,
        Role.EDITOR,
      );

      expect(result.id).toBe(mockBlockId);
      expect(result.type).toBe(BlockType.PARAGRAPH);
      expect(result.content).toBe("Test paragraph content"); // Devuelve el mock mockBlock
    });

    it("should throw ForbiddenException if user is not editor of article", async () => {
      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "Test content",
      };

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue(mockArticle);

      await expect(
        service.createBlock(
          mockArticleId,
          createBlockDto,
          "different-user",
          Role.USER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if article does not exist", async () => {
      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "Test content",
      };

      jest.spyOn(prismaService.article, "findUnique").mockResolvedValue(null);

      await expect(
        service.createBlock(
          "non-existent-id",
          createBlockDto,
          mockUserId,
          Role.EDITOR,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should set correct order for new block", async () => {
      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "Test content",
      };

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue({ ...mockArticle, editorId: mockUserId });

      jest
        .spyOn((prismaService as any).articleBlock, "findFirst")
        .mockResolvedValue({ order: 2 } as any);

      jest
        .spyOn((prismaService as any).articleBlock, "create")
        .mockResolvedValue({
          ...mockBlock,
          order: 3,
        });

      const result = await service.createBlock(
        mockArticleId,
        createBlockDto,
        mockUserId,
        Role.EDITOR,
      );

      expect(result.order).toBe(3);
    });
  });

  describe("getBlocksByArticle", () => {
    it("should return all blocks for an article ordered by order", async () => {
      const blocks = [
        { ...mockBlock, order: 0 },
        { ...mockBlock, order: 1, id: "block-2" },
        { ...mockBlock, order: 2, id: "block-3" },
      ];

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue(mockArticle);

      jest
        .spyOn((prismaService as any).articleBlock, "findMany")
        .mockResolvedValue(blocks);

      const result = await service.getBlocksByArticle(mockArticleId);

      expect(result).toHaveLength(3);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[2].order).toBe(2);
    });

    it("should throw NotFoundException if article does not exist", async () => {
      jest.spyOn(prismaService.article, "findUnique").mockResolvedValue(null);

      await expect(
        service.getBlocksByArticle("non-existent-id"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateBlock", () => {
    it("should update a block when user is editor", async () => {
      const updateBlockDto = {
        content: "Updated content",
        isBold: true,
      };

      jest
        .spyOn((prismaService as any).articleBlock, "findUnique")
        .mockResolvedValue({
          ...mockBlock,
          article: { editorId: mockUserId },
        });

      jest
        .spyOn((prismaService as any).articleBlock, "update")
        .mockResolvedValue({
          ...mockBlock,
          content: "Updated content",
          isBold: true,
        });

      const result = await service.updateBlock(
        mockBlockId,
        updateBlockDto,
        mockUserId,
        Role.EDITOR,
      );

      expect(result.content).toBe("Updated content");
      expect(result.isBold).toBe(true);
    });

    it("should throw ForbiddenException if user is not editor", async () => {
      const updateBlockDto = {
        content: "Updated content",
      };

      jest
        .spyOn((prismaService as any).articleBlock, "findUnique")
        .mockResolvedValue({
          ...mockBlock,
          article: { editorId: mockEditorId },
        });

      await expect(
        service.updateBlock(
          mockBlockId,
          updateBlockDto,
          "different-user",
          Role.USER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if block does not exist", async () => {
      const updateBlockDto = {
        content: "Updated content",
      };

      jest
        .spyOn((prismaService as any).articleBlock, "findUnique")
        .mockResolvedValue(null);

      await expect(
        service.updateBlock(
          "non-existent-id",
          updateBlockDto,
          mockUserId,
          Role.EDITOR,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteBlock", () => {
    it("should delete a block and reorder remaining blocks", async () => {
      const remainingBlocks = [
        { id: "block-2", order: 1 },
        { id: "block-3", order: 2 },
      ];

      jest
        .spyOn((prismaService as any).articleBlock, "findUnique")
        .mockResolvedValue({
          ...mockBlock,
          order: 0,
          article: { editorId: mockUserId },
        });

      jest
        .spyOn((prismaService as any).articleBlock, "delete")
        .mockResolvedValue(mockBlock);

      jest
        .spyOn((prismaService as any).articleBlock, "findMany")
        .mockResolvedValue(remainingBlocks as any);

      jest
        .spyOn((prismaService as any).articleBlock, "update")
        .mockResolvedValue(mockBlock);

      const result = await service.deleteBlock(
        mockBlockId,
        mockUserId,
        Role.EDITOR,
      );

      expect(result.message).toBe("Bloque eliminado correctamente");
    });

    it("should throw ForbiddenException if user is not editor", async () => {
      jest
        .spyOn((prismaService as any).articleBlock, "findUnique")
        .mockResolvedValue({
          ...mockBlock,
          article: { editorId: mockEditorId },
        });

      await expect(
        service.deleteBlock(mockBlockId, "different-user", Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if block does not exist", async () => {
      jest
        .spyOn((prismaService as any).articleBlock, "findUnique")
        .mockResolvedValue(null);

      await expect(
        service.deleteBlock("non-existent-id", mockUserId, Role.EDITOR),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("reorderBlocks", () => {
    it("should reorder blocks correctly", async () => {
      const reorderDto = {
        blockIds: ["block-2", "block-1", "block-3"],
      };

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue({ ...mockArticle, editorId: mockUserId });

      jest
        .spyOn((prismaService as any).articleBlock, "update")
        .mockImplementation(async ({ where, data }) => {
          const blockIndex = reorderDto.blockIds.indexOf(where.id);
          return {
            ...mockBlock,
            id: where.id,
            order: blockIndex,
          };
        });

      const result = await service.reorderBlocks(
        mockArticleId,
        reorderDto,
        mockUserId,
        Role.EDITOR,
      );

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("block-2");
      expect(result[0].order).toBe(0);
      expect(result[1].id).toBe("block-1");
      expect(result[1].order).toBe(1);
    });

    it("should throw ForbiddenException if user is not editor", async () => {
      const reorderDto = {
        blockIds: ["block-1", "block-2"],
      };

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue(mockArticle);

      await expect(
        service.reorderBlocks(
          mockArticleId,
          reorderDto,
          "different-user",
          Role.USER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if article does not exist", async () => {
      const reorderDto = {
        blockIds: ["block-1", "block-2"],
      };

      jest.spyOn(prismaService.article, "findUnique").mockResolvedValue(null);

      await expect(
        service.reorderBlocks(
          "non-existent-id",
          reorderDto,
          mockUserId,
          Role.EDITOR,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getArticleWithBlocks", () => {
    it("should return article with all blocks", async () => {
      const mockArticleWithBlocks = {
        ...mockArticle,
        author: {
          id: "1",
          name: "Test Author",
          bio: "Test bio",
          avatarUrl: null,
        },
        editor: {
          id: mockEditorId,
          email: "editor@test.com",
          name: "Editor Name",
        },
        category: {
          id: "1",
          name: "Test Category",
          slug: "test-category",
        },
        blocks: [mockBlock],
        views: [],
      };

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue(mockArticleWithBlocks);

      const result = await service.getArticleWithBlocks(mockArticleId);

      expect(result.id).toBe(mockArticleId);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].type).toBe(BlockType.PARAGRAPH);
    });

    it("should throw NotFoundException if article does not exist", async () => {
      jest.spyOn(prismaService.article, "findUnique").mockResolvedValue(null);

      await expect(service.getArticleWithBlocks(mockArticleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should prevent USER from viewing unpublished articles", async () => {
      const unpublishedArticle = {
        ...mockArticle,
        status: PostStatus.DRAFT,
        author: { id: "1", name: "Author", bio: null, avatarUrl: null },
        editor: { id: mockEditorId, email: "editor@test.com", name: "Editor" },
        category: { id: "1", name: "Category", slug: "category" },
        blocks: [],
        views: [],
      };

      jest
        .spyOn(prismaService.article, "findUnique")
        .mockResolvedValue(unpublishedArticle);

      await expect(
        service.getArticleWithBlocks(mockArticleId, Role.USER, "user-1"),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
