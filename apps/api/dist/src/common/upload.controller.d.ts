import { UploadService } from "./upload.service";
export declare class UploadController {
    private uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        filename: string;
        size: number;
        mimetype: string;
    }>;
    getProviderInfo(): {
        provider: string;
        maxFileSize: number;
        maxFileSizeMB: number;
        allowedMimeTypes: string[];
    };
}
