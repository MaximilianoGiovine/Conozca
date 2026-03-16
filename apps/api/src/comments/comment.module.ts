import { Module } from "@nestjs/common";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { PrismaService } from "../prisma.service";
import { LoggerService } from "../common/logger.service";
import { AuthGuard } from "../auth/auth.guard";
import { OptionalAuthGuard } from "../auth/optional-auth.guard";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [CommentController],
  providers: [
    CommentService,
    PrismaService,
    LoggerService,
    AuthGuard,
    OptionalAuthGuard,
    JwtService,
  ],
  exports: [CommentService],
})
export class CommentModule {}
