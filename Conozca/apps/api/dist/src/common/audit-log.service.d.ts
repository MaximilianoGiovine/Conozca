import { PrismaService } from "../prisma.service";
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        userId?: string;
        entity: string;
        entityId?: string;
        action: string;
        diff?: any;
        ip?: string;
        ua?: string;
    }): Promise<void>;
}
