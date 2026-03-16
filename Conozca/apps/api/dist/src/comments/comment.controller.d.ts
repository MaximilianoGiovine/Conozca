import { CommentService } from "./comment.service";
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from "./comment.dto";
import type { AuthenticatedRequest } from "../common/interfaces/authenticated-request.interface";
export declare class CommentController {
    private commentService;
    constructor(commentService: CommentService);
    create(articleId: string, createCommentDto: CreateCommentDto, req: AuthenticatedRequest): Promise<CommentResponseDto>;
    findByArticle(articleId: string, includeUnapproved: string, req: AuthenticatedRequest): Promise<any>;
    findOne(id: string): Promise<CommentResponseDto>;
    update(id: string, updateCommentDto: UpdateCommentDto, req: AuthenticatedRequest): Promise<CommentResponseDto>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    findPendingModeration(req: AuthenticatedRequest): Promise<any>;
    approve(id: string, req: AuthenticatedRequest): Promise<CommentResponseDto>;
    report(id: string): Promise<CommentResponseDto>;
}
