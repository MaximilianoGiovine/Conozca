"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./jwt.strategy");
const prisma_service_1 = require("../prisma.service");
const auth_guard_1 = require("./auth.guard");
const optional_auth_guard_1 = require("./optional-auth.guard");
const email_service_1 = require("../common/email.service");
const logger_service_1 = require("../common/logger.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || "secret",
                signOptions: { expiresIn: "15m" },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            prisma_service_1.PrismaService,
            auth_guard_1.AuthGuard,
            optional_auth_guard_1.OptionalAuthGuard,
            email_service_1.EmailService,
            logger_service_1.LoggerService,
        ],
        exports: [auth_service_1.AuthService, auth_guard_1.AuthGuard, optional_auth_guard_1.OptionalAuthGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map