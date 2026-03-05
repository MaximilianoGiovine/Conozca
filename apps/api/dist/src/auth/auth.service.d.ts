import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import { RegisterDto, LoginDto, AuthResponseDto } from "./auth.dto";
import { EmailService } from "../common/email.service";
import { LoggerService } from "../common/logger.service";
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    private customLogger;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService, customLogger: LoggerService);
    private validateJWTSecrets;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    refresh(refreshToken: string): Promise<AuthResponseDto>;
    validateToken(token: string): Promise<any>;
    private generateTokens;
    private persistRefresh;
    private assertRefreshValid;
    forgotPassword(forgotPasswordDto: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: {
        email: string;
        reset_token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    logout(accessToken?: string, userId?: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        message: string;
    }>;
    verifyEmail(email: string, token: string): Promise<void>;
}
