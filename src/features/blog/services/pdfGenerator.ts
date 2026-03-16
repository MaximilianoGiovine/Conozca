/**
 * Client-side PDF generator for Conozca articles.
 * Uses jsPDF to build a styled PDF with watermark, attribution, and citations.
 */
import { jsPDF } from 'jspdf';
import { generateAllCitations, type CitationData } from './citationService';

export interface PdfArticleData {
  title: string;
  authorName: string | null;
  publishedAt: string | null;
  slug: string;
  content: string; // HTML content
  categoryName?: string | null;
}

// ─── Constants ───────────────────────────────────────────────────
const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 25;
const MARGIN_TOP = 30;
const MARGIN_BOTTOM = 30;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const WATERMARK_TEXT = 'CONOZCA';
const ATTRIBUTION_TEXT =
  'Este artículo es propiedad intelectual de Revista Conozca, publicación oficial del Servicio de Educación Cristiana de las Asambleas de Dios en América Latina.';

// ─── Helpers ─────────────────────────────────────────────────────

/** Strip HTML tags and decode entities to plain text */
function htmlToPlainText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/** Format a date string for display */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Watermark ───────────────────────────────────────────────────

function addWatermark(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.saveGraphicsState();
    // @ts-expect-error – jsPDF internal GState API
    doc.setGState(new doc.GState({ opacity: 0.06 }));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(72);
    doc.setTextColor(120, 120, 120);

    // Draw several watermarks diagonally across the page
    const positions = [
      { x: PAGE_WIDTH / 2, y: PAGE_HEIGHT * 0.3 },
      { x: PAGE_WIDTH / 2, y: PAGE_HEIGHT * 0.65 },
    ];

    for (const pos of positions) {
      doc.text(WATERMARK_TEXT, pos.x, pos.y, {
        align: 'center',
        angle: 45,
      });
    }

    doc.restoreGraphicsState();
  }
}

// ─── Main Generator ──────────────────────────────────────────────

export async function generateArticlePdf(data: PdfArticleData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN_TOP;

  // ── Helper: check page break ──
  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }
  };

  // ── Helper: write wrapped text and advance y ──
  const writeText = (
    text: string,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [40, 40, 40],
    lineHeightMm = 6
  ) => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
    for (const line of lines) {
      checkPageBreak(lineHeightMm);
      doc.text(line, MARGIN_LEFT, y);
      y += lineHeightMm;
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 1. HEADER — Magazine branding
  // ══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 140, 60); // amber/gold
  doc.text('REVISTA CONOZCA', MARGIN_LEFT, y);
  y += 4;

  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 12;

  // ══════════════════════════════════════════════════════════════
  // 2. TITLE
  // ══════════════════════════════════════════════════════════════
  writeText(data.title, 22, 'bold', [30, 30, 30], 9);
  y += 4;

  // ══════════════════════════════════════════════════════════════
  // 3. META — Author & Date
  // ══════════════════════════════════════════════════════════════
  const metaParts: string[] = [];
  if (data.authorName) metaParts.push(`Por ${data.authorName}`);
  if (data.publishedAt) metaParts.push(formatDate(data.publishedAt));
  if (data.categoryName) metaParts.push(data.categoryName);

  if (metaParts.length > 0) {
    writeText(metaParts.join('  •  '), 10, 'italic', [100, 100, 100], 5);
  }
  y += 6;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 10;

  // ══════════════════════════════════════════════════════════════
  // 4. BODY CONTENT
  // ══════════════════════════════════════════════════════════════
  const plainText = htmlToPlainText(data.content);
  const paragraphs = plainText
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    writeText(paragraph, 11, 'normal', [50, 50, 50], 5.5);
    y += 4;
  }

  y += 8;

  // ══════════════════════════════════════════════════════════════
  // 5. ATTRIBUTION LEGEND
  // ══════════════════════════════════════════════════════════════
  checkPageBreak(40);

  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 8;

  writeText('AVISO LEGAL', 9, 'bold', [180, 140, 60], 5);
  y += 2;
  writeText(ATTRIBUTION_TEXT, 9, 'italic', [100, 100, 100], 4.5);
  y += 10;

  // ══════════════════════════════════════════════════════════════
  // 6. BIBLIOGRAPHIC CITATIONS
  // ══════════════════════════════════════════════════════════════
  checkPageBreak(50);

  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://conozca.org';

  const citationData: CitationData = {
    title: data.title,
    authorName: data.authorName,
    publishedAt: data.publishedAt,
    slug: data.slug,
    siteUrl,
  };

  const citations = generateAllCitations(citationData);

  writeText('CÓMO CITAR ESTE ARTÍCULO', 10, 'bold', [30, 30, 30], 6);
  y += 4;

  const citationEntries = [
    { label: 'APA (7ª ed.)', text: citations.apa },
    { label: 'Chicago (17ª ed.)', text: citations.chicago },
    { label: 'Turabian', text: citations.turabian },
  ];

  for (const entry of citationEntries) {
    checkPageBreak(20);
    writeText(entry.label, 9, 'bold', [80, 80, 80], 5);
    y += 1;
    writeText(entry.text, 9, 'normal', [60, 60, 60], 4.5);
    y += 5;
  }

  // ══════════════════════════════════════════════════════════════
  // 7. WATERMARK (applied to all pages at the end)
  // ══════════════════════════════════════════════════════════════
  addWatermark(doc);

  // ══════════════════════════════════════════════════════════════
  // 8. SAVE
  // ══════════════════════════════════════════════════════════════
  const safeSlug = data.slug.replace(/[^a-z0-9-]/gi, '_');
  doc.save(`conozca-${safeSlug}.pdf`);
}
