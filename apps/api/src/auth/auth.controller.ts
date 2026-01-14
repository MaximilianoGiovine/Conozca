import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./auth.dto";
import { AuthGuard } from "./auth.guard";

/**
 * AuthController
 *
 * Controlador que expone los endpoints de autenticación:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/refresh
 * - POST /auth/logout
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 */
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   *
   * Registrar un nuevo usuario
   *
   * @param registerDto - Email, contraseña y nombre
   * @returns AuthResponseDto con tokens y datos del usuario
   *
   * @example
   * POST /auth/register
   * {
   *   "email": "user@example.com",
   *   "password": "secure123",
   *   "name": "John Doe"
   * }
   */
  @Post("register")
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({
    summary: "Registrar nuevo usuario",
    description:
      "Crea una cuenta de usuario y retorna tokens de autenticación. Rate limit: 3 requests por minuto.",
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "Usuario registrado exitosamente",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o email ya registrado",
  })
  @ApiResponse({
    status: 429,
    description: "Demasiadas solicitudes - rate limit excedido",
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   *
   * Iniciar sesión con email y contraseña
   *
   * @param loginDto - Email y contraseña
   * @returns AuthResponseDto con tokens y datos del usuario
   *
   * @example
   * POST /auth/login
   * {
   *   "email": "user@example.com",
   *   "password": "secure123"
   * }
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({
    summary: "Iniciar sesión",
    description:
      "Autentica un usuario y retorna tokens de acceso. Rate limit: 5 requests por minuto.",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Login exitoso",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Credenciales inválidas",
  })
  @ApiResponse({
    status: 429,
    description: "Demasiadas solicitudes - rate limit excedido",
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/refresh
   *
   * Refrescar access token usando refresh token
   *
   * @param refreshTokenDto - Refresh token
   * @returns AuthResponseDto con nuevo access token
   *
   * @example
   * POST /auth/refresh
   * {
   *   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refrescar token de acceso",
    description:
      "Obtiene un nuevo access token usando un refresh token válido.",
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: "Token refrescado exitosamente",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token inválido o expirado",
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refresh(refreshTokenDto.refresh_token);
  }

  /**
   * POST /auth/logout
   *
   * Cerrar sesión (revoca el refresh token)
   *
   * @param request - Request con usuario autenticado
   * @returns Mensaje de éxito
   *
   * @example
   * POST /auth/logout
   * Headers: { Authorization: "Bearer <access_token>" }
   */
  @Post("logout")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cerrar sesión",
    description:
      "Revoca el refresh token del usuario autenticado. Requiere access token válido.",
  })
  @ApiResponse({
    status: 200,
    description: "Sesión cerrada exitosamente",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Logout successful" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado - token inválido o expirado",
  })
  async logout(@Request() req: any): Promise<{ message: string }> {
    const headers = req?.headers || {};
    const token =
      headers["authorization"]?.toString().replace("Bearer ", "") || "";
    return this.authService.logout(token, req.user?.sub);
  }

  /**
   * POST /auth/logout-all
   * Cerrar todas las sesiones activas del usuario (revocación global)
   */
  @Post("logout-all")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cerrar todas las sesiones",
    description: "Revoca todos los refresh tokens del usuario autenticado.",
  })
  @ApiResponse({
    status: 200,
    description: "Todas las sesiones cerradas exitosamente",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "All sessions logged out" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado - token inválido o expirado",
  })
  async logoutAll(@Request() req: any): Promise<{ message: string }> {
    return this.authService.logoutAll(req.user?.sub);
  }

  /**
   * POST /auth/verify-email
   * Confirmar la verificación de email mediante token
   */
  @Post("verify-email")
  @ApiOperation({
    summary: "Verificar email",
    description:
      "Confirma el email del usuario usando el token recibido por correo.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
        token: { type: "string", example: "abc123def456..." },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Email verificado exitosamente",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Email verificado" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Token inválido o expirado",
  })
  async verifyEmail(
    @Body() payload: { email: string; token: string },
  ): Promise<{ message: string }> {
    await this.authService.verifyEmail(payload.email, payload.token);
    return { message: "Email verificado" };
  }

  /**
   * POST /auth/forgot-password
   *
   * Solicitar token para resetear contraseña
   *
   * @param forgotPasswordDto - Email del usuario
   * @returns Mensaje de confirmación
   *
   * @example
   * POST /auth/forgot-password
   * {
   *   "email": "user@example.com"
   * }
   */
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 2 requests per minute
  @ApiOperation({
    summary: "Solicitar reset de contraseña",
    description:
      "Envía un email con token para resetear la contraseña. Rate limit: 2 requests por minuto.",
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Email de reset enviado (siempre retorna 200 por seguridad)",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Password reset email sent" },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: "Demasiadas solicitudes - rate limit excedido",
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * POST /auth/reset-password
   *
   * Resetear contraseña con token válido
   *
   * @param resetPasswordDto - Token y nueva contraseña
   * @returns Mensaje de éxito
   *
   * @example
   * POST /auth/reset-password
   * {
   *   "email": "user@example.com",
   *   "reset_token": "abc123def456...",
   *   "password": "newPassword123"
   * }
   */
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Resetear contraseña",
    description:
      "Establece una nueva contraseña usando el token recibido por email.",
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Contraseña reseteada exitosamente",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Password reset successful" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Token inválido o expirado",
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
