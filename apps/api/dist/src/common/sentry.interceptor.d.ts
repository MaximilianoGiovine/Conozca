import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { SentryService } from "./sentry.service";
export declare class SentryInterceptor implements NestInterceptor {
    private sentryService;
    constructor(sentryService: SentryService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
