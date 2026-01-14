import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import { RegisterDto, LoginDto, AuthResponseDto } from "./auth.dto";
import { EmailService } from "../common/email.service";
import { LoggerService } from "../common/logger.service";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

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
    // Validate JWT secrets on startup
    this.validateJWTSecrets();
  }

  private validateJWTSecrets() {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error("CRITICAL: JWT_SECRET must be at least 32 characters long. Check your .env file.");
    }
    if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
      throw new Error("CRITICAL: JWT_REFRESH_SECRET must be at least 32 characters long. Check your .env file.");
    }
    if (jwtSecret === jwtRefreshSecret) {
      throw new Error("CRITICAL: JWT_SECRET and JWT_REFRESH_SECRET must be different.");
    }
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER",
      },
    });

    // Log security event
    this.customLogger.logBusinessEvent("user_registered", {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Create verification token
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      await this.prisma.emailVerificationToken.upsert({
        where: { userId: user.id },
        update: {
          tokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        create: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await this.emailService.sendVerificationEmail(user.email, token);
    } catch (error) {
      this.logger.warn(`Email verification token creation failed: ${error.message}`);
      // Do not block registration if verification fails
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
   * User Login
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.customLogger.logBusinessEvent("login_failed", {
        email,
        reason: "invalid_password",
      });
      throw new UnauthorizedException("Invalid email or password");
    }

    this.customLogger.logBusinessEvent("user_login", {
      userId: user.id,
      email: user.email,
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

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
   * Refresh Tokens
   */
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) throw new InternalServerErrorException("JWT_REFRESH_SECRET not configured");

      const payload = this.jwtService.verify(refreshToken, {
        secret: secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.customLogger.logBusinessEvent("refresh_failed", {
          reason: "user_not_found",
          userId: payload.sub,
        });
        throw new UnauthorizedException("User not found");
      }

      await this.assertRefreshValid(user.id, refreshToken);

      const tokens = this.generateTokens(user.id, user.email, user.role);
      await this.persistRefresh(user.id, tokens.refresh_token, refreshToken);

      this.customLogger.logBusinessEvent("token_refreshed", {
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
      this.customLogger.logBusinessEvent("refresh_failed", {
        reason: error.message,
      });
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Validate Access Token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new InternalServerErrorException("JWT_SECRET not configured");

      return this.jwtService.verify(token, {
        secret: secret,
      });
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private generateTokens(
    userId: string,
    email: string,
    role: string,
  ): { access_token: string; refresh_token: string } {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new InternalServerErrorException("JWT secrets are missing in env");
    }

    const payload = { email, sub: userId, role };
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    const access_token = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: "15m",
      jwtid: accessJti,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: "7d",
      jwtid: refreshJti,
    });

    return { access_token, refresh_token };
  }

  private async persistRefresh(
    userId: string,
    newRefresh: string,
    oldRefresh?: string,
  ) {
    try {
      const hash = (v: string) =>
        crypto.createHash("sha256").update(v).digest("hex");
      const now = new Date();

      if (oldRefresh) {
        const result = await this.prisma.session.updateMany({
          where: { userId, refreshHash: hash(oldRefresh), revokedAt: null },
          data: { revokedAt: now },
        });

        // Token reuse detection
        if (result.count === 0) {
          this.customLogger.logBusinessEvent("refresh_token_reuse_detected", {
            userId,
            severity: "HIGH",
          });
          // Revoke ALL user sessions
          await this.prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: now },
          });
          throw new UnauthorizedException(
            "Token reuse detected - all sessions revoked",
          );
        }
      }

      await this.prisma.session.create({
        data: {
          userId,
          refreshHash: hash(newRefresh),
          createdAt: now,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
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
      const hash = crypto.createHash("sha256").update(refresh).digest("hex");
      const rec = await this.prisma.session.findFirst({
        where: {
          userId,
          refreshHash: hash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (!rec) {
        this.customLogger.logBusinessEvent("invalid_refresh_token", {
          userId,
          reason: "not_found_or_revoked",
        });
        throw new UnauthorizedException("Start session failed");
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Session validation failed: ${error.message}`);
    }
  }

  /**
   * Request Password Reset
   */
  async forgotPassword(forgotPasswordDto: {
    email: string;
  }): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const startTime = Date.now();
    const MIN_RESPONSE_TIME = 1000;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetTokenHash,
          resetTokenExpires,
        },
      });

      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      this.customLogger.logBusinessEvent("password_reset_requested", {
        userId: user.id,
        email: user.email,
      });
    } else {
      await bcrypt.hash("fake-password", BCRYPT_ROUNDS);
    }

    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MIN_RESPONSE_TIME) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_RESPONSE_TIME - elapsedTime),
      );
    }

    return {
      message:
        "If the email exists, you will receive instructions to reset your password",
    };
  }

  /**
   * Reset Password
   */
  async resetPassword(resetPasswordDto: {
    email: string;
    reset_token: string;
    password: string;
  }): Promise<{ message: string }> {
    const { email, reset_token, password } = resetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(reset_token)
      .digest("hex");

    if (!user || user.resetToken !== resetTokenHash) {
      this.customLogger.logBusinessEvent("password_reset_failed", {
        email,
        reason: "invalid_token",
      });
      throw new UnauthorizedException("Invalid reset token");
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      this.customLogger.logBusinessEvent("password_reset_failed", {
        userId: user.id,
        reason: "token_expired",
      });
      throw new UnauthorizedException("Reset token expired");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    try {
      await this.prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      this.logger.warn(`Failed to revoke sessions: ${error.message}`);
    }

    this.customLogger.logBusinessEvent("password_reset_success", {
      userId: user.id,
    });

    return { message: "Password updated successfully" };
  }

  async logout(
    accessToken?: string,
    userId?: string,
  ): Promise<{ message: string }> {
    if (userId) {
      try {
        await this.prisma.session.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        this.customLogger.logBusinessEvent("user_logout", { userId });
      } catch (error) {
        this.logger.warn(`Session revocation failed: ${error.message}`);
      }
    }
    return { message: "Session closed successfully" };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    if (!userId) throw new BadRequestException("userId required");
    try {
      await this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.customLogger.logBusinessEvent("user_logout_all", { userId });
    } catch (error) {
      this.logger.warn(`Session revocation failed: ${error.message}`);
    }
    return { message: "All sessions closed" };
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.customLogger.logBusinessEvent("email_verification_failed", {
        email,
        reason: "user_not_found",
      });
      throw new UnauthorizedException("Invalid token");
    }
    try {
      const rec = await this.prisma.emailVerificationToken.findUnique(
        { where: { userId: user.id } },
      );
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      if (
        !rec ||
        rec.tokenHash !== tokenHash ||
        new Date(rec.expiresAt) < new Date()
      ) {
        this.customLogger.logBusinessEvent("email_verification_failed", {
          userId: user.id,
          reason: "invalid_or_expired_token",
        });
        throw new UnauthorizedException("Invalid token");
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          // Update confirmation if needed
        },
      });
      await this.prisma.emailVerificationToken.delete({
        where: { userId: user.id },
      });
      this.customLogger.logBusinessEvent("email_verified", {
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
