import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuditLogService } from './common/audit-log.service';
import { LoggerService } from './common/logger.service';
import { LoggerMiddleware } from './common/logger.middleware';
import { EmailService } from './common/email.service';
import { UploadService } from './common/upload.service';
import { SentryService } from './common/sentry.service';
import { SentryInterceptor } from './common/sentry.interceptor';
import { AuthModule } from './auth/auth.module';
import { ArticleModule } from './articles/article.module';
import { UploadModule } from './common/upload.module';
import { CommentModule } from './comments/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'global', ttl: 60, limit: 100 }],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ArticleModule,
    UploadModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    AuditLogService,
    LoggerService,
    EmailService,
    UploadService,
    SentryService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: SentryInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}