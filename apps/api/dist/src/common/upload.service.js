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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("./logger.service");
let UploadService = class UploadService {
    configService;
    logger = new logger_service_1.LoggerService("UploadService");
    provider;
    maxFileSize;
    allowedMimeTypes;
    constructor(configService) {
        this.configService = configService;
        this.provider = this.configService.get("UPLOAD_PROVIDER", "local");
        this.maxFileSize = parseInt(this.configService.get("MAX_FILE_SIZE", "5242880"));
        this.allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
        ];
    }
    validateFile(file) {
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `El archivo excede el tamaño máximo de ${this.maxFileSize / 1024 / 1024}MB`,
            };
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: `Tipo de archivo no permitido. Solo se permiten: ${this.allowedMimeTypes.join(", ")}`,
            };
        }
        return { valid: true };
    }
    async uploadImage(file, folder) {
        const validation = this.validateFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        switch (this.provider) {
            case "cloudinary":
                return this.uploadToCloudinary(file, folder);
            case "s3":
                return this.uploadToS3(file, folder);
            case "local":
            default:
                return this.uploadToLocal(file, folder);
        }
    }
    async uploadToCloudinary(file, folder) {
        const { v2: cloudinary } = await import("cloudinary");
        const cloudName = this.configService.get("CLOUDINARY_CLOUD_NAME");
        const apiKey = this.configService.get("CLOUDINARY_API_KEY");
        const apiSecret = this.configService.get("CLOUDINARY_API_SECRET");
        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.warn("Cloudinary credentials missing, using local upload");
            return this.uploadToLocal(file, folder);
        }
        try {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: `conozca/${folder}`,
                    resource_type: "auto",
                    tags: ["conozca", folder],
                }, (error, result) => {
                    if (error) {
                        reject(error instanceof Error ? error : new Error(String(error)));
                    }
                    else if (result?.secure_url) {
                        this.logger.logBusinessEvent("file_uploaded_cloudinary", {
                            filename: file.originalname,
                            folder,
                            size: file.size,
                            cloudinaryUrl: result.secure_url,
                        });
                        resolve(result.secure_url);
                    }
                    else {
                        reject(new Error("No URL returned from Cloudinary"));
                    }
                });
                uploadStream.end(file.buffer);
            });
        }
        catch (error) {
            this.logger.error("Failed to upload to Cloudinary", error.stack);
            return this.uploadToLocal(file, folder);
        }
    }
    async uploadToS3(file, folder) {
        this.logger.warn("S3 not configured, using local upload");
        return this.uploadToLocal(file, folder);
    }
    async uploadToLocal(file, folder) {
        const fs = await import("fs/promises");
        const path = await import("path");
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = path.extname(file.originalname);
        const filename = `${timestamp}-${random}${extension}`;
        const uploadDir = path.join(process.cwd(), "uploads", folder);
        await fs.mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, file.buffer);
        const baseUrl = this.configService.get("API_URL", "http://localhost:4000");
        const publicUrl = `${baseUrl}/uploads/${folder}/${filename}`;
        this.logger.logBusinessEvent("file_uploaded", {
            filename,
            folder,
            size: file.size,
            mimetype: file.mimetype,
            provider: "local",
        });
        return publicUrl;
    }
    async deleteImage(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            if (!pathname.startsWith("/uploads/")) {
                this.logger.warn(`Cannot delete non-local file: ${url}`);
                return false;
            }
            const fs = await import("fs/promises");
            const path = await import("path");
            const filepath = path.join(process.cwd(), pathname);
            await fs.unlink(filepath);
            this.logger.logBusinessEvent("file_deleted", { url, provider: "local" });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${url}`, error.stack);
            return false;
        }
    }
    getProviderInfo() {
        return {
            provider: this.provider,
            maxFileSize: this.maxFileSize,
            maxFileSizeMB: this.maxFileSize / 1024 / 1024,
            allowedMimeTypes: this.allowedMimeTypes,
        };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map