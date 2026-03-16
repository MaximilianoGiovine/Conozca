import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto } from "./auth.dto";
import type { AuthenticatedRequest } from "../common/interfaces/authenticated-request.interface";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    logoutAll(req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    verifyEmail(payload: {
        email: string;
        token: string;
    }): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
