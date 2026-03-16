"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const logger_service_1 = require("./logger.service");
let EmailService = class EmailService {
    transporter;
    logger = new logger_service_1.LoggerService("EmailService");
    isConfigured;
    constructor() {
        this.isConfigured = this.initializeTransporter();
    }
    initializeTransporter() {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, EMAIL_ENABLED, } = process.env;
        if (EMAIL_ENABLED !== "true" || !SMTP_HOST || !SMTP_USER) {
            this.logger.warn("Email service not configured, using mock mode");
            return false;
        }
        try {
            this.transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: parseInt(SMTP_PORT || "587"),
                secure: SMTP_PORT === "465",
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASSWORD,
                },
            });
            this.logger.log("Email service initialized successfully");
            return true;
        }
        catch (error) {
            this.logger.error("Failed to initialize email service", error.stack);
            return false;
        }
    }
    async sendEmail(options) {
        if (!this.isConfigured) {
            this.logger.debug(`[MOCK] Email would be sent to ${options.to}: ${options.subject}`);
            return true;
        }
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || "noreply@conozca.org",
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            this.logger.logBusinessEvent("email_sent", {
                to: options.to,
                subject: options.subject,
                messageId: info.messageId,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error.stack);
            return false;
        }
    }
    async sendVerificationEmail(email, token) {
        const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${email}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verifica tu cuenta en Conozca</h2>
        <p>Gracias por registrarte. Haz clic en el botón de abajo para verificar tu cuenta:</p>
        <a href="${verifyUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Verificar Email
        </a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all;">${verifyUrl}</p>
        <p style="color: #666; font-size: 12px;">Este enlace expira en 24 horas.</p>
      </div>
    `;
        return this.sendEmail({
            to: email,
            subject: "Verifica tu cuenta en Conozca",
            html,
            text: `Verifica tu cuenta en Conozca: ${verifyUrl}`,
        });
    }
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${email}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Resetear Contraseña</h2>
        <p>Recibimos una solicitud para resetear tu contraseña. Haz clic en el botón de abajo:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px;">
          Resetear Contraseña
        </a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; font-size: 12px;">Este enlace expira en 1 hora.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, ignora este email.</p>
      </div>
    `;
        return this.sendEmail({
            to: email,
            subject: "Resetea tu contraseña en Conozca",
            html,
            text: `Resetea tu contraseña en Conozca: ${resetUrl}`,
        });
    }
    async sendWelcomeEmail(email, name) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Bienvenido a Conozca, ${name}!</h2>
        <p>Gracias por unirte a nuestra comunidad.</p>
        <p>Explora nuestros artículos y comparte tu conocimiento.</p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
           style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
          Comenzar
        </a>
      </div>
    `;
        return this.sendEmail({
            to: email,
            subject: "¡Bienvenido a Conozca!",
            html,
            text: `¡Bienvenido a Conozca, ${name}!`,
        });
    }
    async sendArticlePublishedNotification(adminEmail, articleTitle, authorName) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nuevo artículo publicado</h2>
        <p><strong>${authorName}</strong> ha publicado un nuevo artículo:</p>
        <p><strong>${articleTitle}</strong></p>
      </div>
    `;
        return this.sendEmail({
            to: adminEmail,
            subject: `Nuevo artículo: ${articleTitle}`,
            html,
            text: `${authorName} ha publicado: ${articleTitle}`,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map