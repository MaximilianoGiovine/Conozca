import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { AuditLogService } from "./audit-log.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private audit: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const req = context.switchToHttp().getRequest();
    // We treat it as Record to allow optional user check safely
    const user = req.user as { sub: string } | undefined;
    const userId = user?.sub;
    const ip = req.ip as string | undefined;
    const ua = req.headers?.["user-agent"];
    const method = req.method as string;
    const path = (req.route?.path || req.url) as string;

    // Solo registrar mutaciones
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const entity =
      typeof path === "string" && path.startsWith("/articles")
        ? "Article"
        : typeof path === "string" && path.startsWith("/auth")
          ? "Auth"
          : "Unknown";

    if (!isMutation) return next.handle();

    const before = req.body;
    return next.handle().pipe(
      tap({
        next: (after) => {
          // Fire and forget, catch errors to not block response
          this.audit
            .log({
              userId,
              entity,
              entityId: after?.id || "",
              action: `${method} ${path}`,
              diff: { before, after },
              ip,
              ua,
            })
            .catch((err) => console.error("Audit logging failed", err));
        },
      }),
    );
  }
}
