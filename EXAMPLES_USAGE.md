/**
 * EJEMPLOS DE USO - Backend Optimizations
 * 
 * Esta archivo contiene ejemplos prácticos de cómo usar cada una de las
 * optimizaciones del backend implementadas en Phase 3.
 */

// ============================================
// 1. WINSTON LOGGER
// ============================================

import { LoggerService } from './src/common/logger.service';

class UserService {
  private logger = new LoggerService('UserService');

  async registerUser(email: string, name: string) {
    try {
      this.logger.log(`Registering user: ${email}`);

      // Lógica de registro
      const user = { id: '123', email, name };

      this.logger.logBusinessEvent('user_registered', {
        userId: user.id,
        email,
        timestamp: new Date(),
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to register user', error.stack);
      throw error;
    }
  }

  async queryDatabase(sql: string) {
    this.logger.logQuery(sql, ['param1', 'param2']);
    // Ejecutar query
  }
}

// ============================================
// 2. EMAIL SERVICE
// ============================================

import { EmailService } from './src/common/email.service';

class AuthService {
  constructor(private emailService: EmailService) {}

  async register(email: string, name: string, token: string) {
    // Guardar usuario en BD...

    // Enviar email de verificación
    const emailSent = await this.emailService.sendVerificationEmail(email, token);

    if (!emailSent) {
      console.warn('Failed to send verification email');
    }

    return { success: true, message: 'User created, check your email' };
  }

  async requestPasswordReset(email: string, resetToken: string) {
    const emailSent = await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      success: emailSent,
      message: 'If email exists, password reset instructions have been sent',
    };
  }

  async welcomeNewUser(email: string, name: string) {
    await this.emailService.sendWelcomeEmail(email, name);
  }
}

// ============================================
// 3. UPLOAD SERVICE
// ============================================

import { UploadService } from './src/common/upload.service';
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('articles')
class ArticleController {
  constructor(private uploadService: UploadService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async createArticle(
    @UploadedFile() file: Express.Multer.File,
    // ... other fields
  ) {
    // Validar archivo
    const validation = this.uploadService.validateFile(file);
    if (!validation.valid) {
      return { error: validation.error };
    }

    // Subir imagen
    const imageUrl = await this.uploadService.uploadImage(file, 'articles');

    // Guardar artículo con URL de imagen
    const article = {
      title: 'My Article',
      featuredImage: imageUrl,
      // ... otros campos
    };

    // Al eliminar artículo, eliminar imagen
    // await this.uploadService.deleteImage(imageUrl);

    return article;
  }

  @Get('upload-info')
  getUploadInfo() {
    return this.uploadService.getProviderInfo();
    // Retorna:
    // {
    //   "provider": "local",
    //   "maxFileSize": 5242880,
    //   "maxFileSizeMB": 5,
    //   "allowedMimeTypes": [...]
    // }
  }
}

// ============================================
// 4. COMMENTS SYSTEM
// ============================================

import { CommentService } from './src/comments/comment.service';

@Controller('articles/:articleId/comments')
class ArticleCommentsController {
  constructor(private commentService: CommentService) {}

  // Crear comentario
  @Post()
  async createComment(articleId: string, userId: string, content: string) {
    return this.commentService.create(articleId, userId, { content });
    // Retorna:
    // {
    //   "id": "comment-uuid",
    //   "content": "Great article!",
    //   "isApproved": false,
    //   "isReported": false,
    //   "createdAt": "2026-01-09T...",
    //   "user": { "id": "...", "name": "...", "email": "..." }
    // }
  }

  // Obtener comentarios aprobados
  @Get()
  async getComments(articleId: string) {
    return this.commentService.findByArticle(articleId, false);
    // Solo retorna comentarios con isApproved: true
  }

  // Obtener comentarios (solo ADMIN)
  @Get('all')
  async getAllComments(articleId: string, isAdmin: boolean) {
    return this.commentService.findByArticle(articleId, isAdmin);
    // Si isAdmin: true, retorna todos incluidos los no aprobados
  }

  // Panel de moderación (ADMIN)
  @Get('admin/pending')
  async getPendingModerations() {
    return this.commentService.findPendingModeration();
    // Retorna comentarios con isApproved: false o isReported: true
  }

  // Actualizar comentario
  @Patch(':commentId')
  async updateComment(
    commentId: string,
    userId: string,
    userRole: string,
    updates: { content?: string; isApproved?: boolean; isReported?: boolean },
  ) {
    return this.commentService.update(commentId, userId, userRole, updates);
  }

