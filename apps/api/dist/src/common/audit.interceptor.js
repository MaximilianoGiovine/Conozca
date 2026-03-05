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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const audit_log_service_1 = require("./audit-log.service");
let AuditInterceptor = class AuditInterceptor {
    audit;
    constructor(audit) {
        this.audit = audit;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const userId = user?.sub;
        const ip = req.ip;
        const ua = req.headers?.["user-agent"];
        const method = req.method;
        const path = (req.route?.path || req.url);
        const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
        const entity = typeof path === "string" && path.startsWith("/articles")
            ? "Article"
            : typeof path === "string" && path.startsWith("/auth")
                ? "Auth"
                : "Unknown";
        if (!isMutation)
            return next.handle();
        const before = req.body;
        return next.handle().pipe((0, rxjs_1.tap)({
            next: (after) => {
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
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map