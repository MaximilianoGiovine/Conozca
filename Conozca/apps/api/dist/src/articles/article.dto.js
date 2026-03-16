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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuthorDto = exports.CreateCategoryDto = exports.ArticleListResponseDto = exports.ArticleResponseDto = exports.UpdateArticleDto = exports.CreateArticleDto = exports.ArticleWithBlocksResponseDto = exports.DownloadPdfDto = exports.ReorderBlocksDto = exports.CreateMultipleBlocksDto = exports.ArticleBlockResponseDto = exports.UpdateArticleBlockDto = exports.CreateArticleBlockDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const database_1 = require("@conozca/database");
var article_block_dto_1 = require("./article-block.dto");
Object.defineProperty(exports, "CreateArticleBlockDto", { enumerable: true, get: function () { return article_block_dto_1.CreateArticleBlockDto; } });
Object.defineProperty(exports, "UpdateArticleBlockDto", { enumerable: true, get: function () { return article_block_dto_1.UpdateArticleBlockDto; } });
Object.defineProperty(exports, "ArticleBlockResponseDto", { enumerable: true, get: function () { return article_block_dto_1.ArticleBlockResponseDto; } });
Object.defineProperty(exports, "CreateMultipleBlocksDto", { enumerable: true, get: function () { return article_block_dto_1.CreateMultipleBlocksDto; } });
Object.defineProperty(exports, "ReorderBlocksDto", { enumerable: true, get: function () { return article_block_dto_1.ReorderBlocksDto; } });
Object.defineProperty(exports, "DownloadPdfDto", { enumerable: true, get: function () { return article_block_dto_1.DownloadPdfDto; } });
Object.defineProperty(exports, "ArticleWithBlocksResponseDto", { enumerable: true, get: function () { return article_block_dto_1.ArticleWithBlocksResponseDto; } });
class CreateArticleDto {
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    status;
    authorId;
    categoryId;
}
exports.CreateArticleDto = CreateArticleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Título del artículo",
        example: "Guía completa de TypeScript en 2024",
        minLength: 5,
        maxLength: 200,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Slug único para la URL del artículo",
        example: "guia-completa-typescript-2024",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Contenido completo del artículo en markdown o HTML",
        example: "# Introducción\n\nTypeScript es un superset de JavaScript...",
        minLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Resumen corto del artículo para preview",
        example: "Aprende TypeScript desde cero con esta guía completa...",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "URL de la imagen destacada",
        example: "https://cdn.conozca.org/images/typescript-guide.jpg",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "featuredImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Estado del artículo",
        enum: database_1.PostStatus,
        default: "DRAFT",
        example: "DRAFT",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.PostStatus),
    __metadata("design:type", typeof (_a = typeof database_1.PostStatus !== "undefined" && database_1.PostStatus) === "function" ? _a : Object)
], CreateArticleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID del autor que firma el artículo",
        example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID de la categoría del artículo",
        example: "123e4567-e89b-12d3-a456-426614174001",
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "categoryId", void 0);
class UpdateArticleDto {
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    status;
    authorId;
    categoryId;
}
exports.UpdateArticleDto = UpdateArticleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Título del artículo",
        example: "Guía completa de TypeScript en 2024",
        minLength: 5,
        maxLength: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Slug único para la URL del artículo",
        example: "guia-completa-typescript-2024",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Contenido completo del artículo",
        example: "# Introducción\n\nTypeScript es un superset de JavaScript...",
        minLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Resumen corto del artículo",
        example: "Aprende TypeScript desde cero...",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "URL de la imagen destacada",
        example: "https://cdn.conozca.org/images/typescript-guide.jpg",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "featuredImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Estado del artículo",
        enum: database_1.PostStatus,
        example: "PUBLISHED",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.PostStatus),
    __metadata("design:type", typeof (_b = typeof database_1.PostStatus !== "undefined" && database_1.PostStatus) === "function" ? _b : Object)
], UpdateArticleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "ID del autor que firma el artículo",
        example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "ID de la categoría del artículo",
        example: "123e4567-e89b-12d3-a456-426614174001",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "categoryId", void 0);
