import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { LoggerService } from "./logger.service";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Email service usando Nodemailer
 * Soporta múltiples transportes (SMTP, SendGrid, etc)
 */
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private logger = new LoggerService("EmailService");
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = this.initializeTransporter();
  }

  private initializeTransporter(): boolean {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASSWORD,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      SMTP_FROM,
      EMAIL_ENABLED,
    } = process.env;

    // Si no está habilitado o faltan credenciales, usar modo mock
    if (EMAIL_ENABLED !== "true" || !SMTP_HOST || !SMTP_USER) {
      this.logger.warn("Email service not configured, using mock mode");
      return false;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || "587"),
        secure: SMTP_PORT === "465", // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });

      this.logger.log("Email service initialized successfully");
      return true;
    } catch (error) {
      this.logger.error(
        "Failed to initialize email service",
        (error as Error).stack,
      );
      return false;
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.debug(
        `[MOCK] Email would be sent to ${options.to}: ${options.subject}`,
      );
      return true;
    }

    try {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
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
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}`,
        (error as Error).stack,
      );
      return false;
    }
  }

  /**
   * Email de verificación
   */
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
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

  /**
   * Email de reset de contraseña
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
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

  /**
   * Email de bienvenida
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
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

  /**
   * Notificación de nuevo artículo publicado (para admins)
   */
  async sendArticlePublishedNotification(
    adminEmail: string,
    articleTitle: string,
    authorName: string,
  ): Promise<boolean> {
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
}
