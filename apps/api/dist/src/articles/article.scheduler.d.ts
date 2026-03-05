import { PrismaService } from "../prisma.service";
export declare class ArticleScheduler {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleSchedules(): Promise<void>;
}
