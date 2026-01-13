import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ArticleService } from './article.service';
import { PrismaService } from '../prisma.service';
import { PdfService } from './pdf.service';
import { Role, PostStatus } from '@conozca/database';

describe('ArticleService', () => {
  let service: ArticleService;
  let prisma: PrismaService;

  const mockAuthor = {
    id: 'author-1',
    name: 'Test Author',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockCategory = {
    id: 'category-1',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech articles',
  };

  const mockEditor = {
    id: 'editor-1',
    email: 'editor@example.com',
    name: 'Editor User',
    role: Role.EDITOR,
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  };

  const mockArticle = {
    id: 'article-1',
    title: 'Test Article',
    slug: 'test-article',
    content: 'Article content here',
    excerpt: 'Article excerpt',
    featuredImage: 'https://example.com/image.jpg',
    status: PostStatus.PUBLISHED,
    authorId: 'author-1',
    editorId: 'editor-1',
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    author: mockAuthor,
    editor: mockEditor,
    category: mockCategory,
    views: [],
  };

  const mockPrismaService = {
    article: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    author: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    view: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an article as EDITOR', async () => {
      const createArticleDto = {
        title: 'New Article',
        slug: 'new-article',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'image.jpg',
        status: PostStatus.DRAFT,
        authorId: 'author-1',
        categoryId: 'category-1',
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.author.findUnique.mockResolvedValueOnce(mockAuthor);
      mockPrismaService.category.findUnique.mockResolvedValueOnce(mockCategory);
      mockPrismaService.article.create.mockResolvedValueOnce({
        ...mockArticle,
        ...createArticleDto,
      });

      const result = await service.create(
        createArticleDto,
        'editor-1',
        Role.EDITOR,
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('New Article');
      expect(mockPrismaService.article.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if USER tries to create article', async () => {
      const createArticleDto = {
        title: 'New Article',
        slug: 'new-article',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'image.jpg',
        status: PostStatus.DRAFT,
        authorId: 'author-1',
        categoryId: 'category-1',
      };

      await expect(
        service.create(createArticleDto, 'user-1', Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if slug already exists', async () => {
      const createArticleDto = {
        title: 'New Article',
        slug: 'existing-article',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'image.jpg',
        status: PostStatus.DRAFT,
        authorId: 'author-1',
        categoryId: 'category-1',
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);

      await expect(
        service.create(createArticleDto, 'editor-1', Role.EDITOR),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if author does not exist', async () => {
      const createArticleDto = {
        title: 'New Article',
        slug: 'new-article',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'image.jpg',
        status: PostStatus.DRAFT,
        authorId: 'invalid-author',
        categoryId: 'category-1',
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.author.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create(createArticleDto, 'editor-1', Role.EDITOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const createArticleDto = {
        title: 'New Article',
        slug: 'new-article',
        content: 'Content',
        excerpt: 'Excerpt',
        featuredImage: 'image.jpg',
        status: PostStatus.DRAFT,
        authorId: 'author-1',
        categoryId: 'invalid-category',
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.author.findUnique.mockResolvedValueOnce(mockAuthor);
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create(createArticleDto, 'editor-1', Role.EDITOR),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated articles', async () => {
      mockPrismaService.article.findMany.mockResolvedValueOnce([mockArticle]);
      mockPrismaService.article.count.mockResolvedValueOnce(1);

      const result = await service.findAll(1, 10, Role.USER, 'user-1');

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter published articles for USER role', async () => {
      mockPrismaService.article.findMany.mockResolvedValueOnce([mockArticle]);
      mockPrismaService.article.count.mockResolvedValueOnce(1);

      await service.findAll(1, 10, Role.USER, 'user-1');

      // Verify the where clause filters by PUBLISHED status
      expect(mockPrismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: PostStatus.PUBLISHED },
        }),
      );
    });

    it('should return all articles for EDITOR', async () => {
      mockPrismaService.article.findMany.mockResolvedValueOnce([mockArticle]);
      mockPrismaService.article.count.mockResolvedValueOnce(1);

      await service.findAll(1, 10, Role.EDITOR, 'editor-1');

      // Editors should see published + their own articles
      expect(mockPrismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { status: PostStatus.PUBLISHED },
              { editorId: 'editor-1' },
            ]),
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.article.findMany.mockResolvedValueOnce([mockArticle]);
      mockPrismaService.article.count.mockResolvedValueOnce(25);

      const result = await service.findAll(2, 10, Role.USER, 'user-1');

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(mockPrismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (2-1) * 10
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should find article by slug', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);
      mockPrismaService.view.create.mockResolvedValueOnce({
        id: 'view-1',
        articleId: 'article-1',
        userId: 'user-1',
        viewedAt: new Date(),
        userAgent: null,
        ip: null,
      });

      const result = await service.findOne('test-article', Role.USER, 'user-1');

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Article');
      expect(mockPrismaService.view.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if article not found', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent', Role.USER, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if USER tries to access draft article', async () => {
      const draftArticle = { ...mockArticle, status: PostStatus.DRAFT };
      mockPrismaService.article.findUnique.mockResolvedValueOnce(draftArticle);

      await expect(service.findOne('draft-article', Role.USER, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow EDITOR to see draft articles', async () => {
      const draftArticle = { ...mockArticle, status: PostStatus.DRAFT };
      mockPrismaService.article.findUnique.mockResolvedValueOnce(draftArticle);
      mockPrismaService.view.create.mockResolvedValueOnce({
        id: 'view-1',
      });

      const result = await service.findOne('draft-article', Role.EDITOR, 'editor-1');

      expect(result).toBeDefined();
    });

    it('should register a view when user is authenticated', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);
      mockPrismaService.view.create.mockResolvedValueOnce({
        id: 'view-1',
      });

      await service.findOne('test-article', Role.USER, 'user-1');

      expect(mockPrismaService.view.create).toHaveBeenCalledWith({
        data: {
          articleId: 'article-1',
          userId: 'user-1',
        },
      });
    });
  });

  describe('update', () => {
    it('should update article as the original editor', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        status: PostStatus.PUBLISHED,
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);
      mockPrismaService.article.update.mockResolvedValueOnce({
        ...mockArticle,
        ...updateArticleDto,
      });

      const result = await service.update(
        'article-1',
        updateArticleDto,
        'editor-1',
        Role.EDITOR,
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Title');
    });

    it('should allow ADMIN to update any article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);
      mockPrismaService.article.update.mockResolvedValueOnce({
        ...mockArticle,
        ...updateArticleDto,
      });

      const result = await service.update(
        'article-1',
        updateArticleDto,
        'admin-1',
        Role.ADMIN,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.article.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not the original editor', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);

      await expect(
        service.update('article-1', updateArticleDto, 'other-editor', Role.EDITOR),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if article does not exist', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
      };

      mockPrismaService.article.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent', updateArticleDto, 'editor-1', Role.EDITOR),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete article as the original editor', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);
      mockPrismaService.view.deleteMany.mockResolvedValueOnce({
        count: 5,
      });
      mockPrismaService.article.delete.mockResolvedValueOnce(mockArticle);

      await service.delete('article-1', 'editor-1', Role.EDITOR);

      expect(mockPrismaService.article.delete).toHaveBeenCalledWith({
        where: { id: 'article-1' },
      });
    });

    it('should allow ADMIN to delete any article', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);
      mockPrismaService.view.deleteMany.mockResolvedValueOnce({
        count: 0,
      });
      mockPrismaService.article.delete.mockResolvedValueOnce(mockArticle);

      await service.delete('article-1', 'admin-1', Role.ADMIN);

      expect(mockPrismaService.article.delete).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not the original editor', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);

      await expect(
        service.delete('article-1', 'other-editor', Role.EDITOR),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if article does not exist', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.delete('non-existent', 'editor-1', Role.EDITOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete views before deleting article', async () => {
      mockPrismaService.article.findUnique.mockResolvedValueOnce(mockArticle);
      mockPrismaService.view.deleteMany.mockResolvedValueOnce({
        count: 5,
      });
      mockPrismaService.article.delete.mockResolvedValueOnce(mockArticle);

      await service.delete('article-1', 'editor-1', Role.EDITOR);

      // Verify both methods were called
      expect(mockPrismaService.view.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.article.delete).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('should create category as ADMIN', async () => {
      const createCategoryDto = {
        name: 'New Category',
        slug: 'new-category',
        description: 'Description',
      };

      mockPrismaService.category.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.category.create.mockResolvedValueOnce(createCategoryDto);

      const result = await service.createCategory(createCategoryDto, Role.ADMIN);

      expect(result).toBeDefined();
      expect(mockPrismaService.category.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not ADMIN', async () => {
      const createCategoryDto = {
        name: 'New Category',
        slug: 'new-category',
        description: 'Description',
      };

      await expect(
        service.createCategory(createCategoryDto, Role.EDITOR),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if category already exists', async () => {
      const createCategoryDto = {
        name: 'Existing Category',
        slug: 'existing-category',
        description: 'Description',
      };

      mockPrismaService.category.findFirst.mockResolvedValueOnce(mockCategory);

      await expect(
        service.createCategory(createCategoryDto, Role.ADMIN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createAuthor', () => {
    it('should create author as ADMIN', async () => {
      const createAuthorDto = {
        name: 'New Author',
        bio: 'Bio',
        avatarUrl: 'url',
      };

      mockPrismaService.author.create.mockResolvedValueOnce(createAuthorDto);

      const result = await service.createAuthor(createAuthorDto, Role.ADMIN);

      expect(result).toBeDefined();
      expect(mockPrismaService.author.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not ADMIN', async () => {
      const createAuthorDto = {
        name: 'New Author',
        bio: 'Bio',
        avatarUrl: 'url',
      };

      await expect(
        service.createAuthor(createAuthorDto, Role.EDITOR),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
