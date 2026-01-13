import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { LoggerService } from './logger.service';

/**
 * Sentry service para error tracking y monitoring
 */
@Injectable()
export class SentryService implements OnModuleInit {
  private logger = new LoggerService('SentryService');
  private isEnabled: boolean;

  onModuleInit() {
    this.isEnabled = this.initializeSentry();
  }

  private initializeSentry(): boolean {
    const { SENTRY_DSN, NODE_ENV, SENTRY_ENABLED } = process.env;

    // Solo habilitar en producción o si está explícitamente habilitado
    if (SENTRY_ENABLED !== 'true' || !SENTRY_DSN) {
      this.logger.warn('Sentry not configured, error tracking disabled');
      return false;
    }

    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: NODE_ENV || 'development',
        
        // Performance Monitoring
        tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Profiling
        profilesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
        
        integrations: [
          nodeProfilingIntegration(),
        ],

        // Filtrar información sensible
        beforeSend(event, hint) {
          // No enviar contraseñas ni tokens
          if (event.request?.data) {
            const data = event.request.data as any;
            if (typeof data === 'object') {
              delete data.password;
              delete data.token;
              delete data.access_token;
              delete data.refresh_token;
            }
          }
          return event;
        },
      });

      this.logger.log('Sentry initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Sentry', error.stack);
      return false;
    }
  }

  /**
   * Capturar una excepción
   */
  captureException(error: Error, context?: Record<string, any>) {
    if (!this.isEnabled) {
      this.logger.debug(`[MOCK] Sentry would capture exception: ${error.message}`);
      return;
    }

    Sentry.captureException(error, {
      extra: context,
    });
  }

  /**
   * Capturar un mensaje
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    if (!this.isEnabled) {
      this.logger.debug(`[MOCK] Sentry would capture message: ${message}`);
      return;
    }

    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  /**
   * Agregar contexto del usuario
   */
  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.isEnabled) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  /**
   * Limpiar contexto del usuario
   */
  clearUser() {
    if (!this.isEnabled) return;
    Sentry.setUser(null);
  }

  /**
   * Agregar breadcrumb (traza de navegación)
   */
  addBreadcrumb(breadcrumb: { message: string; category?: string; level?: Sentry.SeverityLevel; data?: Record<string, any> }) {
    if (!this.isEnabled) return;

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'custom',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
    });
  }

  /**
   * Iniciar una transacción para performance monitoring
   */
  startTransaction(name: string, op: string) {
    if (!this.isEnabled) return null;

    // startTransaction está deprecated, usar startSpan
    return Sentry.startSpan({ name, op }, (span) => span);
  }

  /**
   * Capturar performance de una operación
   */
  async capturePerformance<T>(
    name: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (!this.isEnabled) {
      return operation();
    }

    return await Sentry.startSpan(
      { name, op: 'custom' },
      async () => {
        return await operation();
      }
    );
  }

  /**
   * Forzar el envío de eventos pendientes (útil para serverless)
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.isEnabled) return true;

    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      this.logger.error('Failed to flush Sentry events', error.stack);
      return false;
    }
  }
}