class ArticleResponseDto {
    id;
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    status;
    author;
    editor;
    category;
    viewCount;
    createdAt;
    updatedAt;
    publishedAt;
}
exports.ArticleResponseDto = ArticleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID único del artículo",
        example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    __metadata("design:type", String)
], ArticleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Título del artículo",
        example: "Guía completa de TypeScript en 2024",
    }),
    __metadata("design:type", String)
], ArticleResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Slug del artículo",
        example: "guia-completa-typescript-2024",
    }),
    __metadata("design:type", String)
], ArticleResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Contenido completo del artículo",
        example: "# Introducción...",
    }),
    __metadata("design:type", String)
], ArticleResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Resumen corto",
        example: "Aprende TypeScript...",
    }),
    (0, swagger_1.ApiPropertyOptional)({
        description: "Resumen corto",
        example: "Aprende TypeScript...",
    }),
    __metadata("design:type", String)
], ArticleResponseDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "URL de la imagen destacada",
        example: "https://cdn.conozca.org/images/typescript.jpg",
    }),
    __metadata("design:type", String)
], ArticleResponseDto.prototype, "featuredImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Estado del artículo",
        enum: database_1.PostStatus,
        example: "PUBLISHED",
    }),
    __metadata("design:type", typeof (_c = typeof database_1.PostStatus !== "undefined" && database_1.PostStatus) === "function" ? _c : Object)
], ArticleResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Información del autor",
        example: {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Juan Pérez",
            bio: "Desarrollador con 10 años de experiencia",
            avatarUrl: "https://cdn.conozca.org/avatars/juan.jpg",
        },
    }),
    __metadata("design:type", Object)
], ArticleResponseDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Información del editor que modificó el artículo",
        example: {
            id: "123e4567-e89b-12d3-a456-426614174001",
            email: "editor@conozca.org",
            name: "María García",
            role: "EDITOR",
        },
    }),
    __metadata("design:type", Object)
], ArticleResponseDto.prototype, "editor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Información de la categoría",
        example: {
            id: "123e4567-e89b-12d3-a456-426614174002",
            name: "Programación",
            slug: "programacion",
        },
    }),
    __metadata("design:type", Object)
], ArticleResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Contador de vistas", example: 1523 }),
    __metadata("design:type", Number)
], ArticleResponseDto.prototype, "viewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Fecha de creación",
        example: "2024-01-15T10:30:00Z",
    }),
    __metadata("design:type", Date)
], ArticleResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Fecha de última actualización",
        example: "2024-01-16T14:20:00Z",
    }),
    __metadata("design:type", Date)
], ArticleResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Fecha de publicación",
        example: "2024-01-15T12:00:00Z",
    }),
    __metadata("design:type", Date)
], ArticleResponseDto.prototype, "publishedAt", void 0);
class ArticleListResponseDto {
    items;
    total;
    page;
    pageSize;
    totalPages;
}
exports.ArticleListResponseDto = ArticleListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Lista de artículos",
        type: [ArticleResponseDto],
    }),
    __metadata("design:type", Array)
], ArticleListResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Total de artículos", example: 150 }),
    __metadata("design:type", Number)
], ArticleListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Página actual", example: 1 }),
    __metadata("design:type", Number)
], ArticleListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Tamaño de página", example: 10 }),
    __metadata("design:type", Number)
], ArticleListResponseDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Total de páginas", example: 15 }),
    __metadata("design:type", Number)
], ArticleListResponseDto.prototype, "totalPages", void 0);
class CreateCategoryDto {
    name;
    slug;
    description;
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nombre de la categoría",
        example: "Programación",
        minLength: 3,
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Slug único para la URL",
        example: "programacion",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Descripción de la categoría",
        example: "Artículos sobre desarrollo de software y programación",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
class CreateAuthorDto {
    name;
    bio;
    avatarUrl;
}
exports.CreateAuthorDto = CreateAuthorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nombre del autor",
        example: "Juan Pérez",
        minLength: 3,
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAuthorDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Biografía del autor",
        example: "Desarrollador full-stack con 10 años de experiencia en TypeScript y Node.js",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuthorDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "URL del avatar del autor",
        example: "https://cdn.conozca.org/avatars/juan-perez.jpg",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuthorDto.prototype, "avatarUrl", void 0);
//# sourceMappingURL=article.dto.js.map