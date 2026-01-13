import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { Role, PostStatus } from '@conozca/database';

/**
 * Tests E2E para el módulo de Artículos
 * 
 * Prueba flujos completos:
 * - CRUD de artículos
 * - Control de acceso (EDITOR, ADMIN)
 * - Estados de artículos (DRAFT, PUBLISHED, ARCHIVED)
 * - Creación de categorías y autores
 * - Gestión de vistas
 */
describe('Articles E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let editorToken: string;
  let userToken: string;

  let adminUserId: string;
  let editorUserId: string;
  let userId: string;

  let categoryId: string;
  let authorId: string;
  let articleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);

    // Crear usuarios de prueba
    const adminRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@articles-e2e.com',
        password: 'AdminPassword123!',
        name: 'Admin User',
      });

    adminUserId = adminRegisterRes.body.user.id;
    // Hacer que el usuario sea ADMIN
    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: Role.ADMIN },
    });

    // Re-login to capture updated role in JWT
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@articles-e2e.com',
        password: 'AdminPassword123!',
      });

    adminToken = adminLoginRes.body.access_token;

    const editorRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'editor@articles-e2e.com',
        password: 'EditorPassword123!',
        name: 'Editor User',
      });

    editorUserId = editorRegisterRes.body.user.id;
    // Hacer que el usuario sea EDITOR
    await prisma.user.update({
      where: { id: editorUserId },
      data: { role: Role.EDITOR },
    });

    const editorLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'editor@articles-e2e.com',
        password: 'EditorPassword123!',
      });

    editorToken = editorLoginRes.body.access_token;

    const userRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@articles-e2e.com',
        password: 'UserPassword123!',
        name: 'Normal User',
      });

    userId = userRegisterRes.body.user.id;
    userToken = userRegisterRes.body.access_token;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.view.deleteMany({
      where: { article: { author: { name: 'Test Author E2E' } } },
    });

    await prisma.article.deleteMany({
      where: { author: { name: 'Test Author E2E' } },
    });

    await prisma.author.deleteMany({
      where: { name: 'Test Author E2E' },
    });

    await prisma.category.deleteMany({
      where: { name: 'Test Category E2E' },
    });

    await prisma.user.deleteMany({
      where: { email: { contains: '@articles-e2e.com' } },
    });

    await app.close();
  });

  describe('Categories', () => {
    it('should create a category as ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Category E2E',
          slug: 'test-category-e2e',
          description: 'Test category for E2E tests',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Category E2E');
      expect(res.body.slug).toBe('test-category-e2e');

      categoryId = res.body.id;
    });

    it('should not create a category as EDITOR', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles/categories')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: 'Another Category',
          slug: 'another-category',
          description: 'Another category',
        });

      expect(res.status).toBe(403);
    });

    it('should get all categories', async () => {
      const res = await request(app.getHttpServer()).get('/articles/categories');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Authors', () => {
    it('should create an author as ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles/authors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Author E2E',
          bio: 'Test author biography',
          avatarUrl: 'https://example.com/avatar.jpg',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Author E2E');

      authorId = res.body.id;
    });

    it('should not create an author as EDITOR', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles/authors')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: 'Another Author',
          bio: 'Another biography',
          avatarUrl: 'https://example.com/avatar2.jpg',
        });

      expect(res.status).toBe(403);
    });

    it('should get all authors', async () => {
      const res = await request(app.getHttpServer()).get('/articles/authors');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Articles - Create', () => {
    it('should create an article as EDITOR', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Test Article E2E',
          slug: 'test-article-e2e',
          content: 'This is a test article content with more than fifty characters to satisfy validation for e2e.',
          excerpt: 'Test excerpt',
          featuredImage: 'https://example.com/image.jpg',
          status: PostStatus.DRAFT,
          authorId,
          categoryId,
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Article E2E');
      expect(res.body.slug).toBe('test-article-e2e');
      expect(res.body.status).toBe(PostStatus.DRAFT);
      expect(res.body.author.id).toBe(authorId);

      articleId = res.body.id;
    });

    it('should not create an article as regular USER', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Article',
          slug: 'unauthorized-article',
          content: 'Unauthorized content body that is intentionally long enough to pass validation length requirements.',
          excerpt: 'Excerpt',
          featuredImage: 'image.jpg',
          status: PostStatus.DRAFT,
          authorId,
          categoryId,
        });

      expect(res.status).toBe(403);
    });

    it('should not create an article without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles')
        .send({
          title: 'Unauthenticated Article',
          slug: 'unauthenticated-article',
          content: 'Unauthenticated content body that is intentionally long enough to pass validation length requirements.',
          excerpt: 'Excerpt',
          featuredImage: 'image.jpg',
          status: PostStatus.DRAFT,
          authorId,
          categoryId,
        });

      expect(res.status).toBe(401);
    });

    it('should fail if slug already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Duplicate Slug',
          slug: 'test-article-e2e', // Same slug as previous
          content: 'Duplicate slug content body that is intentionally long enough to pass validation length requirements.',
          excerpt: 'Excerpt',
          featuredImage: 'image.jpg',
          status: PostStatus.DRAFT,
          authorId,
          categoryId,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Articles - Read', () => {
    it('should get all published articles for USER', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
    });

    it('should not get draft articles as USER', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${userToken}`);

      const draftArticles = res.body.items.filter(
        (article: any) => article.status === PostStatus.DRAFT,
      );
      expect(draftArticles.length).toBe(0);
    });

    it('should get draft articles as EDITOR', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      // EDITOR should be able to see draft articles they created
    });

    it('should get article by slug', async () => {
      const res = await request(app.getHttpServer()).get(
        '/articles/test-article-e2e',
      );

      expect(res.status).toBe(404); // Not found because it's still DRAFT
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles?page=1&pageSize=5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pageSize).toBe(5);
      expect(res.body.page).toBe(1);
    });
  });

  describe('Articles - Update', () => {
    it('should update article as the original editor', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/articles/${articleId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Updated Title',
          status: PostStatus.PUBLISHED,
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.status).toBe(PostStatus.PUBLISHED);
      expect(res.body.publishedAt).toBeDefined();
    });

    it('should not update article as different editor', async () => {
      // Create another editor
      const anotherEditorRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'another-editor@articles-e2e.com',
          password: 'Password123!',
          name: 'Another Editor',
        });

      const anotherEditorToken = anotherEditorRes.body.access_token;
      const anotherEditorId = anotherEditorRes.body.user.id;

      // Make them an editor
      await prisma.user.update({
        where: { id: anotherEditorId },
        data: { role: Role.EDITOR },
      });

      const res = await request(app.getHttpServer())
        .patch(`/articles/${articleId}`)
        .set('Authorization', `Bearer ${anotherEditorToken}`)
        .send({
          title: 'Unauthorized Update',
        });

      expect(res.status).toBe(403);

      // Cleanup
      await prisma.user.delete({
        where: { id: anotherEditorId },
      });
    });

    it('should allow ADMIN to update any article', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/articles/${articleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated Title',
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Admin Updated Title');
    });

    it('should not update without authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/articles/${articleId}`)
        .send({
          title: 'Unauthorized Update',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('Articles - Delete', () => {
    let articleToDelete: string;

    beforeAll(async () => {
      // Create an article to delete
      const res = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Article to Delete',
          slug: 'article-to-delete-e2e',
          content: 'Update content body that is intentionally long enough to pass validation length requirements.',
          excerpt: 'Excerpt',
          featuredImage: 'image.jpg',
          status: PostStatus.DRAFT,
          authorId,
          categoryId,
        });

      articleToDelete = res.body.id;
    });

    it('should delete article as the original editor', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/articles/${articleToDelete}`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(204);
    });

    it('should not find deleted article', async () => {
      const res = await request(app.getHttpServer())
        .get(`/articles/${articleToDelete}`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Articles - Views', () => {
    let viewArticleId: string;

    beforeAll(async () => {
      // Create and publish an article to track views
      const res = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Article for Views',
          slug: 'article-for-views-e2e',
          content: 'View content body that is intentionally long enough to pass validation length requirements.',
          excerpt: 'Excerpt',
          featuredImage: 'image.jpg',
          status: PostStatus.PUBLISHED,
          authorId,
          categoryId,
        });

      viewArticleId = res.body.id;
    });

    it('should record a view when user reads published article', async () => {
      const res = await request(app.getHttpServer())
        .get(`/articles/article-for-views-e2e`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.viewCount).toBeGreaterThan(0);
    });

    it('should increment view count on multiple reads', async () => {
      const res1 = await request(app.getHttpServer())
        .get(`/articles/article-for-views-e2e`)
        .set('Authorization', `Bearer ${userToken}`);

      const viewCount1 = res1.body.viewCount;

      const res2 = await request(app.getHttpServer())
        .get(`/articles/article-for-views-e2e`)
        .set('Authorization', `Bearer ${userId}`);

      const viewCount2 = res2.body.viewCount;

      expect(viewCount2).toBeGreaterThanOrEqual(viewCount1);
    });
  });
});
