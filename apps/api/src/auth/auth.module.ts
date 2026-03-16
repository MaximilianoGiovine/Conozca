import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { PrismaService } from "../prisma.service";
import { AuthGuard } from "./auth.guard";
import { OptionalAuthGuard } from "./optional-auth.guard";
import { EmailService } from "../common/email.service";
import { LoggerService } from "../common/logger.service";

/**
 * AuthModule
 *
 * Módulo que encapsula toda la funcionalidad de autenticación.
 * Proporciona:
 * - Servicio de autenticación
 * - Controlador de endpoints
 * - Estrategia JWT
 * - Módulos de JWT y Passport
 */
@Module({
  imports: [
    // Módulo de Passport
    PassportModule,

    // Módulo de JWT con configuración
    JwtModule.register({
      secret: process.env.JWT_SECRET || "secret",
      signOptions: { expiresIn: "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    AuthGuard,
    OptionalAuthGuard,
    EmailService,
    LoggerService,
  ],
  exports: [AuthService, AuthGuard, OptionalAuthGuard], // Exportar para que otros módulos lo usen
})
export class AuthModule {}
