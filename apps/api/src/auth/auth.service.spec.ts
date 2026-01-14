import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma.service";
import { EmailService } from "../common/email.service";
import { LoggerService } from "../common/logger.service";
import { Role } from "@conozca/database";

// Mock bcrypt.compare globalmente
jest.mock("bcrypt", () => ({
  ...jest.requireActual("bcrypt"),
  compare: jest.fn(),
  hash: jest.fn(),
}));

/**
 * Tests unitarios completos para AuthService
 *
 * Cubre todos los métodos con múltiples escenarios:
 * - Flujos exitosos
 * - Validaciones de entrada
 * - Manejo de errores
 * - Edge cases
 * - Seguridad
 */
describe("AuthService", () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let emailService: EmailService;
  let loggerService: LoggerService;

  // Mocks
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendNotificationEmail: jest.fn().mockResolvedValue(true),
  };

  const mockLoggerService = {
    logBusinessEvent: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  // Datos de prueba
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    password: "$2b$10$hashedPassword",
    name: "Test User",
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    resetToken: null,
    resetTokenExpires: null,
  };

  const validPassword = "TestPass123!";
  const mockTokens = {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
  };

  beforeEach(async () => {
    // Restore mocks before each test
    jest.restoreAllMocks();

    // Mock environment variables for JWT validation
    process.env.JWT_SECRET = "test-secret-with-at-least-32-characters-long";
    process.env.JWT_REFRESH_SECRET =
      "test-refresh-secret-with-at-least-32-characters";

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerDto = {
      email: "newuser@example.com",
      password: validPassword,
      name: "New User",
    };

    it("✅ debe registrar un nuevo usuario exitosamente", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce(mockTokens.access_token);
      mockJwtService.sign.mockReturnValueOnce(mockTokens.refresh_token);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user).not.toHaveProperty("password");
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it("❌ debe lanzar ConflictException si el email ya existe", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it("✅ debe hashear la contraseña antes de guardar", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(
        "$2b$10$hashedPassword123",
      );
      mockPrismaService.user.create.mockImplementation((data) => {
        expect(data.data.password).not.toBe(validPassword);
        expect(data.data.password).toBe("$2b$10$hashedPassword123");
        return Promise.resolve(mockUser);
      });
      mockJwtService.sign.mockReturnValue("token");

      await service.register(registerDto);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it("✅ debe asignar role USER por defecto", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockImplementation((data) => {
        expect(data.data.role).toBe(Role.USER);
        return Promise.resolve(mockUser);
      });
      mockJwtService.sign.mockReturnValue("token");

      await service.register(registerDto);
    });

    it("❌ debe manejar emails con espacios", async () => {
      const dtoWithSpaces = { ...registerDto, email: "  test@example.com  " };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("token");

      await service.register(dtoWithSpaces);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "  test@example.com  " },
      });
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: validPassword,
    };

    it("✅ debe hacer login exitosamente con credenciales válidas", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce(mockTokens.access_token);
      mockJwtService.sign.mockReturnValueOnce(mockTokens.refresh_token);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(result).toHaveProperty("user");
      expect(result.user).not.toHaveProperty("password");
    });

    it("❌ debe lanzar UnauthorizedException si el usuario no existe", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("❌ debe lanzar UnauthorizedException si la contraseña es incorrecta", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("✅ debe ser case-sensitive con el email", async () => {
      const upperCaseDto = { ...loginDto, email: "TEST@EXAMPLE.COM" };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(upperCaseDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "TEST@EXAMPLE.COM" },
      });
    });

    it("✅ debe incluir rol del usuario en el token", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockImplementation((payload) => {
        expect(payload).toHaveProperty("role");
        expect(payload.role).toBe(mockUser.role);
        return "token";
      });

      await service.login(loginDto);
    });
  });

  describe("refresh", () => {
    const refreshToken = "valid-refresh-token";

    const validPayload = {
      email: mockUser.email,
      sub: mockUser.id,
      role: mockUser.role,
    };

    beforeEach(() => {
      // Mock session table as any to avoid compilation errors
      (mockPrismaService as any).session = {
        findFirst: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn(),
      };
    });

    it("✅ debe refrescar tokens exitosamente", async () => {
      mockJwtService.verify.mockReturnValue(validPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce(mockTokens.access_token);
      mockJwtService.sign.mockReturnValueOnce(mockTokens.refresh_token);

      // Mock session validation
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      (mockPrismaService as any).session.findFirst.mockResolvedValue({
        userId: mockUser.id,
        refreshHash: tokenHash,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const result = await service.refresh(refreshToken);

      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        refreshToken,
        expect.any(Object),
      );
    });

    it("❌ debe lanzar UnauthorizedException si el token es inválido", async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("❌ debe lanzar UnauthorizedException si el usuario ya no existe", async () => {
      mockJwtService.verify.mockReturnValue(validPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("✅ debe generar nuevos tokens con la misma información del usuario", async () => {
      mockJwtService.verify.mockReturnValue(validPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockImplementation((payload) => {
        expect(payload.email).toBe(mockUser.email);
        expect(payload.sub).toBe(mockUser.id);
        expect(payload.role).toBe(mockUser.role);
        return "new-token";
      });

      // Mock session validation
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      (mockPrismaService as any).session.findFirst.mockResolvedValue({
        userId: mockUser.id,
        refreshHash: tokenHash,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await service.refresh(refreshToken);
    });
  });

  describe("logout", () => {
    it("✅ debe retornar mensaje de confirmación", async () => {
      const result = await service.logout();

      expect(result).toHaveProperty("message");
      expect(result.message).toContain("Sesión cerrada");
    });

    it("✅ debe ser un método que retorna Promise", () => {
      const result = service.logout();

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("forgotPassword", () => {
    const forgotDto = {
      email: mockUser.email,
    };

    it("✅ debe generar reset token si el usuario existe", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("reset-token");
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.forgotPassword(forgotDto);

      expect(result).toHaveProperty("message");
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            resetToken: expect.any(String),
            resetTokenExpires: expect.any(Date),
          }),
        }),
      );
    });

    it("✅ debe retornar el mismo mensaje si el usuario no existe (seguridad)", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotDto);

      expect(result).toHaveProperty("message");
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it("✅ debe establecer expiración de 1 hora para el reset token", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("reset-token");
      mockPrismaService.user.update.mockImplementation((params) => {
        const expiresAt = params.data.resetTokenExpires as Date;
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const diff = Math.abs(expiresAt.getTime() - oneHourLater.getTime());
        expect(diff).toBeLessThan(1000); // Menos de 1 segundo de diferencia
        return Promise.resolve(mockUser);
      });

      await service.forgotPassword(forgotDto);
    });
  });

  describe("resetPassword", () => {
    const resetDto = {
      email: "test@example.com",
      reset_token: "valid-reset-token",
      password: "NewPassword123!",
    };

    // El token en BD debe estar hasheado con SHA-256
    const resetTokenHash = crypto
      .createHash("sha256")
      .update("valid-reset-token")
      .digest("hex");
    const userWithResetToken = {
      ...mockUser,
      resetToken: resetTokenHash,
      resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora en el futuro
    };

    it("✅ debe resetear contraseña exitosamente", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithResetToken);
      mockPrismaService.user.update.mockImplementation(async (params) => {
        const password = params.data.password as string;
        expect(password).not.toBe(resetDto.password);
        return mockUser;
      });

      const result = await service.resetPassword(resetDto);

      expect(result).toHaveProperty("message");
      expect(result.message).toContain("actualizada");
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it("❌ debe lanzar UnauthorizedException si el usuario no existe", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("❌ debe lanzar UnauthorizedException si el reset token no coincide", async () => {
      const userWithDifferentToken = {
        ...userWithResetToken,
        resetToken: "different-token",
      };
      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithDifferentToken,
      );

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("❌ debe lanzar UnauthorizedException si el reset token expiró", async () => {
      const userWithExpiredToken = {
        ...userWithResetToken,
        resetTokenExpires: new Date(Date.now() - 1000), // Expiró hace 1 segundo
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("✅ debe hashear la nueva contraseña", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithResetToken);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(
        "$2b$10$newHashedPassword",
      );
      mockPrismaService.user.update.mockImplementation(async (params) => {
        const newPassword = params.data.password as string;
        expect(newPassword).not.toBe(resetDto.password);
        expect(newPassword).toBe("$2b$10$newHashedPassword");
        return mockUser;
      });

      await service.resetPassword(resetDto);
    });

    it("✅ debe limpiar el reset token después de usarlo", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithResetToken);
      mockPrismaService.user.update.mockImplementation(async (params) => {
        expect(params.data.resetToken).toBeNull();
        expect(params.data.resetTokenExpires).toBeNull();
        return mockUser;
      });

      await service.resetPassword(resetDto);

      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });
  });

  describe("validateToken", () => {
    const validToken = "valid-jwt-token";

    it("✅ debe validar token exitosamente", async () => {
      const payload = { email: mockUser.email, sub: mockUser.id };
      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.validateToken(validToken);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalled();
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        validToken,
        expect.any(Object),
      );
    });

    it("❌ debe lanzar UnauthorizedException si el token es inválido", async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(service.validateToken("invalid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("❌ debe manejar tokens malformados", async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(service.validateToken("malformed.token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("generateTokens", () => {
    it("✅ debe generar access y refresh tokens", () => {
      mockJwtService.sign.mockReturnValueOnce("access-token");
      mockJwtService.sign.mockReturnValueOnce("refresh-token");

      const result = service["generateTokens"](
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );

      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it("✅ debe configurar diferentes expiraciones", () => {
      let accessCalled = false;
      let refreshCalled = false;

      mockJwtService.sign.mockImplementation((tokenPayload, options) => {
        expect(options).toHaveProperty("expiresIn");

        if (!accessCalled) {
          expect(options.expiresIn).toBe("15m");
          accessCalled = true;
        } else if (!refreshCalled) {
          expect(options.expiresIn).toBe("7d");
          refreshCalled = true;
        }

        return "token";
      });

      service["generateTokens"](mockUser.id, mockUser.email, mockUser.role);

      expect(accessCalled).toBe(true);
      expect(refreshCalled).toBe(true);
    });
  });

  describe("Edge Cases y Seguridad", () => {
    it("✅ debe manejar múltiples llamadas concurrentes", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("token");

      const promises = Array(5)
        .fill(null)
        .map((_, i) =>
          service.register({
            email: `user${i}@example.com`,
            password: validPassword,
            name: `User ${i}`,
          }),
        );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(5);
    });

    it("✅ no debe exponer la contraseña hasheada en las respuestas", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("token");

      const result = await service.register({
        email: "test@example.com",
        password: validPassword,
        name: "Test",
      });

      expect(result.user).not.toHaveProperty("password");
      expect(JSON.stringify(result)).not.toContain("$2b$");
    });
  });
});
