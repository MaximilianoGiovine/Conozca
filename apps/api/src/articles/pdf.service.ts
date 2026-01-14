import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { Readable } from "stream";
import {
  BlockType,
  FontFamily,
  TextAlign,
  ArticleBlock,
} from "@conozca/database";

/**
 * Servicio para generar PDFs a partir de artículos con bloques
 */
@Injectable()
export class PdfService {
  /**
   * Generar PDF de un artículo
   * @param article Artículo con bloques
   * @param includeWatermark Incluir marca de agua
   * @param watermarkText Texto de la marca de agua
   * @returns Stream del PDF generado
   */
  async generateArticlePdf(
    article: {
      title: string;
      author: { name: string };
      createdAt: Date;
      blocks: ArticleBlock[];
    },
    includeWatermark: boolean = true,
    watermarkText: string = "Propiedad de Conozca",
  ): Promise<Readable> {
    return new Promise((resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({
          size: "LETTER",
          margins: { top: 50, bottom: 50, left: 72, right: 72 },
        });

        const stream = new Readable();
        stream._read = () => {};

        doc.on("data", (chunk) => stream.push(chunk));
        doc.on("end", () => {
          stream.push(null);
          resolve(stream);
        });
        doc.on("error", reject);

        // Agregar marca de agua en todas las páginas
        if (includeWatermark) {
          this.addWatermark(doc, watermarkText);
        }

        // Header del documento
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

        // Renderizar bloques
        for (const block of article.blocks) {
          this.renderBlock(doc, block);
        }

        // Finalizar documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renderizar un bloque en el PDF
   */
  private renderBlock(doc: PDFKit.PDFDocument, block: ArticleBlock) {
    const fontSize = block.fontSize || 16;
    const fontFamily = this.mapFontFamily(block.fontFamily);
    const isBold = block.isBold;
    const isItalic = block.isItalic;

    // Determinar fuente
    let font = fontFamily;
    if (isBold && isItalic) {
      font = `${fontFamily}-BoldOblique`;
    } else if (isBold) {
      font = `${fontFamily}-Bold`;
    } else if (isItalic) {
      font = `${fontFamily}-Oblique`;
    }

    // Configurar fuente y tamaño
    doc.font(font).fontSize(fontSize);

    // Configurar color de texto
    if (block.textColor) {
      doc.fillColor(block.textColor);
    } else {
      doc.fillColor("#000000");
    }

    // Opciones de texto
    const textOptions: any = {
      align: this.mapTextAlign(block.textAlign),
      continued: false,
    };

    // Renderizar según tipo de bloque
    switch (block.type) {
      case BlockType.PARAGRAPH:
        doc.text(block.content, textOptions);
        if (block.isUnderline) {
          doc.underline(
            doc.x,
            doc.y - fontSize,
            doc.widthOfString(block.content),
            fontSize,
          );
        }
        doc.moveDown(1);
        break;

      case BlockType.HEADING_1:
        doc
          .fontSize(32)
          .font("Helvetica-Bold")
          .text(block.content, textOptions);
        doc.moveDown(1);
        break;

      case BlockType.HEADING_2:
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(block.content, textOptions);
        doc.moveDown(0.8);
        break;

      case BlockType.HEADING_3:
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .text(block.content, textOptions);
        doc.moveDown(0.6);
        break;

      case BlockType.QUOTE:
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

      case BlockType.CODE:
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

      case BlockType.UNORDERED_LIST:
        const indent = (block.listItemLevel || 0) * 20;
        doc
          .fontSize(fontSize)
          .font(font)
          .text("•", doc.x + indent, doc.y, { continued: true })
          .text("  " + block.content, textOptions);
        doc.moveDown(0.5);
        break;

      case BlockType.ORDERED_LIST:
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

      case BlockType.DIVIDER:
        doc
          .moveTo(doc.x, doc.y + 10)
          .lineTo(doc.page.width - 72, doc.y + 10)
          .stroke("#cccccc");
        doc.moveDown(2);
        break;

      case BlockType.IMAGE:
        if (block.imageUrl) {
          // Para imágenes externas, necesitarías descargarlas primero
          // Por ahora, solo agregamos el texto alternativo o URL
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

  /**
   * Agregar marca de agua al documento
   */
  private addWatermark(doc: PDFKit.PDFDocument, text: string) {
    // Agregar marca de agua en todas las páginas
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

    // Agregar marca de agua a la primera página
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

  /**
   * Mapear fuente de Prisma a PDFKit
   */
  private mapFontFamily(fontFamily: FontFamily): string {
    switch (fontFamily) {
      case FontFamily.TIMES_NEW_ROMAN:
        return "Times-Roman";
      case FontFamily.COURIER_NEW:
        return "Courier";
      case FontFamily.GEORGIA:
        return "Times-Roman"; // Fallback
      case FontFamily.VERDANA:
        return "Helvetica"; // Fallback
      case FontFamily.CALIBRI:
        return "Helvetica"; // Fallback
      case FontFamily.ARIAL:
      default:
        return "Helvetica";
    }
  }

  /**
   * Mapear alineación de texto
   */
  private mapTextAlign(
    textAlign: TextAlign,
  ): "left" | "center" | "right" | "justify" {
    switch (textAlign) {
      case TextAlign.CENTER:
        return "center";
      case TextAlign.RIGHT:
        return "right";
      case TextAlign.JUSTIFY:
        return "justify";
      case TextAlign.LEFT:
      default:
        return "left";
    }
  }
}
