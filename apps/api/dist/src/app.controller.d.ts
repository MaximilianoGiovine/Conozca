import { AppService } from "./app.service";
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): Promise<string>;
    healthCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
}
