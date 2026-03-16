import "dotenv/config";
import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@conozca/database";
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
