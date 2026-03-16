import { OnModuleInit } from "@nestjs/common";
import * as Sentry from "@sentry/node";
export declare class SentryService implements OnModuleInit {
    private logger;
    private isEnabled;
    onModuleInit(): void;
    private initializeSentry;
    captureException(error: Error, context?: Record<string, any>): void;
    captureMessage(message: string, level?: Sentry.SeverityLevel, context?: Record<string, any>): void;
    setUser(user: {
        id: string;
        email?: string;
        username?: string;
    }): void;
    clearUser(): void;
    addBreadcrumb(breadcrumb: {
        message: string;
        category?: string;
        level?: Sentry.SeverityLevel;
        data?: Record<string, any>;
    }): void;
    startTransaction(name: string, op: string): Sentry.Span | null;
    capturePerformance<T>(name: string, operation: () => Promise<T>): Promise<T>;
    flush(timeout?: number): Promise<boolean>;
}
