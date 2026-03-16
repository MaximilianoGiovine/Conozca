import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { SentryService } from "./sentry.service";

/**
 * Interceptor para capturar errores automáticamente con Sentry
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
        const request = context.switchToHttp().getRequest();
        const user = request.user as
          | { sub: string; email: string; name: string }
          | undefined;

        // Agregar contexto del usuario si está disponible
        if (user) {
          this.sentryService.setUser({
            id: user.sub,
            email: user.email,
            username: user.name,
          });
        }

        // Agregar breadcrumb con detalles de la request
        this.sentryService.addBreadcrumb({
          message: `${request.method} ${request.url}`,
          category: "http",
          level: "error",
          data: {
            method: request.method,
            url: request.url,
            statusCode: error.status || 500,
          },
        });

        // Capturar excepción
        this.sentryService.captureException(error as Error, {
          method: request.method,
          url: request.url,
          statusCode: error.status || 500,
          user: user ? { id: user.sub, email: user.email } : undefined,
        });

        // Limpiar contexto del usuario
        this.sentryService.clearUser();

        return throwError(() => error);
      }),
    );
  }
}
