import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUrl,
  Min,
  Max,
  IsHexColor,
  ArrayNotEmpty,
} from 'class-validator';
import {
  BlockType,
  FontFamily,
  TextAlign,
  PostStatus,
} from '@conozca/database';

/**
 * DTO para crear/actualizar un bloque de contenido
 */
export class CreateArticleBlockDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsString()
  content: string;

  @IsNumber()
  @Min(12)
  @Max(72)
  @IsOptional()
  fontSize?: number;

  @IsEnum(FontFamily)
  @IsOptional()
  fontFamily?: FontFamily;

  @IsEnum(TextAlign)
  @IsOptional()
  textAlign?: TextAlign;

  @IsHexColor()
  @IsOptional()
  textColor?: string;

  @IsHexColor()
  @IsOptional()
  backgroundColor?: string;

  @IsBoolean()
  @IsOptional()
  isBold?: boolean;

  @IsBoolean()
  @IsOptional()
  isItalic?: boolean;

  @IsBoolean()
  @IsOptional()
  isUnderline?: boolean;

  @IsBoolean()
  @IsOptional()
  isStrikethrough?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  listItemLevel?: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  imageAlt?: string;

  @IsNumber()
  @IsOptional()
  imageWidth?: number;

  @IsNumber()
  @IsOptional()
  imageHeight?: number;
}

/**
 * DTO para actualizar un bloque (todos los campos opcionales)
 */
export class UpdateArticleBlockDto {
  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @Min(12)
  @Max(72)
  @IsOptional()
  fontSize?: number;

  @IsEnum(FontFamily)
  @IsOptional()
  fontFamily?: FontFamily;

  @IsEnum(TextAlign)
  @IsOptional()
  textAlign?: TextAlign;

  @IsHexColor()
  @IsOptional()
  textColor?: string;

  @IsHexColor()
  @IsOptional()
  backgroundColor?: string;

  @IsBoolean()
  @IsOptional()
  isBold?: boolean;

  @IsBoolean()
  @IsOptional()
  isItalic?: boolean;

  @IsBoolean()
  @IsOptional()
  isUnderline?: boolean;

  @IsBoolean()
  @IsOptional()
  isStrikethrough?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  listItemLevel?: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  imageAlt?: string;

  @IsNumber()
  @IsOptional()
  imageWidth?: number;

  @IsNumber()
  @IsOptional()
  imageHeight?: number;
}

/**
 * DTO para respuestas de bloques
 */
export class ArticleBlockResponseDto {
  id: string;
  articleId: string;
  order: number;
  type: BlockType;
  content: string;
  fontSize: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  textColor: string;
  backgroundColor: string | null;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  listItemLevel: number;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para crear múltiples bloques a la vez
 */
export class CreateMultipleBlocksDto {
  @ArrayNotEmpty()
  blocks: CreateArticleBlockDto[];
}

/**
 * DTO para reordenar bloques
 */
export class ReorderBlocksDto {
  @ArrayNotEmpty()
  blockIds: string[];
}

/**
 * DTO para descargar PDF
 */
export class DownloadPdfDto {
  @IsBoolean()
  @IsOptional()
  includeWatermark?: boolean;

  @IsString()
  @IsOptional()
  watermarkText?: string;
}

/**
 * DTO para la respuesta de artículo con bloques
 */
export class ArticleWithBlocksResponseDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: PostStatus;
  author: {
    id: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  editor: {
    id: string;
    email: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  blocks: ArticleBlockResponseDto[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}
