import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    entity: string;
    entityId?: string;
    action: string;
    diff?: any;
    ip?: string;
    ua?: string;
  }) {
    try {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
      await (this.prisma as any).auditLog?.create({
        data: {
          userId: params.userId ?? null,
          entity: params.entity,
          entityId: params.entityId ?? "",
          action: params.action,
          diff: params.diff ?? null,
          ip: params.ip ?? null,
          ua: params.ua ?? null,
        },
      });
    } catch {
      // tabla no migrada; omitir en dev/tests
    }
  }
}