  // Aprobar comentario (ADMIN)
  @Patch(':commentId/approve')
  async approveComment(commentId: string) {
    return this.commentService.approve(commentId);
  }

  // Reportar comentario
  @Patch(':commentId/report')
  async reportComment(commentId: string) {
    return this.commentService.report(commentId);
  }

  // Eliminar comentario
  @Delete(':commentId')
  async deleteComment(commentId: string, userId: string, userRole: string) {
    await this.commentService.remove(commentId, userId, userRole);
    return { message: 'Comment deleted' };
  }
}

// ============================================
// 5. SENTRY INTEGRATION
// ============================================

import { SentryService } from './src/common/sentry.service';

class PaymentService {
  constructor(private sentryService: SentryService) {}

  async processPayment(userId: string, amount: number) {
    try {
      // Agregar contexto del usuario
      this.sentryService.setUser({
        id: userId,
        email: 'user@example.com',
        username: 'username',
      });

      // Agregar breadcrumb
      this.sentryService.addBreadcrumb({
        message: 'Payment process started',
        category: 'payment',
        level: 'info',
        data: { userId, amount },
      });

      // Capturar performance
      const result = await this.sentryService.capturePerformance(
        'stripe-payment',
        async () => {
          // Lógica de pago
          return await this.chargeCard(userId, amount);
        },
      );

      this.sentryService.addBreadcrumb({
        message: 'Payment successful',
        category: 'payment',
        level: 'info',
      });

      // Limpiar contexto del usuario
      this.sentryService.clearUser();

      return result;
    } catch (error) {
      // Capturar excepción automáticamente
      this.sentryService.captureException(error as Error, {
        userId,
        amount,
        operation: 'payment',
      });

      throw error;
    }
  }

  async chargeCard(userId: string, amount: number) {
    // Simular carga
    return { transactionId: 'txn-123', amount };
  }
}

// ============================================
// USO EN TESTS
// ============================================

import { Test } from '@nestjs/testing';

describe('Integration Example', () => {
  let userService: UserService;
  let authService: AuthService;
  let commentService: CommentService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        AuthService,
        CommentService,
        PrismaService,
        EmailService,
        LoggerService,
        SentryService,
        UploadService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    commentService = module.get<CommentService>(CommentService);
  });

  it('should register user and send verification email', async () => {
    const result = await authService.register('test@example.com', 'John', 'token-123');
    expect(result.success).toBe(true);
  });

  it('should create comment and store in database', async () => {
    const comment = await commentService.create('article-1', 'user-1', {
      content: 'Great article!',
    });
    expect(comment.isApproved).toBe(false);
  });
});

// ============================================
// FLUJOS COMPLETOS
// ============================================

/*
FLUJO 1: Registro de usuario
1. Usuario envía POST /auth/register con email, password, name
2. AuthService valida y crea usuario en BD
3. LoggerService logea el evento (business event)
4. EmailService envía email de verificación
5. Usuario recibe email con link de verificación
6. Usuario hace click en link
7. Email es verificado y cuenta activada

FLUJO 2: Comentar artículo
1. Usuario autenticado hace POST /comments/article/:id con contenido
2. CommentService crea comentario con isApproved: false
3. Comentario queda pendiente de moderación
4. ADMIN recibe notificación en /comments/admin/pending
5. ADMIN aprueba con PATCH /comments/:id/approve
6. Comentario se vuelve visible para otros usuarios
7. Si hay abuso, PATCH /comments/:id/report

FLUJO 3: Upload de imagen
1. Usuario selecciona imagen en editor
2. Frontend hace POST /uploads/image con file + folder
3. UploadService valida tamaño y tipo MIME
4. Archivo se guarda localmente en uploads/articles/
5. Se retorna URL pública del archivo
6. Frontend inserta <img src="..."> en editor
7. Al guardar artículo, URL queda persistida en BD
8. Al eliminar artículo, imagen se limpia también

FLUJO 4: Monitoreo de errores
1. Usuario intenta hacer operación que falla
2. SentryInterceptor captura la excepción automáticamente
3. Context de usuario se agrega automáticamente
4. Breadcrumbs se recopilan (navegación)
5. Sentry recibe evento con todos los detalles
6. En dashboard Sentry, equipo ve el error
7. Se puede replayer session y ver stack trace
*/

export {};
