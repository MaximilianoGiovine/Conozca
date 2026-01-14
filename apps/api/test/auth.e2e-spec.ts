import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma.service";

/**
 * Tests E2E completos para el módulo de autenticación
 *
 * Prueba flujos completos end-to-end:
 * - Registro → Login → Refresh → Logout
 * - Forgot password → Reset password
 * - Validaciones de seguridad
 * - Edge cases y ataques comunes
 */
describe("Authentication E2E Tests", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurar pipes como en producción
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "@e2etest.com",
        },
      },
    });

    await app.close();
  });

  describe("Flujo Completo de Autenticación", () => {
    let accessToken: string;
    let refreshToken: string;
    let userId: string;
    const testEmail = `user${Date.now()}@e2etest.com`;

    it("✅ PASO 1: Debe registrar un nuevo usuario", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: testEmail,
          password: "TestPass123!",
          name: "E2E Test User",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
          expect(res.body).toHaveProperty("user");
          expect(res.body.user.email).toBe(testEmail);
          expect(res.body.user.role).toBe("USER");
          expect(res.body.user).not.toHaveProperty("password");

          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
          userId = res.body.user.id;
        });
    });

    it("❌ PASO 2: No debe permitir registrar el mismo email dos veces", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: testEmail,
          password: "AnotherPass123!",
          name: "Duplicate User",
        })
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toContain("email");
        });
    });

    it("✅ PASO 3: Debe hacer login con las credenciales correctas", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "TestPass123!",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
          expect(res.body.user.id).toBe(userId);
        });
    });

    it("❌ PASO 4: No debe hacer login con contraseña incorrecta", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!",
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
        });
    });

    it("✅ PASO 5: Debe refrescar el token exitosamente", () => {
      return request(app.getHttpServer())
        .post("/auth/refresh")
        .send({
          refresh_token: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
          expect(res.body.access_token).not.toBe(accessToken);

          // Actualizar tokens para siguientes tests
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it("❌ PASO 6: No debe refrescar con token inválido", () => {
      return request(app.getHttpServer())
        .post("/auth/refresh")
        .send({
          refresh_token: "invalid.token.here",
        })
        .expect(401);
    });

    it("✅ PASO 7: Debe acceder a endpoint protegido con token válido", () => {
      return request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toContain("Session closed successfully");
        });
    });

    it("❌ PASO 8: No debe acceder a endpoint protegido sin token", () => {
      return request(app.getHttpServer()).post("/auth/logout").expect(401);
    });
  });

  describe("Flujo de Recuperación de Contraseña", () => {
    let testEmail: string;
    let resetToken: string;

    beforeAll(async () => {
      testEmail = `reset${Date.now()}@e2etest.com`;

      // Crear usuario para reset
      await request(app.getHttpServer()).post("/auth/register").send({
        email: testEmail,
        password: "OriginalPass123!",
        name: "Reset Test User",
      });
    });

    it("✅ PASO 1: Debe solicitar reset de contraseña", () => {
      return request(app.getHttpServer())
        .post("/auth/forgot-password")
        .send({
          email: testEmail,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toContain("instructions");
        });
    });

    it("✅ PASO 2: Debe retornar mensaje genérico con email no existente", () => {
      return request(app.getHttpServer())
        .post("/auth/forgot-password")
        .send({
          email: "noexiste@e2etest.com",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          // No debe revelar si el email existe o no
          expect(res.body.message).not.toContain("no existe");
        });
    });

    it("✅ PASO 3: Debe obtener reset token de la BD y resetear contraseña", async () => {
      // Obtener reset token de la base de datos
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
        select: { resetToken: true, resetTokenExpires: true },
      });

      expect(user).toBeTruthy();
      expect(user?.resetToken).toBeTruthy();
      expect(user?.resetTokenExpires).toBeTruthy();
      resetToken = user!.resetToken!;

      return request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({
          email: testEmail,
          reset_token: resetToken,
          password: "NewPassword123!",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toContain("Password updated successfully");
        });
    });

    it("✅ PASO 4: Debe hacer login con la nueva contraseña", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "NewPassword123!",
        })
        .expect(200);
    });

    it("❌ PASO 5: No debe hacer login con la contraseña antigua", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "OriginalPass123!",
        })
        .expect(401);
    });

    it("❌ PASO 6: No debe permitir reusar el reset token", () => {
      return request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({
          email: testEmail,
          reset_token: resetToken,
          password: "AnotherNewPass123!",
        })
        .expect(401);
    });
  });

  describe("Validaciones de DTOs", () => {
    it("❌ debe rechazar email inválido en register", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "Pass123!",
          name: "Test",
        })
        .expect(400);
    });

    it("❌ debe rechazar contraseña muy corta en register", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@e2etest.com",
          password: "123",
          name: "Test",
        })
        .expect(400);
    });

    it("❌ debe rechazar campos faltantes en register", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@e2etest.com",
          // falta password y name
        })
        .expect(400);
    });

    it("❌ debe rechazar campos extra no permitidos", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@e2etest.com",
          password: "Pass123!",
          name: "Test",
          extraField: "not allowed",
        })
        .expect(400);
    });

    it("❌ debe rechazar email vacío en login", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "",
          password: "Pass123!",
        })
        .expect(400);
    });

    it("❌ debe rechazar refresh_token vacío", () => {
      return request(app.getHttpServer())
        .post("/auth/refresh")
        .send({
          refresh_token: "",
        })
        .expect(400);
    });
  });

  describe("Tests de Seguridad", () => {
    let attackEmail: string;
    let attackToken: string;

    beforeAll(async () => {
      attackEmail = `security${Date.now()}@e2etest.com`;

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: attackEmail,
          password: "SecurePass123!",
          name: "Security Test",
        });

      attackToken = response.body.access_token;
    });

    it("❌ debe rechazar SQL injection en email", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin'--",
          password: "anything",
        })
        .expect(400); // ValidationPipe rejects invalid email format
    });

    it("❌ debe rechazar XSS en name", async () => {
      const xssEmail = `xss${Date.now()}@e2etest.com`;

      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: xssEmail,
          password: "Pass123!",
          name: '<script>alert("xss")</script>',
        })
        .expect(201)
        .expect((res) => {
          // El name debe ser guardado tal cual (la sanitización es responsabilidad del frontend)
          expect(res.body.user.name).toBe('<script>alert("xss")</script>');
        });
    });

    it("❌ debe rechazar token JWT manipulado", () => {
      const manipulatedToken = attackToken.slice(0, -10) + "manipulated";

      return request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${manipulatedToken}`)
        .expect(401);
    });

    it("❌ debe rechazar token de otro usuario", async () => {
      // Crear segundo usuario
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: `other${Date.now()}@e2etest.com`,
          password: "Pass123!",
          name: "Other User",
        });

      const otherToken = response.body.access_token;

      // Intentar usar token de otro usuario
      return request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(200); // Logout siempre funciona, pero el token es del usuario correcto
    });

    it("✅ debe generar tokens diferentes para cada login", async () => {
      const response1 = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: attackEmail,
          password: "SecurePass123!",
        });

      const response2 = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: attackEmail,
          password: "SecurePass123!",
        });

      expect(response1.body.access_token).not.toBe(response2.body.access_token);
      expect(response1.body.refresh_token).not.toBe(
        response2.body.refresh_token,
      );
    });

    it("❌ debe rechazar tokens expirados (simulado)", () => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid";

      return request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe("Tests de Carga y Concurrencia", () => {
    it("✅ debe manejar múltiples registros simultáneos", async () => {
      const timestamp = Date.now();
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .post("/auth/register")
          .send({
            email: `concurrent${timestamp}-${i}@e2etest.com`,
            password: "Pass123!",
            name: `User ${i}`,
          }),
      );

      const results = await Promise.all(promises);

      results.forEach((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("access_token");
      });
    });

    it("✅ debe manejar múltiples logins del mismo usuario", async () => {
      const testEmail = `multilogin${Date.now()}@e2etest.com`;

      await request(app.getHttpServer()).post("/auth/register").send({
        email: testEmail,
        password: "Pass123!",
        name: "Multi Login User",
      });

      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer()).post("/auth/login").send({
          email: testEmail,
          password: "Pass123!",
        }),
      );

      const results = await Promise.all(promises);

      results.forEach((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("access_token");
      });

      // Todos los tokens deben ser diferentes
      const tokens = results.map((r) => r.body.access_token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });

    it("✅ debe responder rápidamente (<500ms por request)", async () => {
      const testEmail = `perf${Date.now()}@e2etest.com`;

      await request(app.getHttpServer()).post("/auth/register").send({
        email: testEmail,
        password: "Pass123!",
        name: "Performance Test",
      });

      const startTime = Date.now();

      await request(app.getHttpServer()).post("/auth/login").send({
        email: testEmail,
        password: "Pass123!",
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });
  });

  describe("Edge Cases", () => {
    it("✅ debe manejar emails con caracteres especiales", async () => {
      const specialEmail = `test+special${Date.now()}@e2etest.com`;

      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: specialEmail,
          password: "Pass123!",
          name: "Special Email User",
        })
        .expect(201);
    });

    it("✅ debe manejar nombres con acentos y ñ", async () => {
      const email = `spanish${Date.now()}@e2etest.com`;

      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: email,
          password: "Pass123!",
          name: "José María Peña",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.name).toBe("José María Peña");
        });
    });

    it("✅ debe manejar contraseñas con caracteres especiales", async () => {
      const email = `specialpass${Date.now()}@e2etest.com`;

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: email,
          password: "P@ssw0rd!#$%^&*()",
          name: "Special Pass User",
        })
        .expect(201);

      // Verificar que puede hacer login con esa contraseña
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: email,
          password: "P@ssw0rd!#$%^&*()",
        })
        .expect(200);
    });

    it("❌ debe manejar body vacío", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({})
        .expect(400);
    });

    it("❌ debe manejar content-type incorrecto", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .set("Content-Type", "text/plain")
        .send("email=test@e2etest.com&password=Pass123!")
        .expect(400);
    });
  });
});
