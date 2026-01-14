import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "./logger.service";

/**
 * Upload service para manejo de archivos
 * Soporta múltiples providers: Cloudinary, AWS S3, Local
 */
@Injectable()
export class UploadService {
  private logger = new LoggerService("UploadService");
  private provider: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get("UPLOAD_PROVIDER", "local");
    this.maxFileSize = parseInt(
      this.configService.get("MAX_FILE_SIZE", "5242880"),
    ); // 5MB default
    this.allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
  }

  /**
   * Validar archivo antes de subir
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Validar tamaño
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `El archivo excede el tamaño máximo de ${this.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Validar tipo MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Solo se permiten: ${this.allowedMimeTypes.join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload de imagen
   * @param file - Archivo a subir
   * @param folder - Carpeta destino (ej: 'articles', 'avatars')
   * @returns URL pública del archivo subido
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    // Validar
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Delegar al provider correspondiente
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

  /**
   * Upload a Cloudinary
   */
  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
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
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `conozca/${folder}`,
            resource_type: "auto",
            tags: ["conozca", folder],
          },
          (error: any, result: any) => {
            if (error) {
              reject(error);
            } else if (result?.secure_url) {
              this.logger.logBusinessEvent("file_uploaded_cloudinary", {
                filename: file.originalname,
                folder,
                size: file.size,
                cloudinaryUrl: result.secure_url,
              });
              resolve(result.secure_url);
            } else {
              reject(new Error("No URL returned from Cloudinary"));
            }
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error("Failed to upload to Cloudinary", error.stack);
      return this.uploadToLocal(file, folder);
    }
  }

  /**
   * Upload a AWS S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    // Requiere: npm install @aws-sdk/client-s3
    // TODO: Implementar cuando se configure S3
    this.logger.warn("S3 not configured, using local upload");
    return this.uploadToLocal(file, folder);
  }

  /**
   * Upload local (para desarrollo)
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const fs = await import("fs/promises");
    const path = await import("path");

    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${random}${extension}`;

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Guardar archivo
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, file.buffer);

    // Retornar URL pública
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

  /**
   * Eliminar imagen
   */
  async deleteImage(url: string): Promise<boolean> {
    try {
      // Extraer path del URL
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Solo eliminar si es upload local
      if (!pathname.startsWith("/uploads/")) {
        this.logger.warn(`Cannot delete non-local file: ${url}`);
        return false;
      }

      // Eliminar archivo
      const fs = await import("fs/promises");
      const path = await import("path");
      const filepath = path.join(process.cwd(), pathname);

      await fs.unlink(filepath);

      this.logger.logBusinessEvent("file_deleted", { url, provider: "local" });
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${url}`, error.stack);
      return false;
    }
  }

  /**
   * Obtener información del provider configurado
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      maxFileSize: this.maxFileSize,
      maxFileSizeMB: this.maxFileSize / 1024 / 1024,
      allowedMimeTypes: this.allowedMimeTypes,
    };
  }
}
