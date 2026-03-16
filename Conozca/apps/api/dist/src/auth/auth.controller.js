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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./auth.dto");
const auth_guard_1 = require("./auth.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async refresh(refreshTokenDto) {
        return this.authService.refresh(refreshTokenDto.refresh_token);
    }
    async logout(req) {
        const headers = req?.headers || {};
        const token = headers["authorization"]?.toString().replace("Bearer ", "") || "";
        return this.authService.logout(token, req.user?.sub);
    }
    async logoutAll(req) {
        return this.authService.logoutAll(req.user?.sub);
    }
    async verifyEmail(payload) {
        await this.authService.verifyEmail(payload.email, payload.token);
        return { message: "Email verificado" };
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("register"),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: "Registrar nuevo usuario",
        description: "Crea una cuenta de usuario y retorna tokens de autenticación. Rate limit: 3 requests por minuto.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.RegisterDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Usuario registrado exitosamente",
        type: auth_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Datos inválidos o email ya registrado",
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: "Demasiadas solicitudes - rate limit excedido",
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("login"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: "Iniciar sesión",
        description: "Autentica un usuario y retorna tokens de acceso. Rate limit: 5 requests por minuto.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Login exitoso",
        type: auth_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: "Credenciales inválidas",
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: "Demasiadas solicitudes - rate limit excedido",
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("refresh"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Refrescar token de acceso",
        description: "Obtiene un nuevo access token usando un refresh token válido.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.RefreshTokenDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Token refrescado exitosamente",
        type: auth_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: "Refresh token inválido o expirado",
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Cerrar sesión",
        description: "Revoca el refresh token del usuario autenticado. Requiere access token válido.",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Sesión cerrada exitosamente",
        schema: {
            type: "object",
            properties: {
                message: { type: "string", example: "Logout successful" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: "No autenticado - token inválido o expirado",
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("logout-all"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Cerrar todas las sesiones",
        description: "Revoca todos los refresh tokens del usuario autenticado.",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Todas las sesiones cerradas exitosamente",
        schema: {
            type: "object",
            properties: {
                message: { type: "string", example: "All sessions logged out" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: "No autenticado - token inválido o expirado",
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Post)("verify-email"),
    (0, swagger_1.ApiOperation)({
        summary: "Verificar email",
        description: "Confirma el email del usuario usando el token recibido por correo.",
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                email: { type: "string", example: "user@example.com" },
                token: { type: "string", example: "abc123def456..." },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Email verificado exitosamente",
        schema: {
            type: "object",
            properties: {
                message: { type: "string", example: "Email verificado" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Token inválido o expirado",
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)("forgot-password"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 2, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: "Solicitar reset de contraseña",
        description: "Envía un email con token para resetear la contraseña. Rate limit: 2 requests por minuto.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ForgotPasswordDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Email de reset enviado (siempre retorna 200 por seguridad)",
        schema: {
            type: "object",
            properties: {
                message: { type: "string", example: "Password reset email sent" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: "Demasiadas solicitudes - rate limit excedido",
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)("reset-password"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Resetear contraseña",
        description: "Establece una nueva contraseña usando el token recibido por email.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ResetPasswordDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Contraseña reseteada exitosamente",
        schema: {
            type: "object",
            properties: {
                message: { type: "string", example: "Password reset successful" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Token inválido o expirado",
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)("auth"),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map