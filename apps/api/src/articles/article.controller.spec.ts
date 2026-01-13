import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Role, PostStatus } from '@conozca/database';
import { AuditInterceptor } from '../common/audit.interceptor';
import { AuditLogService } from '../common/audit-log.service';
import { SeoService } from '../common/seo.service';

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  const mockArticleResponse = {
    id: 'article-1',
    title: 'Test Article',
    slug: 'test-article',
    content: 'Content',
    excerpt: 'Excerpt',
    featuredImage: 'image.jpg',
    status: PostStatus.PUBLISHED,
    author: {
      id: 'author-1',
      name: 'Test Author',
      bio: 'Bio',
      avatarUrl: 'avatar.jpg',
    },
    category: {
      id: 'category-1',
      name: 'Tech',
      slug: 'tech',
    },
    editor: {
      id: 'editor-1',
      email: 'editor@example.com',
      name: 'Editor',
      role: Role.EDITOR,
    },
    viewCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  };

  const mockArticleListResponse = {
    items: [mockArticleResponse],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  const mockArticleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createCategory: jest.fn(),
    findAllCategories: jest.fn(),
    createAuthor: jest.fn(),
    findAllAuthors: jest.fn(),
  };

  const mockAuditLog = { log: jest.fn() } as any;
  const mockSeo = { setMeta: jest.fn(), getMeta: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
        AuditInterceptor,
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: SeoService, useValue: mockSeo },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new article', async () => {
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

      const mockRequest = {
        user: {
          sub: 'editor-1',
          role: Role.EDITOR,
        },
      };

      mockArticleService.create.mockResolvedValueOnce(mockArticleResponse);

      const result = await controller.create(createArticleDto, mockRequest);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Article');
      expect(mockArticleService.create).toHaveBeenCalledWith(
        createArticleDto,
        'editor-1',
        Role.EDITOR,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated articles', async () => {
      const mockRequest = {
        user: {
          sub: 'user-1',
          role: Role.USER,
        },
      };

      mockArticleService.findAll.mockResolvedValueOnce(mockArticleListResponse);

      const result = await controller.findAll('1', '10', mockRequest);

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockArticleService.findAll).toHaveBeenCalledWith(
        1,
        10,
        Role.USER,
        'user-1',
      );
    });

    it('should use default pagination values', async () => {
      const mockRequest = {
        user: undefined,
      };

      mockArticleService.findAll.mockResolvedValueOnce(mockArticleListResponse);

      await controller.findAll(undefined, undefined, mockRequest);

      expect(mockArticleService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
      );
    });

    it('should handle unauthenticated requests', async () => {
      const mockRequest = {
        user: undefined,
      };

      mockArticleService.findAll.mockResolvedValueOnce(mockArticleListResponse);

      const result = await controller.findAll('1', '10', mockRequest);

      expect(result).toBeDefined();
      expect(mockArticleService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
      );
    });

    it('should enforce pageSize limit of 100', async () => {
      const mockRequest = {
        user: undefined,
      };

      mockArticleService.findAll.mockResolvedValueOnce(mockArticleListResponse);

      await controller.findAll('1', '200', mockRequest);

      expect(mockArticleService.findAll).toHaveBeenCalledWith(
        1,
        100, // Should be capped at 100
        undefined,
        undefined,
      );
    });

    it('should enforce minimum page and pageSize of 1', async () => {
      const mockRequest = {
        user: undefined,
      };

      mockArticleService.findAll.mockResolvedValueOnce(mockArticleListResponse);

      await controller.findAll('0', '0', mockRequest);

      expect(mockArticleService.findAll).toHaveBeenCalledWith(
        1, // Minimum 1
        10, // Default when parseInt is 0 (falsy triggers ||10)
        undefined,
        undefined,
      );
    });

    it('should handle invalid page number strings', async () => {
      const mockRequest = {
        user: undefined,
      };

      mockArticleService.findAll.mockResolvedValueOnce(mockArticleListResponse);

      await controller.findAll('invalid', '10', mockRequest);

      expect(mockArticleService.findAll).toHaveBeenCalledWith(
        1, // Defaults to 1 on invalid input
        10,
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should find article by slug', async () => {
      const mockRequest = {
        user: {
          sub: 'user-1',
          role: Role.USER,
        },
      };

      mockArticleService.findOne.mockResolvedValueOnce(mockArticleResponse);

      const result = await controller.findOne('test-article', mockRequest);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Article');
      expect(mockArticleService.findOne).toHaveBeenCalledWith(
        'test-article',
        Role.USER,
        'user-1',
      );
    });

    it('should handle unauthenticated requests', async () => {
      const mockRequest = {
        user: undefined,
      };

      mockArticleService.findOne.mockResolvedValueOnce(mockArticleResponse);

      await controller.findOne('test-article', mockRequest);

      expect(mockArticleService.findOne).toHaveBeenCalledWith(
        'test-article',
        undefined,
        undefined,
      );
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        status: PostStatus.PUBLISHED,
      };

      const mockRequest = {
        user: {
          sub: 'editor-1',
          role: Role.EDITOR,
        },
      };

      mockArticleService.update.mockResolvedValueOnce({
        ...mockArticleResponse,
        title: 'Updated Title',
      });

      const result = await controller.update('article-1', updateArticleDto, mockRequest);

      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Title');
      expect(mockArticleService.update).toHaveBeenCalledWith(
        'article-1',
        updateArticleDto,
        'editor-1',
        Role.EDITOR,
      );
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      const mockRequest = {
        user: {
          sub: 'editor-1',
          role: Role.EDITOR,
        },
      };

      mockArticleService.delete.mockResolvedValueOnce(undefined);

      const result = await controller.delete('article-1', mockRequest);

      expect(result).toBeUndefined();
      expect(mockArticleService.delete).toHaveBeenCalledWith(
        'article-1',
        'editor-1',
        Role.EDITOR,
      );
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createCategoryDto = {
        name: 'New Category',
        slug: 'new-category',
        description: 'Description',
      };

      const mockRequest = {
        user: {
          sub: 'admin-1',
          role: Role.ADMIN,
        },
      };

      const mockCategory = {
        id: 'category-1',
        ...createCategoryDto,
      };

      mockArticleService.createCategory.mockResolvedValueOnce(mockCategory);

      const result = await controller.createCategory(createCategoryDto, mockRequest);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Category');
      expect(mockArticleService.createCategory).toHaveBeenCalledWith(
        createCategoryDto,
        Role.ADMIN,
      );
    });
  });

  describe('findAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: 'category-1',
          name: 'Tech',
          slug: 'tech',
          description: 'Tech articles',
          _count: { articles: 5 },
        },
      ];

      mockArticleService.findAllCategories.mockResolvedValueOnce(mockCategories);

      const result = await controller.findAllCategories();

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(mockArticleService.findAllCategories).toHaveBeenCalled();
    });
  });

  describe('createAuthor', () => {
    it('should create an author', async () => {
      const createAuthorDto = {
        name: 'New Author',
        bio: 'Bio',
        avatarUrl: 'avatar.jpg',
      };

      const mockRequest = {
        user: {
          sub: 'admin-1',
          role: Role.ADMIN,
        },
      };

      const mockAuthor = {
        id: 'author-1',
        ...createAuthorDto,
      };

      mockArticleService.createAuthor.mockResolvedValueOnce(mockAuthor);

      const result = await controller.createAuthor(createAuthorDto, mockRequest);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Author');
      expect(mockArticleService.createAuthor).toHaveBeenCalledWith(
        createAuthorDto,
        Role.ADMIN,
      );
    });
  });

  describe('findAllAuthors', () => {
    it('should return all authors', async () => {
      const mockAuthors = [
        {
          id: 'author-1',
          name: 'Test Author',
          bio: 'Bio',
          avatarUrl: 'avatar.jpg',
          _count: { articles: 3 },
        },
      ];

      mockArticleService.findAllAuthors.mockResolvedValueOnce(mockAuthors);

      const result = await controller.findAllAuthors();

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(mockArticleService.findAllAuthors).toHaveBeenCalled();
    });
  });
});
