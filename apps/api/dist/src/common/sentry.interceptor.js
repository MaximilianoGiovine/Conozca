"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const sentry_service_1 = require("./sentry.service");
let SentryInterceptor = class SentryInterceptor {
    sentryService;
    constructor(sentryService) {
        this.sentryService = sentryService;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.catchError)((error) => {
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            if (user) {
                this.sentryService.setUser({
                    id: user.sub,
                    email: user.email,
                    username: user.name,
                });
            }
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
            this.sentryService.captureException(error, {
                method: request.method,
                url: request.url,
                statusCode: error.status || 500,
                user: user ? { id: user.sub, email: user.email } : undefined,
            });
            this.sentryService.clearUser();
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
};
exports.SentryInterceptor = SentryInterceptor;
exports.SentryInterceptor = SentryInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sentry_service_1.SentryService])
], SentryInterceptor);
//# sourceMappingURL=sentry.interceptor.js.map