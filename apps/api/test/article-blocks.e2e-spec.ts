import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import {
  Role,
  PostStatus,
  BlockType,
  FontFamily,
  TextAlign,
} from "@conozca/database";
import { PrismaService } from "../src/prisma.service";

describe("Articles Blocks E2E", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  let authToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let authorId: string;
  let articleId: string;
  let categoryId: string;
  let blockId: string;

  const makeEmail = (prefix: string) => `${prefix}-${Date.now()}@test.com`;
  const editorEmail = makeEmail("editor");
  const adminEmail = makeEmail("admin");

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Get or create editor user
    const existingUser = await prismaService.user
      .findUnique({
        where: { email: editorEmail },
      })
      .catch(() => null);

    if (!existingUser) {
      const editorResponse = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: editorEmail,
          password: "Test123!",
          name: "Test Editor",
        });

      if (editorResponse.status !== 201) {
        throw new Error(`Failed to register editor: ${editorResponse.status}`);
      }

      userId = editorResponse.body.user.id;
      authToken = editorResponse.body.access_token;
    } else {
      userId = existingUser.id;
    }

    // Ensure user has EDITOR role
    await prismaService.user.update({
      where: { id: userId },
      data: { role: Role.EDITOR },
    });

    // Always login to get fresh token with new role
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: editorEmail, password: "Test123!" });

    if (![200, 201].includes(loginResponse.status)) {
      throw new Error(
        `Failed to login: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`,
      );
    }
    authToken = loginResponse.body.access_token;

    // Create test category (skip if exists)
    let category = await prismaService.category.findFirst({
      where: { slug: { startsWith: "test-category" } },
    });

    if (!category) {
      category = await prismaService.category.create({
        data: {
          name: `Test Category ${Date.now()}`,
          slug: `test-category-${Date.now()}`,
        },
      });
    }
    categoryId = category.id;

    // Create test author (skip if exists)
    let author = await prismaService.author.findFirst({
      where: { name: { contains: "Test Author" } },
    });

    if (!author) {
      author = await prismaService.author.create({
        data: {
          name: `Test Author ${Date.now()}`,
          bio: "Test bio",
        },
      });
    }
    authorId = author.id;

    // Debug: decode token to see what's inside
    const tokenParts = authToken.split(".");
    if (tokenParts.length === 3) {
      try {
        const decodedPayload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString(),
        );
        // Token contains: email, sub (userId), role
      } catch (e) {
        // Could not decode token
      }
    }

    // Create test article
    const createArticleRes = await request(app.getHttpServer())
      .post("/articles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: `Test Article for Blocks ${Date.now()}`,
        slug: `test-article-blocks-${Date.now()}`,
        content: "Test content for article blocks",
        excerpt: "Test excerpt",
        authorId,
        editorId: userId,
        categoryId,
        status: PostStatus.DRAFT,
      });

    if (createArticleRes.status !== 201) {
      throw new Error(`Failed to create article: ${createArticleRes.status}`);
    }

    expect(createArticleRes.status).toBe(201);
    articleId = createArticleRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /articles/:articleId/blocks - Create Block", () => {
    it("should create a block successfully", async () => {
      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "This is a test paragraph",
        fontSize: 16,
        fontFamily: FontFamily.ARIAL,
        textAlign: TextAlign.LEFT,
        textColor: "#000000",
        isBold: false,
        isItalic: false,
      };

      const response = await request(app.getHttpServer())
        .post(`/articles/${articleId}/blocks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(createBlockDto);

      expect(response.status).toBe(201);
      expect(response.body.type).toBe(BlockType.PARAGRAPH);
      expect(response.body.content).toBe("This is a test paragraph");
      expect(response.body.order).toBe(0);

      blockId = response.body.id;
    });

    it("should return 401 without authentication", async () => {
      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "Test content",
      };

      const response = await request(app.getHttpServer())
        .post(`/articles/${articleId}/blocks`)
        .send(createBlockDto);

      expect(response.status).toBe(401);
    });

    it("should return 403 if user is not editor of article", async () => {
      const otherUserToken = (
        await request(app.getHttpServer())
          .post("/auth/register")
          .send({
            email: makeEmail("other"),
            password: "Test123!",
            name: "Other User",
          })
      ).body.access_token;

      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "Test content",
      };

      const response = await request(app.getHttpServer())
        .post(`/articles/${articleId}/blocks`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(createBlockDto);

      expect(response.status).toBe(403);
    });

    it("should return 404 if article does not exist", async () => {
      const createBlockDto = {
        type: BlockType.PARAGRAPH,
        content: "Test content",
      };

      const response = await request(app.getHttpServer())
        .post(`/articles/non-existent-id/blocks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(createBlockDto);

      expect(response.status).toBe(404);
    });

    it("should increment order for each new block", async () => {
      // Create a new article to test sequential ordering
      const newArticleRes = await request(app.getHttpServer())
        .post("/articles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: `Test Article for Order ${Date.now()}`,
          slug: `test-article-order-${Date.now()}`,
          content: "Test content",
          excerpt: "Test excerpt",
          authorId,
          categoryId,
          status: PostStatus.DRAFT,
        });

      const newArticleId = newArticleRes.body.id;

      const blockDto1 = {
        type: BlockType.PARAGRAPH,
        content: "First paragraph",
      };

      const blockDto2 = {
        type: BlockType.HEADING_1,
        content: "First heading",
      };

      const response1 = await request(app.getHttpServer())
        .post(`/articles/${newArticleId}/blocks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(blockDto1);

      const response2 = await request(app.getHttpServer())
        .post(`/articles/${newArticleId}/blocks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(blockDto2);

      expect(response1.body.order).toBe(0);
      expect(response2.body.order).toBe(1);
    });
  });

  describe("GET /articles/:articleId/blocks - Get All Blocks", () => {
    it("should return all blocks for an article", async () => {
      const response = await request(app.getHttpServer()).get(
        `/articles/${articleId}/blocks`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return blocks ordered by order field", async () => {
      const response = await request(app.getHttpServer()).get(
        `/articles/${articleId}/blocks`,
      );

      expect(response.status).toBe(200);

      for (let i = 0; i < response.body.length - 1; i++) {
        expect(response.body[i].order).toBeLessThanOrEqual(
          response.body[i + 1].order,
        );
      }
    });
  });

  describe("GET /articles/:articleId/blocks/:blockId - Get Block", () => {
    it("should return a specific block", async () => {
      const response = await request(app.getHttpServer()).get(
        `/articles/${articleId}/blocks/${blockId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(blockId);
      expect(response.body.type).toBe(BlockType.PARAGRAPH);
    });

    it("should return 404 if block does not exist", async () => {
      const response = await request(app.getHttpServer()).get(
        `/articles/${articleId}/blocks/non-existent-id`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /articles/:articleId/blocks/:blockId - Update Block", () => {
    it("should update a block successfully", async () => {
      const updateBlockDto = {
        content: "Updated paragraph content",
        isBold: true,
        fontSize: 18,
      };

      const response = await request(app.getHttpServer())
        .patch(`/articles/${articleId}/blocks/${blockId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateBlockDto);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe("Updated paragraph content");
      expect(response.body.isBold).toBe(true);
      expect(response.body.fontSize).toBe(18);
    });

    it("should return 401 without authentication", async () => {
      const updateBlockDto = {
        content: "Updated content",
      };

      const response = await request(app.getHttpServer())
        .patch(`/articles/${articleId}/blocks/${blockId}`)
        .send(updateBlockDto);

      expect(response.status).toBe(401);
    });

    it("should return 403 if user is not editor", async () => {
      const otherUserToken = (
        await request(app.getHttpServer())
          .post("/auth/register")
          .send({
            email: makeEmail("other2"),
            password: "Test123!",
            name: "Other User 2",
          })
      ).body.access_token;

      const updateBlockDto = {
        content: "Updated content",
      };

      const response = await request(app.getHttpServer())
        .patch(`/articles/${articleId}/blocks/${blockId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(updateBlockDto);

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /articles/:articleId/blocks/:blockId - Delete Block", () => {
    let blockToDeleteId: string;

    beforeEach(async () => {
      // Create a block to delete
      const blockDto = {
        type: BlockType.PARAGRAPH,
        content: "Block to delete",
      };

      const response = await request(app.getHttpServer())
        .post(`/articles/${articleId}/blocks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(blockDto);

      blockToDeleteId = response.body.id;
    });

    it("should delete a block successfully", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/articles/${articleId}/blocks/${blockToDeleteId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("eliminado");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app.getHttpServer()).delete(
        `/articles/${articleId}/blocks/${blockToDeleteId}`,
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 if user is not editor", async () => {
      const otherUserToken = (
        await request(app.getHttpServer())
          .post("/auth/register")
          .send({
            email: makeEmail("other3"),
            password: "Test123!",
            name: "Other User 3",
          })
      ).body.access_token;

      const response = await request(app.getHttpServer())
        .delete(`/articles/${articleId}/blocks/${blockToDeleteId}`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
    });

    it("should reorder remaining blocks after deletion", async () => {
      // Create multiple blocks
      const blocks: any[] = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post(`/articles/${articleId}/blocks`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            type: BlockType.PARAGRAPH,
            content: `Block ${i}`,
          });

        blocks.push(response.body);
      }

      // Delete the middle block
      await request(app.getHttpServer())
        .delete(`/articles/${articleId}/blocks/${blocks[1].id}`)
        .set("Authorization", `Bearer ${authToken}`);

      // Check that remaining blocks are reordered
      const response = await request(app.getHttpServer()).get(
        `/articles/${articleId}/blocks`,
      );

      const remainingBlocks = response.body.filter(
        (b) => b.id === blocks[0].id || b.id === blocks[2].id,
      );
      expect(remainingBlocks[0].order).toBeLessThan(remainingBlocks[1].order);
    });
  });

  describe("POST /articles/:articleId/blocks/reorder - Reorder Blocks", () => {
    it("should reorder blocks successfully", async () => {
      // Create a new article with fresh blocks
      const newArticleRes = await request(app.getHttpServer())
        .post("/articles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: `Test Article for Reorder ${Date.now()}`,
          slug: `test-article-reorder-${Date.now()}`,
          content: "Test content",
          excerpt: "Test excerpt",
          authorId,
          categoryId,
          status: PostStatus.DRAFT,
        });

      const newArticleId = newArticleRes.body.id;

      // Create some blocks
      const blocksToCreate = [
        { type: BlockType.PARAGRAPH, content: "First block" },
        { type: BlockType.HEADING_1, content: "Second block" },
        { type: BlockType.PARAGRAPH, content: "Third block" },
      ];

      const createdBlocks: any[] = [];
      for (const blockData of blocksToCreate) {
        const blockRes = await request(app.getHttpServer())
          .post(`/articles/${newArticleId}/blocks`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(blockData);
        createdBlocks.push(blockRes.body);
      }

      const blockIds = createdBlocks.map((b) => b.id);

      if (blockIds.length >= 2) {
        // Reverse the first two blocks
        const reorderedIds = [blockIds[1], blockIds[0], ...blockIds.slice(2)];

        const response = await request(app.getHttpServer())
          .post(`/articles/${newArticleId}/blocks/reorder`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({ blockIds: reorderedIds });

        expect(response.status).toBe(201);
        expect(response.body[0].id).toBe(blockIds[1]);
        expect(response.body[0].order).toBe(0);
        expect(response.body[1].id).toBe(blockIds[0]);
        expect(response.body[1].order).toBe(1);
      }
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app.getHttpServer())
        .post(`/articles/${articleId}/blocks/reorder`)
        .send({ blockIds: ["block-1", "block-2"] });

      expect(response.status).toBe(401);
    });

    it("should return 403 if user is not editor", async () => {
      const otherUserToken = (
        await request(app.getHttpServer())
          .post("/auth/register")
          .send({
            email: makeEmail("other4"),
            password: "Test123!",
            name: "Other User 4",
          })
      ).body.access_token;

      const response = await request(app.getHttpServer())
        .post(`/articles/${articleId}/blocks/reorder`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send({ blockIds: ["block-1", "block-2"] });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /articles/:id/full - Get Article With Blocks", () => {
    it("should return article with all blocks", async () => {
      const response = await request(app.getHttpServer())
        .get(`/articles/${articleId}/full`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(articleId);
      expect(Array.isArray(response.body.blocks)).toBe(true);
      expect(response.body.blocks.length).toBeGreaterThan(0);
      expect(response.body.author).toBeDefined();
      expect(response.body.category).toBeDefined();
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app.getHttpServer()).get(
        `/articles/${articleId}/full`,
      );

      expect(response.status).toBe(401);
    });

    it("should allow USER to view published articles", async () => {
      const publishedArticle = await prismaService.article.update({
        where: { id: articleId },
        data: { status: PostStatus.PUBLISHED, publishedAt: new Date() },
      });

      const userToken = (
        await request(app.getHttpServer())
          .post("/auth/register")
          .send({
            email: makeEmail("viewer"),
            password: "Test123!",
            name: "Viewer",
          })
      ).body.access_token;

      const response = await request(app.getHttpServer())
        .get(`/articles/${publishedArticle.id}/full`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    it("should prevent USER from viewing unpublished articles", async () => {
      const draftArticle = await prismaService.article.create({
        data: {
          title: "Draft Article",
          slug: "draft-article-" + Date.now(),
          content: "Draft content",
          status: PostStatus.DRAFT,
          authorId,
          editorId: userId,
          categoryId,
        },
      });

      const userToken = (
        await request(app.getHttpServer())
          .post("/auth/register")
          .send({
            email: makeEmail("viewer2"),
            password: "Test123!",
            name: "Viewer 2",
          })
      ).body.access_token;

      const response = await request(app.getHttpServer())
        .get(`/articles/${draftArticle.id}/full`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /articles/:articleId/blocks/multiple - Create Multiple Blocks", () => {
    it("should create multiple blocks at once", async () => {
      const createBlocksDto = {
        blocks: [
          {
            type: BlockType.HEADING_1,
            content: "Main Title",
            fontSize: 32,
          },
          {
            type: BlockType.PARAGRAPH,
            content: "Introduction paragraph",
            fontSize: 16,
          },
          {
            type: BlockType.QUOTE,
            content: "A famous quote",
            fontSize: 18,
            isItalic: true,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/articles/${articleId}/blocks/multiple`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(createBlocksDto);

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      expect(response.body[0].type).toBe(BlockType.HEADING_1);
      expect(response.body[1].type).toBe(BlockType.PARAGRAPH);
      expect(response.body[2].type).toBe(BlockType.QUOTE);
    });

    it("should maintain sequential order for multiple blocks", async () => {
      // Create a new article to test sequential ordering
      const newArticleRes = await request(app.getHttpServer())
        .post("/articles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: `Test Article for Multiple Blocks ${Date.now()}`,
          slug: `test-article-multiple-${Date.now()}`,
          content: "Test content",
          excerpt: "Test excerpt",
          authorId,
          categoryId,
          status: PostStatus.DRAFT,
        });

      const newArticleId = newArticleRes.body.id;

      const createBlocksDto = {
        blocks: [
          { type: BlockType.PARAGRAPH, content: "Block 1" },
          { type: BlockType.PARAGRAPH, content: "Block 2" },
          { type: BlockType.PARAGRAPH, content: "Block 3" },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/articles/${newArticleId}/blocks/multiple`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(createBlocksDto);

      expect(response.status).toBe(201);
      for (let i = 0; i < response.body.length; i++) {
        expect(response.body[i].order).toBe(i);
      }
    });
  });
});
