import { PrismaService } from "../prisma.service";
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from "./comment.dto";
export declare class CommentService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    create(articleId: string, userId: string, createCommentDto: CreateCommentDto): Promise<CommentResponseDto>;
    findByArticle(articleId: string, includeUnapproved?: boolean): Promise<any>;
    findOne(id: string): Promise<CommentResponseDto>;
    update(id: string, userId: string, userRole: string, updateCommentDto: UpdateCommentDto): Promise<CommentResponseDto>;
    remove(id: string, userId: string, userRole: string): Promise<void>;
    findPendingModeration(): Promise<any>;
    approve(id: string): Promise<CommentResponseDto>;
    report(id: string): Promise<CommentResponseDto>;
}
