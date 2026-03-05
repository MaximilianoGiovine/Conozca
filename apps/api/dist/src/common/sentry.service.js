"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryService = void 0;
const common_1 = require("@nestjs/common");
const Sentry = __importStar(require("@sentry/node"));
const profiling_node_1 = require("@sentry/profiling-node");
const logger_service_1 = require("./logger.service");
let SentryService = class SentryService {
    logger = new logger_service_1.LoggerService("SentryService");
    isEnabled;
    onModuleInit() {
        this.isEnabled = this.initializeSentry();
    }
    initializeSentry() {
        const { SENTRY_DSN, NODE_ENV, SENTRY_ENABLED } = process.env;
        if (SENTRY_ENABLED !== "true" || !SENTRY_DSN) {
            this.logger.warn("Sentry not configured, error tracking disabled");
            return false;
        }
        try {
            Sentry.init({
                dsn: SENTRY_DSN,
                environment: NODE_ENV || "development",
                tracesSampleRate: NODE_ENV === "production" ? 0.1 : 1.0,
                profilesSampleRate: NODE_ENV === "production" ? 0.1 : 1.0,
                integrations: [(0, profiling_node_1.nodeProfilingIntegration)()],
                beforeSend(event) {
                    if (event.request?.data) {
                        const data = event.request.data;
                        if (typeof data === "object" && data !== null) {
                            if ("password" in data)
                                delete data["password"];
                            if ("token" in data)
                                delete data["token"];
                            if ("access_token" in data)
                                delete data["access_token"];
                            if ("refresh_token" in data)
                                delete data["refresh_token"];
                        }
                    }
                    return event;
                },
            });
            this.logger.log("Sentry initialized successfully");
            return true;
        }
        catch (error) {
            this.logger.error("Failed to initialize Sentry", error.stack);
            return false;
        }
    }
    captureException(error, context) {
        if (!this.isEnabled) {
            this.logger.debug(`[MOCK] Sentry would capture exception: ${error.message}`);
            return;
        }
        Sentry.captureException(error, {
            extra: context,
        });
    }
    captureMessage(message, level = "info", context) {
        if (!this.isEnabled) {
            this.logger.debug(`[MOCK] Sentry would capture message: ${message}`);
            return;
        }
        Sentry.captureMessage(message, {
            level,
            extra: context,
        });
    }
    setUser(user) {
        if (!this.isEnabled)
            return;
        Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.username,
        });
    }
    clearUser() {
        if (!this.isEnabled)
            return;
        Sentry.setUser(null);
    }
    addBreadcrumb(breadcrumb) {
        if (!this.isEnabled)
            return;
        Sentry.addBreadcrumb({
            message: breadcrumb.message,
            category: breadcrumb.category || "custom",
            level: breadcrumb.level || "info",
            data: breadcrumb.data,
        });
    }
    startTransaction(name, op) {
        if (!this.isEnabled)
            return null;
        return Sentry.startSpan({ name, op }, (span) => span);
    }
    async capturePerformance(name, operation) {
        if (!this.isEnabled) {
            return operation();
        }
        return await Sentry.startSpan({ name, op: "custom" }, async () => {
            return await operation();
        });
    }
    async flush(timeout = 2000) {
        if (!this.isEnabled)
            return true;
        try {
            return await Sentry.flush(timeout);
        }
        catch (error) {
            this.logger.error("Failed to flush Sentry events", error.stack);
            return false;
        }
    }
};
exports.SentryService = SentryService;
exports.SentryService = SentryService = __decorate([
    (0, common_1.Injectable)()
], SentryService);
//# sourceMappingURL=sentry.service.js.map