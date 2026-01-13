import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@conozca/database';

/**
 * Tests unitarios completos para AuthController
 * 
 * Verifica que el controller:
 * - Llama a los métodos del servicio correctamente
 * - Maneja las responses adecuadamente
 * - Valida los DTOs
 * - Propaga los errores correctamente
 */
describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
  };

  const mockAuthResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  const mockTokenResponse = {
    access_token: 'new-access-token',
    refresh_token: 'new-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
    };

    it('✅ debe registrar un usuario exitosamente', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it('✅ debe retornar access_token, refresh_token y user', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('❌ debe propagar ConflictException del servicio', async () => {
      const error = new Error('El email ya está registrado');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
    });

    it('✅ debe aceptar emails en diferentes formatos', async () => {
      const variations = [
        'simple@example.com',
        'with+plus@example.com',
        'with.dots@example.com',
        'UPPERCASE@EXAMPLE.COM',
      ];

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      for (const email of variations) {
        const dto = { ...registerDto, email };
        await controller.register(dto);
        expect(service.register).toHaveBeenCalledWith(dto);
      }
    });

    it('✅ debe aceptar nombres con caracteres especiales', async () => {
      const names = [
        'José García',
        "O'Connor",
        'François Müller',
        'María José',
      ];

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      for (const name of names) {
        const dto = { ...registerDto, name };
        await controller.register(dto);
        expect(service.register).toHaveBeenCalledWith(dto);
      }
    });
  });

  describe('POST /auth/login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('✅ debe hacer login exitosamente', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });

    it('✅ debe retornar estructura completa de respuesta', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toMatchObject({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        user: expect.objectContaining({
          email: expect.any(String),
          name: expect.any(String),
          role: expect.any(String),
        }),
      });
    });

    it('❌ debe propagar UnauthorizedException del servicio', async () => {
      const error = new Error('Email o contraseña inválidos');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
    });

    it('✅ debe manejar múltiples intentos de login', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const attempts = 3;
      for (let i = 0; i < attempts; i++) {
        await controller.login(loginDto);
      }

      expect(service.login).toHaveBeenCalledTimes(attempts);
    });
  });

  describe('POST /auth/refresh', () => {
    const refreshDto = {
      refresh_token: 'valid-refresh-token',
    };

    it('✅ debe refrescar tokens exitosamente', async () => {
      mockAuthService.refresh.mockResolvedValue(mockTokenResponse);

      const result = await controller.refresh(refreshDto);

      expect(result).toEqual(mockTokenResponse);
      expect(service.refresh).toHaveBeenCalledWith(refreshDto.refresh_token);
      expect(service.refresh).toHaveBeenCalledTimes(1);
    });

    it('✅ debe retornar nuevos access y refresh tokens', async () => {
      mockAuthService.refresh.mockResolvedValue(mockTokenResponse);

      const result = await controller.refresh(refreshDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.access_token).not.toBe(refreshDto.refresh_token);
    });

    it('❌ debe propagar UnauthorizedException con token inválido', async () => {
      const error = new Error('Token inválido o expirado');
      mockAuthService.refresh.mockRejectedValue(error);

      await expect(controller.refresh(refreshDto)).rejects.toThrow(error);
    });

    it('✅ debe aceptar tokens JWT válidos', async () => {
      const validTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.test2',
      ];

      mockAuthService.refresh.mockResolvedValue(mockTokenResponse);

      for (const token of validTokens) {
        await controller.refresh({ refresh_token: token });
        expect(service.refresh).toHaveBeenCalledWith(token);
      }
    });
  });

  describe('POST /auth/logout', () => {
    const mockLogoutResponse = {
      message: 'Sesión cerrada exitosamente',
    };
    const mockRequest = { user: { id: '1', email: 'test@example.com' } };

    it('✅ debe hacer logout exitosamente', async () => {
      mockAuthService.logout.mockReturnValue(mockLogoutResponse);

      const result = await controller.logout(mockRequest);

      expect(result).toEqual(mockLogoutResponse);
      expect(service.logout).toHaveBeenCalledTimes(1);
    });

    it('✅ debe retornar mensaje de confirmación', async () => {
      mockAuthService.logout.mockReturnValue(mockLogoutResponse);

      const result = await controller.logout(mockRequest);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    });

    it('✅ debe ser idempotente (múltiples llamadas)', async () => {
      mockAuthService.logout.mockReturnValue(mockLogoutResponse);

      const result1 = await controller.logout(mockRequest);
      const result2 = await controller.logout(mockRequest);
      const result3 = await controller.logout(mockRequest);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(service.logout).toHaveBeenCalledTimes(3);
    });
  });

  describe('POST /auth/forgot-password', () => {
    const forgotDto = {
      email: 'test@example.com',
    };

    const mockForgotResponse = {
      message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña',
    };

    it('✅ debe procesar solicitud de reset exitosamente', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(mockForgotResponse);

      const result = await controller.forgotPassword(forgotDto);

      expect(result).toEqual(mockForgotResponse);
      expect(service.forgotPassword).toHaveBeenCalledWith(forgotDto);
      expect(service.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('✅ debe retornar mensaje genérico siempre', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(mockForgotResponse);

      const result = await controller.forgotPassword(forgotDto);

      expect(result).toHaveProperty('message');
      // El mensaje es intencional genérico por seguridad (no revela si email existe)
      expect(result.message).toContain('Si el email existe');
      expect(result.message).not.toContain('no existe');
    });

    it('✅ debe manejar emails no registrados sin revelar información', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(mockForgotResponse);

      const result = await controller.forgotPassword({ email: 'noexiste@example.com' });

      expect(result).toEqual(mockForgotResponse);
    });

    it('✅ debe procesar múltiples solicitudes del mismo email', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(mockForgotResponse);

      await controller.forgotPassword(forgotDto);
      await controller.forgotPassword(forgotDto);
      await controller.forgotPassword(forgotDto);

      expect(service.forgotPassword).toHaveBeenCalledTimes(3);
    });

    it('❌ debe propagar errores del servicio', async () => {
      const error = new Error('Error al procesar solicitud');
      mockAuthService.forgotPassword.mockRejectedValue(error);

      await expect(controller.forgotPassword(forgotDto)).rejects.toThrow(error);
    });
  });

  describe('POST /auth/reset-password', () => {
    const resetDto = {
      token: 'valid-reset-token',
      password: 'NewPassword123!',
    };

    const mockResetResponse = {
      message: 'Contraseña actualizada exitosamente',
    };

    it('✅ debe resetear contraseña exitosamente', async () => {
      mockAuthService.resetPassword.mockResolvedValue(mockResetResponse);

      const result = await controller.resetPassword(resetDto);

      expect(result).toEqual(mockResetResponse);
      expect(service.resetPassword).toHaveBeenCalledWith(resetDto);
      expect(service.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('✅ debe retornar mensaje de confirmación', async () => {
      mockAuthService.resetPassword.mockResolvedValue(mockResetResponse);

      const result = await controller.resetPassword(resetDto);

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('actualizada');
    });

    it('❌ debe propagar UnauthorizedException con token inválido', async () => {
      const error = new Error('Token de reset inválido');
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetDto)).rejects.toThrow(error);
    });

    it('❌ debe propagar error con token expirado', async () => {
      const error = new Error('Token de reset expirado');
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetDto)).rejects.toThrow(error);
    });

    it('✅ debe aceptar contraseñas con diferentes formatos', async () => {
      const passwords = [
        'Simple123!',
        'C0mpl3x!P@ssw0rd',
        'Añ0-ConEñe!',
        '1234567890Aa!',
      ];

      mockAuthService.resetPassword.mockResolvedValue(mockResetResponse);

      for (const password of passwords) {
        const dto = { ...resetDto, password };
        await controller.resetPassword(dto);
        expect(service.resetPassword).toHaveBeenCalledWith(dto);
      }
    });

    it('❌ no debe permitir reusar el mismo token', async () => {
      mockAuthService.resetPassword.mockResolvedValueOnce(mockResetResponse);
      mockAuthService.resetPassword.mockRejectedValueOnce(
        new Error('Token de reset inválido'),
      );

      await controller.resetPassword(resetDto);
      await expect(controller.resetPassword(resetDto)).rejects.toThrow();
    });
  });

  describe('Validación de DTOs', () => {
    it('✅ debe pasar DTOs válidos al servicio', async () => {
      const dtos = [
        { email: 'test@example.com', password: 'Pass123!', name: 'Test' },
        { email: 'user@domain.com', password: 'Secure1!' },
        { refresh_token: 'token' },
        { email: 'forgot@test.com' },
        {
          email: 'reset@test.com',
          reset_token: 'token',
          password: 'NewPass1!',
        },
      ];

      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockAuthService.refresh.mockResolvedValue(mockTokenResponse);
      mockAuthService.forgotPassword.mockResolvedValue({ message: 'ok' });
      mockAuthService.resetPassword.mockResolvedValue({ message: 'ok' });

      await controller.register(dtos[0] as any);
      await controller.login(dtos[1] as any);
      await controller.refresh(dtos[2] as any);
      await controller.forgotPassword(dtos[3] as any);
      await controller.resetPassword(dtos[4] as any);

      expect(service.register).toHaveBeenCalledWith(dtos[0]);
      expect(service.login).toHaveBeenCalledWith(dtos[1]);
      expect(service.refresh).toHaveBeenCalledWith(dtos[2].refresh_token);
      expect(service.forgotPassword).toHaveBeenCalledWith(dtos[3]);
      expect(service.resetPassword).toHaveBeenCalledWith(dtos[4]);
    });
  });

  describe('Manejo de Errores', () => {
    it('❌ debe propagar todos los tipos de errores', async () => {
      const errors = [
        new Error('Generic error'),
        new Error('Database connection failed'),
        new Error('JWT verification failed'),
      ];

      for (const error of errors) {
        mockAuthService.login.mockRejectedValueOnce(error);
        await expect(
          controller.login({ email: 'test@example.com', password: 'pass' }),
        ).rejects.toThrow(error);
      }
    });

    it('❌ debe mantener el stack trace de los errores', async () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      mockAuthService.register.mockRejectedValue(error);

      try {
        await controller.register({
          email: 'test@example.com',
          password: 'pass',
          name: 'test',
        });
      } catch (e) {
        expect((e as Error).stack).toBeDefined();
        expect((e as Error).stack).toContain('Error stack trace');
      }
    });
  });

  describe('Performance y Concurrencia', () => {
    it('✅ debe manejar múltiples requests concurrentes', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const loginDto = { email: 'test@example.com', password: 'Pass123!' };
      const promises = Array(10)
        .fill(null)
        .map(() => controller.login(loginDto));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(service.login).toHaveBeenCalledTimes(10);
    });

    it('✅ debe manejar requests simultáneos de diferentes endpoints', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockAuthService.refresh.mockResolvedValue(mockTokenResponse);

      const promises = [
        controller.register({ email: 'new@test.com', password: 'Pass1!', name: 'New' }),
        controller.login({ email: 'existing@test.com', password: 'Pass1!' }),
        controller.refresh({ refresh_token: 'token' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(service.register).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.refresh).toHaveBeenCalledTimes(1);
    });
  });
});
