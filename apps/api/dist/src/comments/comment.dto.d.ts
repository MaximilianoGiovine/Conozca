export declare class CreateCommentDto {
    content: string;
}
export declare class UpdateCommentDto {
    content?: string;
    isApproved?: boolean;
    isReported?: boolean;
}
export declare class CommentResponseDto {
    id: string;
    content: string;
    isApproved: boolean;
    isReported: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
    };
    articleId: string;
}
