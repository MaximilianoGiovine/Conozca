"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RefreshTokenDto = exports.AuthResponseDto = exports.UserDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
    email;
    password;
    name;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Email del usuario",
        example: "usuario@conozca.org",
        format: "email",
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Contraseña del usuario (mínimo 8 caracteres)",
        example: "SecurePass123!",
        minLength: 8,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nombre completo del usuario",
        example: "Juan Pérez",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Email del usuario",
        example: "usuario@conozca.org",
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Contraseña del usuario",
        example: "SecurePass123!",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class UserDto {
    id;
    email;
    name;
    role;
}
exports.UserDto = UserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID único del usuario",
        example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    __metadata("design:type", String)
], UserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Email del usuario",
        example: "usuario@conozca.org",
    }),
    __metadata("design:type", String)
], UserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nombre del usuario",
        example: "Juan Pérez",
    }),
    __metadata("design:type", String)
], UserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Rol del usuario",
        enum: ["USER", "EDITOR", "ADMIN"],
        example: "USER",
    }),
    __metadata("design:type", String)
], UserDto.prototype, "role", void 0);
class AuthResponseDto {
    access_token;
    refresh_token;
    user;
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Token de acceso JWT (válido por 15 minutos)",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "access_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Token de refresco (válido por 7 días)",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refresh_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Datos del usuario autenticado",
        type: UserDto,
    }),
    __metadata("design:type", UserDto)
], AuthResponseDto.prototype, "user", void 0);
class RefreshTokenDto {
    refresh_token;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Refresh token obtenido en login/register",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refresh_token", void 0);
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Email del usuario que olvidó su contraseña",
        example: "usuario@conozca.org",
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    email;
    reset_token;
    password;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Email del usuario",
        example: "usuario@conozca.org",
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Token de reset recibido por email",
        example: "abc123def456...",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "reset_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nueva contraseña (mínimo 8 caracteres)",
        example: "NewSecurePass123!",
        minLength: 8,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
//# sourceMappingURL=auth.dto.js.map