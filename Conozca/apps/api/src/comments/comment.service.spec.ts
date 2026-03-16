import { Test, TestingModule } from "@nestjs/testing";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { PrismaService } from "../prisma.service";
import { LoggerService } from "../common/logger.service";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";

describe("CommentService", () => {
  let service: CommentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    article: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a comment when article exists", async () => {
      const articleId = "article-1";
      const userId = "user-1";
      const createCommentDto = { content: "Great article!" };

      const mockArticle = { id: articleId, title: "Test Article" };
      const mockComment = {
        id: "comment-1",
        ...createCommentDto,
        articleId,
        userId,
        isApproved: false,
        isReported: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: userId, name: "User Name", email: "user@test.com" },
      };

      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.create(articleId, userId, createCommentDto);

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.article.findUnique).toHaveBeenCalledWith({
        where: { id: articleId },
      });
      expect(mockPrismaService.comment.create).toHaveBeenCalled();
    });

    it("should throw NotFoundException when article does not exist", async () => {
      const articleId = "non-existent";
      const userId = "user-1";
      const createCommentDto = { content: "Great article!" };

      mockPrismaService.article.findUnique.mockResolvedValue(null);

      await expect(
        service.create(articleId, userId, createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByArticle", () => {
    it("should return only approved comments for non-admins", async () => {
      const articleId = "article-1";
      const mockComments = [
        {
          id: "comment-1",
          content: "Great!",
          isApproved: true,
          isReported: false,
          user: { id: "user-1", name: "User", email: "user@test.com" },
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findByArticle(articleId, false);

      expect(result).toEqual(mockComments);
      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { articleId, isApproved: true },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return all comments for admins", async () => {
      const articleId = "article-1";
      const mockComments = [
        {
          id: "comment-1",
          content: "Great!",
          isApproved: true,
          isReported: false,
          user: { id: "user-1", name: "User", email: "user@test.com" },
        },
        {
          id: "comment-2",
          content: "Pending approval",
          isApproved: false,
          isReported: false,
          user: { id: "user-2", name: "User2", email: "user2@test.com" },
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findByArticle(articleId, true);

      expect(result).toEqual(mockComments);
      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { articleId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("update", () => {
    it("should allow author to edit content", async () => {
      const commentId = "comment-1";
      const userId = "user-1";
      const updateCommentDto = { content: "Updated content" };

      const mockComment = {
        id: commentId,
        content: "Original",
        userId,
        isApproved: false,
        isReported: false,
      };

      const updatedComment = {
        ...mockComment,
        ...updateCommentDto,
        updatedAt: new Date(),
        user: { id: userId, name: "User", email: "user@test.com" },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.update.mockResolvedValue(updatedComment);

      const result = await service.update(
        commentId,
        userId,
        "USER",
        updateCommentDto,
      );

      expect(result).toEqual(updatedComment);
    });

    it("should throw ForbiddenException when non-author tries to edit", async () => {
      const commentId = "comment-1";
      const userId = "user-1";
      const differentUserId = "user-2";
      const updateCommentDto = { content: "Updated content" };

      const mockComment = {
        id: commentId,
        content: "Original",
        userId: differentUserId,
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.update(commentId, userId, "USER", updateCommentDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should only allow ADMIN to change approval status", async () => {
      const commentId = "comment-1";
      const userId = "user-1";
      const updateCommentDto = { isApproved: true };

      const mockComment = { id: commentId, userId, isApproved: false };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.update(commentId, userId, "USER", updateCommentDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should allow author to delete", async () => {
      const commentId = "comment-1";
      const userId = "user-1";

      const mockComment = { id: commentId, userId };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      await service.remove(commentId, userId, "USER");

      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });

    it("should allow ADMIN to delete any comment", async () => {
      const commentId = "comment-1";
      const userId = "user-1";
      const adminId = "admin-1";

      const mockComment = { id: commentId, userId };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      await service.remove(commentId, adminId, "ADMIN");

      expect(mockPrismaService.comment.delete).toHaveBeenCalled();
    });

    it("should throw ForbiddenException when non-author non-admin tries to delete", async () => {
      const commentId = "comment-1";
      const userId = "user-1";
      const differentUserId = "user-2";

      const mockComment = { id: commentId, userId: differentUserId };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(service.remove(commentId, userId, "USER")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findPendingModeration", () => {
    it("should return comments pending approval or reported", async () => {
      const mockComments = [
        {
          id: "comment-1",
          content: "Pending approval",
          isApproved: false,
          isReported: false,
        },
        {
          id: "comment-2",
          content: "Reported",
          isApproved: true,
          isReported: true,
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findPendingModeration();

      expect(result).toEqual(mockComments);
      expect(mockPrismaService.comment.findMany).toHaveBeenCalled();
    });
  });

  describe("approve", () => {
    it("should approve a comment", async () => {
      const commentId = "comment-1";

      const approvedComment = {
        id: commentId,
        isApproved: true,
        isReported: false,
        user: { id: "user-1", name: "User", email: "user@test.com" },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue({
        id: commentId,
        isApproved: false,
      });
      mockPrismaService.comment.update.mockResolvedValue(approvedComment);

      const result = await service.approve(commentId);

      expect(result.isApproved).toBe(true);
    });
  });

  describe("report", () => {
    it("should report a comment", async () => {
      const commentId = "comment-1";

      const reportedComment = {
        id: commentId,
        isReported: true,
        user: { id: "user-1", name: "User", email: "user@test.com" },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue({
        id: commentId,
        isReported: false,
      });
      mockPrismaService.comment.update.mockResolvedValue(reportedComment);

      const result = await service.report(commentId);

      expect(result.isReported).toBe(true);
    });
  });
});
