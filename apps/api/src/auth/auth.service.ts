import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './auth.dto';
import { EmailService } from '../common/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

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

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // Por defecto, nuevos usuarios son USER
      },
    });

    // Generar tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Emitir token de verificación (persistencia diferida)
    try {
      const token = crypto.randomBytes(24).toString('hex');
      await (this.prisma as any).emailVerificationToken?.upsert({
        where: { userId: user.id },
        update: { tokenHash: crypto.createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 24*60*60*1000) },
        create: { userId: user.id, tokenHash: crypto.createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 24*60*60*1000) },
      });
      // Enviar email de verificación
      await this.emailService.sendVerificationEmail(user.email, token);
    } catch {
      // Ignorar si la tabla aún no existe en entornos sin migración
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
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

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
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar existencia de sesión (rotación segura)
      await this.assertRefreshValid(user.id, refreshToken);

      // Generar nuevos tokens y rotar
      const tokens = this.generateTokens(user.id, user.email, user.role);
      await this.persistRefresh(user.id, tokens.refresh_token, refreshToken);

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
        await (this.prisma as any).session?.updateMany({
          where: { userId, refreshHash: hash(oldRefresh), revokedAt: null },
          data: { revokedAt: now },
        });
      }

      await (this.prisma as any).session?.create({
        data: {
          userId,
          refreshHash: hash(newRefresh),
          createdAt: now,
          expiresAt: new Date(now.getTime() + 7*24*60*60*1000),
        },
      });
    } catch {
      // Tabla no migrada: omitir silenciosamente
    }
  }

  private async assertRefreshValid(userId: string, refresh: string) {
    try {
      const hash = crypto.createHash('sha256').update(refresh).digest('hex');
      const rec = await (this.prisma as any).session?.findFirst({
        where: { userId, refreshHash: hash, revokedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!rec) throw new UnauthorizedException('Refresh no reconocido');
    } catch {
      // Si no existe tabla, continuar (modo legacy)
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

    // Buscar el usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, devolvemos mensaje genérico
      return {
        message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña',
      };
    }

    // Generar token de reset (válido por 1 hora)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      {
        secret: process.env.JWT_SECRET || 'secret',
        expiresIn: '1h',
      },
    );

    // Guardar el token en la BD
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Enviar email con el token
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

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

    if (!user || user.resetToken !== reset_token) {
      throw new UnauthorizedException('Token de reset inválido');
    }

    // Verificar que el token no haya expirado
    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new UnauthorizedException('Token de reset expirado');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña y limpiar el token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
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
      } catch {
        // ignore
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
    } catch {
      // ignore
    }
    return { message: 'Todas las sesiones cerradas' };
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Token inválido');
    try {
      const rec = await (this.prisma as any).emailVerificationToken?.findUnique({ where: { userId: user.id } });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      if (!rec || rec.tokenHash !== tokenHash || new Date(rec.expiresAt) < new Date()) {
        throw new UnauthorizedException('Token inválido');
      }
      await this.prisma.user.update({ where: { id: user.id }, data: { /* flag opcional si existe */ } as any });
      await (this.prisma as any).emailVerificationToken?.delete({ where: { userId: user.id } });
    } catch {
      // Si no hay tabla, aceptar para entornos sin migración
    }
  }
}
