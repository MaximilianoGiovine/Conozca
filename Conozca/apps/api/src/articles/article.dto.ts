import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PostStatus, Role } from "@conozca/database";

// Re-export block DTOs
export {
  CreateArticleBlockDto,
  UpdateArticleBlockDto,
  ArticleBlockResponseDto,
  CreateMultipleBlocksDto,
  ReorderBlocksDto,
  DownloadPdfDto,
  ArticleWithBlocksResponseDto,
} from "./article-block.dto";

/**
 * DTO para crear un nuevo artículo
 * Solo ADMIN y EDITOR pueden crear artículos
 */
export class CreateArticleDto {
  @ApiProperty({
    description: "Título del artículo",
    example: "Guía completa de TypeScript en 2024",
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: "Slug único para la URL del artículo",
    example: "guia-completa-typescript-2024",
  })
  @IsString()
  slug: string; // Debe ser único y válido para URL

  @ApiProperty({
    description: "Contenido completo del artículo en markdown o HTML",
    example: "# Introducción\n\nTypeScript es un superset de JavaScript...",
    minLength: 50,
  })
  @IsString()
  @MinLength(50)
  content: string; // Contenido del artículo (markdown o HTML)

  @ApiPropertyOptional({
    description: "Resumen corto del artículo para preview",
    example: "Aprende TypeScript desde cero con esta guía completa...",
  })
  @IsOptional()
  @IsString()
  excerpt?: string; // Resumen corto para preview

  @ApiPropertyOptional({
    description: "URL de la imagen destacada",
    example: "https://cdn.conozca.org/images/typescript-guide.jpg",
  })
  @IsOptional()
  @IsString()
  featuredImage?: string; // URL de la imagen destacada

  @ApiPropertyOptional({
    description: "Estado del artículo",
    enum: PostStatus,
    default: "DRAFT",
    example: "DRAFT",
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus; // DRAFT, PUBLISHED, ARCHIVED (default: DRAFT)

  @ApiProperty({
    description: "ID del autor que firma el artículo",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  authorId: string; // ID del autor que firma el artículo

  @ApiProperty({
    description: "ID de la categoría del artículo",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsUUID()
  categoryId: string; // ID de la categoría
}

/**
 * DTO para actualizar un artículo
 */
export class UpdateArticleDto {
  @ApiPropertyOptional({
    description: "Título del artículo",
    example: "Guía completa de TypeScript en 2024",
    minLength: 5,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: "Slug único para la URL del artículo",
    example: "guia-completa-typescript-2024",
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: "Contenido completo del artículo",
    example: "# Introducción\n\nTypeScript es un superset de JavaScript...",
    minLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(50)
  content?: string;

  @ApiPropertyOptional({
    description: "Resumen corto del artículo",
    example: "Aprende TypeScript desde cero...",
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({
    description: "URL de la imagen destacada",
    example: "https://cdn.conozca.org/images/typescript-guide.jpg",
  })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({
    description: "Estado del artículo",
    enum: PostStatus,
    example: "PUBLISHED",
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    description: "ID del autor que firma el artículo",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({
    description: "ID de la categoría del artículo",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

/**
 * DTO para respuestas de artículos
 * No expone datos sensibles
 */
export class ArticleResponseDto {
  @ApiProperty({
    description: "ID único del artículo",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Título del artículo",
    example: "Guía completa de TypeScript en 2024",
  })
  title: string;

  @ApiProperty({
    description: "Slug del artículo",
    example: "guia-completa-typescript-2024",
  })
  slug: string;

  @ApiProperty({
    description: "Contenido completo del artículo",
    example: "# Introducción...",
  })
  content: string;

  @ApiPropertyOptional({
    description: "Resumen corto",
    example: "Aprende TypeScript...",
  })
  @ApiPropertyOptional({
    description: "Resumen corto",
    example: "Aprende TypeScript...",
  })
  excerpt?: string;

  @ApiPropertyOptional({
    description: "URL de la imagen destacada",
    example: "https://cdn.conozca.org/images/typescript.jpg",
  })
  featuredImage?: string;

  @ApiProperty({
    description: "Estado del artículo",
    enum: PostStatus,
    example: "PUBLISHED",
  })
  status: PostStatus;

  @ApiProperty({
    description: "Información del autor",
    example: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Juan Pérez",
      bio: "Desarrollador con 10 años de experiencia",
      avatarUrl: "https://cdn.conozca.org/avatars/juan.jpg",
    },
  })
  author: {
    id: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
  };

  @ApiPropertyOptional({
    description: "Información del editor que modificó el artículo",
    example: {
      id: "123e4567-e89b-12d3-a456-426614174001",
      email: "editor@conozca.org",
      name: "María García",
      role: "EDITOR",
    },
  })
  editor?: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };

  @ApiProperty({
    description: "Información de la categoría",
    example: {
      id: "123e4567-e89b-12d3-a456-426614174002",
      name: "Programación",
      slug: "programacion",
    },
  })
  category: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiPropertyOptional({ description: "Contador de vistas", example: 1523 })
  viewCount?: number;

  @ApiProperty({
    description: "Fecha de creación",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Fecha de última actualización",
    example: "2024-01-16T14:20:00Z",
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Fecha de publicación",
    example: "2024-01-15T12:00:00Z",
  })
  publishedAt?: Date;
}

/**
 * DTO para listar artículos con paginación
 */
export class ArticleListResponseDto {
  @ApiProperty({
    description: "Lista de artículos",
    type: [ArticleResponseDto],
  })
  items: ArticleResponseDto[];

  @ApiProperty({ description: "Total de artículos", example: 150 })
  total: number;

  @ApiProperty({ description: "Página actual", example: 1 })
  page: number;

  @ApiProperty({ description: "Tamaño de página", example: 10 })
  pageSize: number;

  @ApiProperty({ description: "Total de páginas", example: 15 })
  totalPages: number;
}

/**
 * DTO para crear una categoría
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: "Nombre de la categoría",
    example: "Programación",
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: "Slug único para la URL",
    example: "programacion",
  })
  @IsString()
  slug: string; // Único y válido para URL

  @ApiPropertyOptional({
    description: "Descripción de la categoría",
    example: "Artículos sobre desarrollo de software y programación",
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO para crear un autor
 */
export class CreateAuthorDto {
  @ApiProperty({
    description: "Nombre del autor",
    example: "Juan Pérez",
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string; // El nombre que aparece en los artículos

  @ApiPropertyOptional({
    description: "Biografía del autor",
    example:
      "Desarrollador full-stack con 10 años de experiencia en TypeScript y Node.js",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: "URL del avatar del autor",
    example: "https://cdn.conozca.org/avatars/juan-perez.jpg",
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
