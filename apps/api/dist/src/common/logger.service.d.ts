import { LoggerService as NestLoggerService } from "@nestjs/common";
export declare class LoggerService implements NestLoggerService {
    private logger;
    private context?;
    constructor(context?: string);
    setContext(context: string): void;
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    logWithMeta(level: string, message: string, meta: Record<string, any>): void;
    logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string): void;
    logQuery(query: string, params?: any[], duration?: number): void;
    logBusinessEvent(event: string, data: Record<string, any>): void;
}
