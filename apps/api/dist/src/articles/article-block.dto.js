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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleWithBlocksResponseDto = exports.DownloadPdfDto = exports.ReorderBlocksDto = exports.CreateMultipleBlocksDto = exports.ArticleBlockResponseDto = exports.UpdateArticleBlockDto = exports.CreateArticleBlockDto = void 0;
const class_validator_1 = require("class-validator");
const database_1 = require("@conozca/database");
class CreateArticleBlockDto {
    type;
    content;
    fontSize;
    fontFamily;
    textAlign;
    textColor;
    backgroundColor;
    isBold;
    isItalic;
    isUnderline;
    isStrikethrough;
    listItemLevel;
    imageUrl;
    imageAlt;
    imageWidth;
    imageHeight;
}
exports.CreateArticleBlockDto = CreateArticleBlockDto;
__decorate([
    (0, class_validator_1.IsEnum)(database_1.BlockType),
    __metadata("design:type", typeof (_a = typeof database_1.BlockType !== "undefined" && database_1.BlockType) === "function" ? _a : Object)
], CreateArticleBlockDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArticleBlockDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(12),
    (0, class_validator_1.Max)(72),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateArticleBlockDto.prototype, "fontSize", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(database_1.FontFamily),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_b = typeof database_1.FontFamily !== "undefined" && database_1.FontFamily) === "function" ? _b : Object)
], CreateArticleBlockDto.prototype, "fontFamily", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(database_1.TextAlign),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_c = typeof database_1.TextAlign !== "undefined" && database_1.TextAlign) === "function" ? _c : Object)
], CreateArticleBlockDto.prototype, "textAlign", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateArticleBlockDto.prototype, "textColor", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateArticleBlockDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateArticleBlockDto.prototype, "isBold", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateArticleBlockDto.prototype, "isItalic", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateArticleBlockDto.prototype, "isUnderline", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateArticleBlockDto.prototype, "isStrikethrough", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateArticleBlockDto.prototype, "listItemLevel", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateArticleBlockDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateArticleBlockDto.prototype, "imageAlt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateArticleBlockDto.prototype, "imageWidth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateArticleBlockDto.prototype, "imageHeight", void 0);
class UpdateArticleBlockDto {
    type;
    content;
    fontSize;
    fontFamily;
    textAlign;
    textColor;
    backgroundColor;
    isBold;
    isItalic;
    isUnderline;
    isStrikethrough;
    listItemLevel;
    imageUrl;
    imageAlt;
    imageWidth;
    imageHeight;
}
exports.UpdateArticleBlockDto = UpdateArticleBlockDto;
__decorate([
    (0, class_validator_1.IsEnum)(database_1.BlockType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_d = typeof database_1.BlockType !== "undefined" && database_1.BlockType) === "function" ? _d : Object)
], UpdateArticleBlockDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateArticleBlockDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(12),
    (0, class_validator_1.Max)(72),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateArticleBlockDto.prototype, "fontSize", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(database_1.FontFamily),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_e = typeof database_1.FontFamily !== "undefined" && database_1.FontFamily) === "function" ? _e : Object)
], UpdateArticleBlockDto.prototype, "fontFamily", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(database_1.TextAlign),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_f = typeof database_1.TextAlign !== "undefined" && database_1.TextAlign) === "function" ? _f : Object)
], UpdateArticleBlockDto.prototype, "textAlign", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateArticleBlockDto.prototype, "textColor", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateArticleBlockDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateArticleBlockDto.prototype, "isBold", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateArticleBlockDto.prototype, "isItalic", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateArticleBlockDto.prototype, "isUnderline", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateArticleBlockDto.prototype, "isStrikethrough", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateArticleBlockDto.prototype, "listItemLevel", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateArticleBlockDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateArticleBlockDto.prototype, "imageAlt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateArticleBlockDto.prototype, "imageWidth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateArticleBlockDto.prototype, "imageHeight", void 0);
class ArticleBlockResponseDto {
    id;
    articleId;
    order;
    type;
    content;
    fontSize;
    fontFamily;
    textAlign;
    textColor;
    backgroundColor;
    isBold;
    isItalic;
    isUnderline;
    isStrikethrough;
    listItemLevel;
    imageUrl;
    imageAlt;
    imageWidth;
    imageHeight;
    createdAt;
    updatedAt;
}
exports.ArticleBlockResponseDto = ArticleBlockResponseDto;
class CreateMultipleBlocksDto {
    blocks;
}
exports.CreateMultipleBlocksDto = CreateMultipleBlocksDto;
__decorate([
    (0, class_validator_1.ArrayNotEmpty)(),
    __metadata("design:type", Array)
], CreateMultipleBlocksDto.prototype, "blocks", void 0);
class ReorderBlocksDto {
    blockIds;
}
exports.ReorderBlocksDto = ReorderBlocksDto;
__decorate([
    (0, class_validator_1.ArrayNotEmpty)(),
    __metadata("design:type", Array)
], ReorderBlocksDto.prototype, "blockIds", void 0);
class DownloadPdfDto {
    includeWatermark;
    watermarkText;
}
exports.DownloadPdfDto = DownloadPdfDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DownloadPdfDto.prototype, "includeWatermark", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DownloadPdfDto.prototype, "watermarkText", void 0);
class ArticleWithBlocksResponseDto {
    id;
    title;
    slug;
    excerpt;
    featuredImage;
    status;
    author;
    editor;
    category;
    blocks;
    viewCount;
    createdAt;
    updatedAt;
    publishedAt;
}
exports.ArticleWithBlocksResponseDto = ArticleWithBlocksResponseDto;
//# sourceMappingURL=article-block.dto.js.map