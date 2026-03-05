"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const email_service_1 = require("../common/email.service");
const logger_service_1 = require("../common/logger.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const BCRYPT_ROUNDS = 12;
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    emailService;
    customLogger;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, emailService, customLogger) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.customLogger = customLogger;
        this.validateJWTSecrets();
        this.logger.log("AuthService initialized");
    }
    validateJWTSecrets() {
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
    async register(registerDto) {
        const { email, password, name } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException("This email is already registered");
        }
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "USER",
            },
        });
        this.customLogger.logBusinessEvent("user_registered", {
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const tokens = this.generateTokens(user.id, user.email, user.role);
        await this.persistRefresh(user.id, tokens.refresh_token, undefined);
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
        }
        catch (error) {
            this.logger.warn(`Email verification token creation failed: ${error.message}`);
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
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.customLogger.logBusinessEvent("login_failed", {
                email,
                reason: "invalid_password",
            });
            throw new common_1.UnauthorizedException("Invalid email or password");
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
    async refresh(refreshToken) {
        try {
            const secret = process.env.JWT_REFRESH_SECRET;
            if (!secret)
                throw new common_1.InternalServerErrorException("JWT_REFRESH_SECRET not configured");
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
                throw new common_1.UnauthorizedException("User not found");
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
        }
        catch (_error) {
            this.customLogger.logBusinessEvent("refresh_failed", {
                reason: _error.message,
            });
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
    }
    async validateToken(token) {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret)
                throw new common_1.InternalServerErrorException("JWT_SECRET not configured");
            return await Promise.resolve(this.jwtService.verify(token, {
                secret: secret,
            }));
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
    generateTokens(userId, email, role) {
        const accessSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!accessSecret || !refreshSecret) {
            throw new common_1.InternalServerErrorException("JWT secrets are missing in env");
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
    async persistRefresh(userId, newRefresh, oldRefresh) {
        try {
            const hash = (v) => crypto.createHash("sha256").update(v).digest("hex");
            const now = new Date();
            if (oldRefresh) {
                const result = await this.prisma.session.updateMany({
                    where: { userId, refreshHash: hash(oldRefresh), revokedAt: null },
                    data: { revokedAt: now },
                });
                if (result.count === 0) {
                    this.customLogger.logBusinessEvent("refresh_token_reuse_detected", {
                        userId,
                        severity: "HIGH",
                    });
                    await this.prisma.session.updateMany({
                        where: { userId, revokedAt: null },
                        data: { revokedAt: now },
                    });
                    throw new common_1.UnauthorizedException("Token reuse detected - all sessions revoked");
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
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.warn(`Session persistence failed: ${error.message}`);
        }
    }
    async assertRefreshValid(userId, refresh) {
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
                throw new common_1.UnauthorizedException("Start session failed");
            }
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.warn(`Session validation failed: ${error.message}`);
        }
    }
    async forgotPassword(forgotPasswordDto) {
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
        }
        else {
            await bcrypt.hash("fake-password", BCRYPT_ROUNDS);
        }
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < MIN_RESPONSE_TIME) {
            await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_TIME - elapsedTime));
        }
        return {
            message: "If the email exists, you will receive instructions to reset your password",
        };
    }
    async resetPassword(resetPasswordDto) {
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
            throw new common_1.UnauthorizedException("Invalid reset token");
        }
        if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            this.customLogger.logBusinessEvent("password_reset_failed", {
                userId: user.id,
                reason: "token_expired",
            });
            throw new common_1.UnauthorizedException("Reset token expired");
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
        }
        catch (error) {
            this.logger.warn(`Failed to revoke sessions: ${error.message}`);
        }
        this.customLogger.logBusinessEvent("password_reset_success", {
            userId: user.id,
        });
        return { message: "Password updated successfully" };
    }
    async logout(accessToken, userId) {
        if (userId) {
            try {
                await this.prisma.session.updateMany({
                    where: { userId, revokedAt: null },
                    data: { revokedAt: new Date() },
                });
                this.customLogger.logBusinessEvent("user_logout", { userId });
            }
            catch (error) {
                this.logger.warn(`Session revocation failed: ${error.message}`);
            }
        }
        return { message: "Session closed successfully" };
    }
    async logoutAll(userId) {
        if (!userId)
            throw new common_1.BadRequestException("userId required");
        try {
            await this.prisma.session.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            this.customLogger.logBusinessEvent("user_logout_all", { userId });
        }
        catch (error) {
            this.logger.warn(`Session revocation failed: ${error.message}`);
        }
        return { message: "All sessions closed" };
    }
    async verifyEmail(email, token) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            this.customLogger.logBusinessEvent("email_verification_failed", {
                email,
                reason: "user_not_found",
            });
            throw new common_1.UnauthorizedException("Invalid token");
        }
        try {
            const rec = await this.prisma.emailVerificationToken.findUnique({
                where: { userId: user.id },
            });
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            if (!rec ||
                rec.tokenHash !== tokenHash ||
                new Date(rec.expiresAt) < new Date()) {
                this.customLogger.logBusinessEvent("email_verification_failed", {
                    userId: user.id,
                    reason: "invalid_or_expired_token",
                });
                throw new common_1.UnauthorizedException("Invalid token");
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: {},
            });
            await this.prisma.emailVerificationToken.delete({
                where: { userId: user.id },
            });
            this.customLogger.logBusinessEvent("email_verified", {
                userId: user.id,
            });
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.warn(`Email verification failed: ${error.message}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        logger_service_1.LoggerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map