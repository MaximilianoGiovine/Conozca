import { ConfigService } from "@nestjs/config";
export declare class UploadService {
    private configService;
    private logger;
    private provider;
    private maxFileSize;
    private allowedMimeTypes;
    constructor(configService: ConfigService);
    validateFile(file: Express.Multer.File): {
        valid: boolean;
        error?: string;
    };
    uploadImage(file: Express.Multer.File, folder: string): Promise<string>;
    private uploadToCloudinary;
    private uploadToS3;
    private uploadToLocal;
    deleteImage(url: string): Promise<boolean>;
    getProviderInfo(): {
        provider: string;
        maxFileSize: number;
        maxFileSizeMB: number;
        allowedMimeTypes: string[];
    };
}
