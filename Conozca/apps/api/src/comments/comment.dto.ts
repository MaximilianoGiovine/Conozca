import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MaxLength,
} from "class-validator";

/**
 * DTO para crear un comentario
 */
export class CreateCommentDto {
  @ApiProperty({
    description: "Contenido del comentario",
    example: "Excelente artículo, muy informativo.",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

/**
 * DTO para actualizar un comentario
 */
export class UpdateCommentDto {
  @ApiPropertyOptional({
    description: "Nuevo contenido del comentario",
    example: "Actualizado: Excelente artículo.",
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  content?: string;

  @ApiPropertyOptional({
    description: "Estado de aprobación (solo ADMIN)",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @ApiPropertyOptional({
    description: "Marcar como reportado (solo ADMIN)",
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isReported?: boolean;
}

/**
 * DTO de respuesta de comentario
 */
export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty()
  isReported: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  user: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty()
  articleId: string;
}
