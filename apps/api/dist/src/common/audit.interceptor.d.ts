import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuditLogService } from "./audit-log.service";
export declare class AuditInterceptor implements NestInterceptor {
    private audit;
    constructor(audit: AuditLogService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
