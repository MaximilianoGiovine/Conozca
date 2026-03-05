export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class UserDto {
    id: string;
    email: string;
    name: string;
    role: string;
}
export declare class AuthResponseDto {
    access_token: string;
    refresh_token: string;
    user: UserDto;
}
export declare class RefreshTokenDto {
    refresh_token: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    email: string;
    reset_token: string;
    password: string;
}
