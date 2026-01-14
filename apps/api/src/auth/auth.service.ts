import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './auth.dto';
import { EmailService } from '../common/email.service';
import { LoggerService } from '../common/logger.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const BCRYPT_ROUNDS = 12; // Security: Aumentado de 10 a 12

/**
 * AuthService
 * 
 * Servicio que maneja toda la lógica de autenticación:
 * - Registro de usuarios
 * - Login y generación de tokens
 * - Validación de tokens
 * - Refresh tokens
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private customLogger: LoggerService,
  ) {
    // Validar JWT secrets al inicio
    this.validateJWTSecrets();
  }

  private validateJWTSecrets() {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }
    if (jwtSecret === jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }
  }

  /**
   * Registrar un nuevo usuario
   * 
   * @param registerDto - Email, contraseña y nombre
   * @returns AuthResponseDto con tokens y datos del usuario
   * @throws ConflictException si el email ya existe
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña con bcrypt rounds seguros
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // Por defecto, nuevos usuarios son USER
      },
    });

    // Log security event
    this.customLogger.logBusinessEvent('user_registered', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generar tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Emitir token de verificación (persistencia diferida)
    try {
      const token = crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await (this.prisma as any).emailVerificationToken?.upsert({
        where: { userId: user.id },
        update: { tokenHash, expiresAt: new Date(Date.now() + 24*60*60*1000) },
        create: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 24*60*60*1000) },
      });
      // Enviar email de verificación
      await this.emailService.sendVerificationEmail(user.email, token);
    } catch (error) {
      this.logger.warn(`Email verification token creation failed: ${error.message}`);
      // No bloquear el registro si falla la verificación
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Login de usuario
   * 
   * @param loginDto - Email y contraseña
   * @returns AuthResponseDto con tokens y datos del usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar el usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.customLogger.logBusinessEvent('login_failed', {
        email,
        reason: 'invalid_password',
      });
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // Log successful login
    this.customLogger.logBusinessEvent('user_login', {
      userId: user.id,
      email: user.email,
    });

    // Generar tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Registrar sesión/refresh (rotación en refresh)
    await this.persistRefresh(user.id, tokens.refresh_token, undefined);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Refrescar tokens
   * 
   * @param refreshToken - Token de refresco
   * @returns Nuevos access_token y refresh_token
   * @throws UnauthorizedException si el token es inválido
   */
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verificar y decodificar el refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      // Buscar el usuario
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.customLogger.logBusinessEvent('refresh_failed', {
          reason: 'user_not_found',
          userId: payload.sub,
        });
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar existencia de sesión (rotación segura)
      await this.assertRefreshValid(user.id, refreshToken);

      // Generar nuevos tokens y rotar
      const tokens = this.generateTokens(user.id, user.email, user.role);
      await this.persistRefresh(user.id, tokens.refresh_token, refreshToken);

      this.customLogger.logBusinessEvent('token_refreshed', {
        userId: user.id,
      });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      this.customLogger.logBusinessEvent('refresh_failed', {
        reason: error.message,
      });
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  /**
   * Validar un access token
   * 
   * @param token - Access token
   * @returns Payload del token
   * @throws UnauthorizedException si el token es inválido
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secret',
      });
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Generar access_token y refresh_token
   * 
   * @private
   * @param userId - ID del usuario
   * @param email - Email del usuario
   * @param role - Rol del usuario
   * @returns Objeto con access_token y refresh_token
   */
  private generateTokens(
    userId: string,
    email: string,
    role: string,
  ): { access_token: string; refresh_token: string } {
    const payload = { email, sub: userId, role };
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    // Access token - expira en 15 minutos
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: '15m',
      jwtid: accessJti,
    });

    // Refresh token - expira en 7 días
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
      jwtid: refreshJti,
    });

    return { access_token, refresh_token };
  }

  private async persistRefresh(userId: string, newRefresh: string, oldRefresh?: string) {
    try {
      const hash = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
      const now = new Date();

      if (oldRefresh) {
        const result = await (this.prisma as any).session?.updateMany({
          where: { userId, refreshHash: hash(oldRefresh), revokedAt: null },
          data: { revokedAt: now },
        });

        // Detección de reuso de token (security)
        if (result?.count === 0) {
          this.customLogger.logBusinessEvent('refresh_token_reuse_detected', {
            userId,
            severity: 'HIGH',
          });
          // Revocar TODAS las sesiones del usuario por seguridad
          await (this.prisma as any).session?.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: now },
          });
          throw new UnauthorizedException('Token reuse detected - all sessions revoked');
        }
      }

      await (this.prisma as any).session?.create({
        data: {
          userId,
          refreshHash: hash(newRefresh),
          createdAt: now,
          expiresAt: new Date(now.getTime() + 7*24*60*60*1000),
        },
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Session persistence failed: ${error.message}`);
    }
  }

  private async assertRefreshValid(userId: string, refresh: string) {
    try {
      const hash = crypto.createHash('sha256').update(refresh).digest('hex');
      const rec = await (this.prisma as any).session?.findFirst({
        where: { userId, refreshHash: hash, revokedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!rec) {
        this.customLogger.logBusinessEvent('invalid_refresh_token', {
          userId,
          reason: 'not_found_or_revoked',
        });
        throw new UnauthorizedException('Refresh no reconocido');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Si no existe tabla, continuar (modo legacy)
      this.logger.warn(`Session validation failed: ${error.message}`);
    }
  }

  /**
   * Solicitar reset de contraseña
   * 
   * @param forgotPasswordDto - Email del usuario
   * @returns Mensaje de confirmación
   * @throws UnauthorizedException si el email no existe
   */
  async forgotPassword(forgotPasswordDto: { email: string }): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Timing attack protection: Siempre ejecutar operaciones costosas
    const startTime = Date.now();
    const MIN_RESPONSE_TIME = 1000; // 1 segundo mínimo

    // Buscar el usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generar token de reset aleatorio
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

      // Guardar el HASH del token en la BD (no el token plain)
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetTokenHash,
          resetTokenExpires,
        },
      });

      // Enviar email con el token PLAIN
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      this.customLogger.logBusinessEvent('password_reset_requested', {
        userId: user.id,
        email: user.email,
      });
    } else {
      // Hash fake para consumir tiempo similar
      await bcrypt.hash('fake-password', BCRYPT_ROUNDS);
    }

    // Timing attack protection: Asegurar tiempo mínimo de respuesta
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MIN_RESPONSE_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_RESPONSE_TIME - elapsedTime));
    }

    return {
      message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña',
    };
  }

  /**
   * Resetear contraseña con token
   * 
   * @param resetPasswordDto - Token y nueva contraseña
   * @returns Mensaje de éxito
   * @throws UnauthorizedException si el token es inválido o expirado
   */
  async resetPassword(resetPasswordDto: { email: string; reset_token: string; password: string }): Promise<{ message: string }> {
    const { email, reset_token, password } = resetPasswordDto;

    // Buscar el usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Validar token hasheado
    const resetTokenHash = crypto.createHash('sha256').update(reset_token).digest('hex');

    if (!user || user.resetToken !== resetTokenHash) {
      this.customLogger.logBusinessEvent('password_reset_failed', {
        email,
        reason: 'invalid_token',
      });
      throw new UnauthorizedException('Token de reset inválido');
    }

    // Verificar que el token no haya expirado
    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      this.customLogger.logBusinessEvent('password_reset_failed', {
        userId: user.id,
        reason: 'token_expired',
      });
      throw new UnauthorizedException('Token de reset expirado');
    }

    // Hash de la nueva contraseña con rounds seguros
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Actualizar la contraseña y limpiar el token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    // Revocar todas las sesiones activas por seguridad
    try {
      await (this.prisma as any).session?.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      this.logger.warn(`Failed to revoke sessions: ${error.message}`);
    }

    this.customLogger.logBusinessEvent('password_reset_success', {
      userId: user.id,
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Logout (en JWT es principalmente un cliente-side operation)
   * Este endpoint devuelve confirmación de logout
   * 
   * @returns Mensaje de confirmación
   */
  async logout(accessToken?: string, userId?: string): Promise<{ message: string }> {
    // Revocar refresh asociado si es posible
    if (userId) {
      try {
        await (this.prisma as any).session?.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        this.customLogger.logBusinessEvent('user_logout', { userId });
      } catch (error) {
        this.logger.warn(`Session revocation failed: ${error.message}`);
      }
    }
    return { message: 'Sesión cerrada exitosamente' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    if (!userId) throw new BadRequestException('userId requerido');
    try {
      await (this.prisma as any).session?.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.customLogger.logBusinessEvent('user_logout_all', { userId });
    } catch (error) {
      this.logger.warn(`Session revocation failed: ${error.message}`);
    }
    return { message: 'Todas las sesiones cerradas' };
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.customLogger.logBusinessEvent('email_verification_failed', {
        email,
        reason: 'user_not_found',
      });
      throw new UnauthorizedException('Token inválido');
    }
    try {
      const rec = await (this.prisma as any).emailVerificationToken?.findUnique({ where: { userId: user.id } });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      if (!rec || rec.tokenHash !== tokenHash || new Date(rec.expiresAt) < new Date()) {
        this.customLogger.logBusinessEvent('email_verification_failed', {
          userId: user.id,
          reason: 'invalid_or_expired_token',
        });
        throw new UnauthorizedException('Token inválido');
      }
      await this.prisma.user.update({ where: { id: user.id }, data: { /* flag opcional si existe */ } as any });
      await (this.prisma as any).emailVerificationToken?.delete({ where: { userId: user.id } });
      this.customLogger.logBusinessEvent('email_verified', {
        userId: user.id,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Email verification failed: ${error.message}`);
    }
  }
}
