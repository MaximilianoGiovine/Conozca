import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../auth/auth.guard";
import { UploadService } from "./upload.service";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";

/**
 * Upload controller para manejo de archivos
 */
@ApiTags("uploads")
@Controller("uploads")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  /**
   * Upload de imagen
   */
  @Post("image")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload an image file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file (JPEG, PNG, GIF, WebP, SVG)",
        },
        folder: {
          type: "string",
          description: "Target folder (articles, avatars, etc)",
          default: "misc",
        },
      },
      required: ["file"],
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body("folder") folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const url = await this.uploadService.uploadImage(file, folder || "misc");

    return {
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Obtener info del provider
   */
  @Post("info")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get upload provider configuration" })
  getProviderInfo() {
    return this.uploadService.getProviderInfo();
  }
}
