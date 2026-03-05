"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const stream_1 = require("stream");
const database_1 = require("@conozca/database");
let PdfService = class PdfService {
    async generateArticlePdf(article, includeWatermark = true, watermarkText = "Propiedad de Conozca") {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    size: "LETTER",
                    margins: { top: 50, bottom: 50, left: 72, right: 72 },
                });
                const stream = new stream_1.Readable();
                stream._read = () => { };
                doc.on("data", (chunk) => stream.push(chunk));
                doc.on("end", () => {
                    stream.push(null);
                    resolve(stream);
                });
                doc.on("error", reject);
                if (includeWatermark) {
                    this.addWatermark(doc, watermarkText);
                }
                doc
                    .fontSize(24)
                    .font("Helvetica-Bold")
                    .text(article.title, { align: "center" });
                doc.moveDown(0.5);
                doc
                    .fontSize(12)
                    .font("Helvetica")
                    .text(`Por: ${article.author.name}`, { align: "center" });
                doc
                    .fontSize(10)
                    .text(`Publicado: ${article.createdAt.toLocaleDateString("es-ES")}`, {
                    align: "center",
                });
                doc.moveDown(2);
                for (const block of article.blocks) {
                    this.renderBlock(doc, block);
                }
                doc.end();
            }
            catch (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });
    }
    renderBlock(doc, block) {
        const fontSize = block.fontSize || 16;
        const fontFamily = this.mapFontFamily(block.fontFamily);
        const isBold = block.isBold;
        const isItalic = block.isItalic;
        let font = fontFamily;
        if (isBold && isItalic) {
            font = `${fontFamily}-BoldOblique`;
        }
        else if (isBold) {
            font = `${fontFamily}-Bold`;
        }
        else if (isItalic) {
            font = `${fontFamily}-Oblique`;
        }
        doc.font(font).fontSize(fontSize);
        if (block.textColor) {
            doc.fillColor(block.textColor);
        }
        else {
            doc.fillColor("#000000");
        }
        const textOptions = {
            align: this.mapTextAlign(block.textAlign),
            continued: false,
        };
        switch (block.type) {
            case database_1.BlockType.PARAGRAPH:
                doc.text(block.content, textOptions);
                if (block.isUnderline) {
                    doc.underline(doc.x, doc.y - fontSize, doc.widthOfString(block.content), fontSize);
                }
                doc.moveDown(1);
                break;
            case database_1.BlockType.HEADING_1:
                doc
                    .fontSize(32)
                    .font("Helvetica-Bold")
                    .text(block.content, textOptions);
                doc.moveDown(1);
                break;
            case database_1.BlockType.HEADING_2:
                doc
                    .fontSize(24)
                    .font("Helvetica-Bold")
                    .text(block.content, textOptions);
                doc.moveDown(0.8);
                break;
            case database_1.BlockType.HEADING_3:
                doc
                    .fontSize(18)
                    .font("Helvetica-Bold")
                    .text(block.content, textOptions);
                doc.moveDown(0.6);
                break;
            case database_1.BlockType.QUOTE: {
                const currentX = doc.x;
                doc.fontSize(14).font("Helvetica-Oblique");
                doc.rect(currentX, doc.y, 3, fontSize + 10).fill("#cccccc");
                doc
                    .fillColor("#666666")
                    .text("  " + block.content, currentX + 10, doc.y, {
                    ...textOptions,
                    width: doc.page.width - currentX - 82,
                });
                doc.fillColor("#000000");
                doc.moveDown(1);
                break;
            }
            case database_1.BlockType.CODE:
                doc
                    .fontSize(12)
                    .font("Courier")
                    .fillColor("#000000")
                    .rect(doc.x, doc.y, doc.page.width - 144, fontSize * 1.5)
                    .fill("#f5f5f5")
                    .fillColor("#000000")
                    .text("  " + block.content, {
                    ...textOptions,
                    width: doc.page.width - 144,
                });
                doc.moveDown(1);
                break;
            case database_1.BlockType.UNORDERED_LIST: {
                const indent = (block.listItemLevel || 0) * 20;
                doc
                    .fontSize(fontSize)
                    .font(font)
                    .text("•", doc.x + indent, doc.y, { continued: true })
                    .text("  " + block.content, textOptions);
                doc.moveDown(0.5);
                break;
            }
            case database_1.BlockType.ORDERED_LIST: {
                const indentOrdered = (block.listItemLevel || 0) * 20;
                doc
                    .fontSize(fontSize)
                    .font(font)
                    .text(`${block.order + 1}.`, doc.x + indentOrdered, doc.y, {
                    continued: true,
                })
                    .text("  " + block.content, textOptions);
                doc.moveDown(0.5);
                break;
            }
            case database_1.BlockType.DIVIDER:
                doc
                    .moveTo(doc.x, doc.y + 10)
                    .lineTo(doc.page.width - 72, doc.y + 10)
                    .stroke("#cccccc");
                doc.moveDown(2);
                break;
            case database_1.BlockType.IMAGE:
                if (block.imageUrl) {
                    doc
                        .fontSize(10)
                        .font("Helvetica")
                        .fillColor("#666666")
                        .text(`[Imagen: ${block.imageAlt || block.imageUrl}]`, textOptions);
                    doc.moveDown(1);
                }
                break;
            default:
                doc.text(block.content, textOptions);
                doc.moveDown(1);
        }
    }
    addWatermark(doc, text) {
        doc.on("pageAdded", () => {
            const centerX = doc.page.width / 2;
            const centerY = doc.page.height / 2;
            doc
                .save()
                .translate(centerX, centerY)
                .rotate(-45, { origin: [0, 0] })
                .fontSize(72)
                .font("Helvetica-Bold")
                .fillColor("#cccccc", 0.2)
                .text(text, -300, -20, {
                width: 600,
                align: "center",
            })
                .restore();
        });
        const centerX = doc.page.width / 2;
        const centerY = doc.page.height / 2;
        doc
            .save()
            .translate(centerX, centerY)
            .rotate(-45, { origin: [0, 0] })
            .fontSize(72)
            .font("Helvetica-Bold")
            .fillColor("#cccccc", 0.2)
            .text(text, -300, -20, {
            width: 600,
            align: "center",
        })
            .restore();
    }
    mapFontFamily(fontFamily) {
        switch (fontFamily) {
            case database_1.FontFamily.TIMES_NEW_ROMAN:
                return "Times-Roman";
            case database_1.FontFamily.COURIER_NEW:
                return "Courier";
            case database_1.FontFamily.GEORGIA:
                return "Times-Roman";
            case database_1.FontFamily.VERDANA:
                return "Helvetica";
            case database_1.FontFamily.CALIBRI:
                return "Helvetica";
            case database_1.FontFamily.ARIAL:
            default:
                return "Helvetica";
        }
    }
    mapTextAlign(textAlign) {
        switch (textAlign) {
            case database_1.TextAlign.CENTER:
                return "center";
            case database_1.TextAlign.RIGHT:
                return "right";
            case database_1.TextAlign.JUSTIFY:
                return "justify";
            case database_1.TextAlign.LEFT:
            default:
                return "left";
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map