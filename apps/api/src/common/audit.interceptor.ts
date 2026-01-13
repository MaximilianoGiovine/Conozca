import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private audit: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const userId = req?.user?.sub;
    const ip = req?.ip;
    const ua = req?.headers?.['user-agent'];
    const method = req?.method;
    const path = req?.route?.path || req?.url;

    // Solo registrar mutaciones
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const entity = path?.startsWith('/articles') ? 'Article' : path?.startsWith('/auth') ? 'Auth' : 'Unknown';

    if (!isMutation) return next.handle();

    const before = req.body;
    return next.handle().pipe(
      tap(async (after) => {
        await this.audit.log({
          userId,
          entity,
          entityId: after?.id || '',
          action: `${method} ${path}`,
          diff: { before, after },
          ip,
          ua,
        });
      }),
    );
  }
}
