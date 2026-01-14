import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

/**
 * Logger service usando Winston con soporte para:
 * - Logs estructurados en JSON
 * - Rotación diaria de archivos
 * - Diferentes niveles (error, warn, info, debug)
 * - Formato personalizado para desarrollo y producción
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;

    const isProduction = process.env.NODE_ENV === "production";

    // Formato para desarrollo: colorizado y legible
    const devFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(
        ({ timestamp, level, message, context, ...meta }) => {
          const ctx = context ? `[${context}]` : "";
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `${timestamp} ${level} ${ctx} ${message} ${metaStr}`;
        },
      ),
    );

    // Formato para producción: JSON estructurado
    const prodFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    // Transports
    const transports: winston.transport[] = [
      // Console: siempre habilitado
      new winston.transports.Console({
        format: isProduction ? prodFormat : devFormat,
      }),
    ];

    // File transports solo en producción
    if (isProduction) {
      // Error logs: rotación diaria, mantener 30 días
      transports.push(
        new DailyRotateFile({
          filename: "logs/error-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxFiles: "30d",
          maxSize: "20m",
          format: prodFormat,
        }),
      );

      // Combined logs: rotación diaria, mantener 14 días
      transports.push(
        new DailyRotateFile({
          filename: "logs/combined-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxFiles: "14d",
          maxSize: "20m",
          format: prodFormat,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
      transports,
      exitOnError: false,
    });
  }

  /**
   * Set context for subsequent logs
   */
  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  /**
   * Log con metadata adicional
   */
  logWithMeta(level: string, message: string, meta: Record<string, any>) {
    this.logger.log(level, message, { ...meta, context: this.context });
  }

  /**
   * Log de peticiones HTTP
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
  ) {
    this.logger.info("HTTP Request", {
      context: "HTTP",
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
    });
  }

  /**
   * Log de queries de base de datos (para debugging)
   */
  logQuery(query: string, params?: any[], duration?: number) {
    if (process.env.LOG_QUERIES === "true") {
      this.logger.debug("Database Query", {
        context: "Database",
        query,
        params,
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  }

  /**
   * Log de eventos de negocio importantes
   */
  logBusinessEvent(event: string, data: Record<string, any>) {
    this.logger.info(`Business Event: ${event}`, {
      context: "Business",
      event,
      ...data,
    });
  }
}
