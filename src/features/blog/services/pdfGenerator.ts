/**
 * PDF generator for Conozca articles — APA 7th Edition formatting.
 * Font: Times New Roman 12pt | Margins: 1in | Double-spaced | First-line indent 0.5in
 */
import { jsPDF } from 'jspdf';
import { generateAllCitations, type CitationData } from './citationService';

export interface PdfArticleData {
  title: string;
  authorName: string | null;
  publishedAt: string | null;
  slug: string;
  content: string;
  categoryName?: string | null;
}

// ─── APA Constants ────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 25.4;          // 1 inch left margin
const MR = 25.4;          // 1 inch right margin
const MT = 25.4;          // 1 inch top margin
const MB = 25.4;          // 1 inch bottom margin
const CW = PAGE_W - ML - MR;    // content width
const INDENT = 12.7;      // 0.5 inch first-line indent
const LH = 8.5;           // ~double-spaced 12pt (12pt × 2 × 0.353mm)
const LH_TIGHT = 5.0;     // single-spaced for headers/meta
const FONT_BODY = 12;
const WATERMARK = 'CONOZCA';
const ATTRIBUTION = 'Este artículo es propiedad intelectual de Revista Conozca, publicación oficial del Servicio de Educación Cristiana de las Asambleas de Dios en América Latina.';

// ─── HTML Block Parser ────────────────────────────────────────────
type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'li';
interface Block { type: BlockType; text: string }

function parseBlocks(html: string): Block[] {
  const div = document.createElement('div');
  div.innerHTML = html;
  const blocks: Block[] = [];

  function walk(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return;

    const MAP: Record<string, BlockType> = {
      p: 'p', h1: 'h1', h2: 'h2', h3: 'h3',
      h4: 'h4', h5: 'h4', h6: 'h4',
      blockquote: 'blockquote', li: 'li',
    };
    if (MAP[tag]) {
      blocks.push({ type: MAP[tag], text });
    } else {
      for (const child of Array.from(el.childNodes)) walk(child);
    }
  }

  for (const child of Array.from(div.childNodes)) walk(child);

  // Fallback: if no blocks parsed, split plain text by newlines
  if (blocks.length === 0) {
    const plain = (div.textContent ?? '').trim();
    for (const p of plain.split(/\n\s*\n/).filter(Boolean)) {
      blocks.push({ type: 'p', text: p.replace(/\s+/g, ' ').trim() });
    }
  }
  return blocks;
}

// ─── Helpers ──────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Soporte de griego (koiné) ─────────────────────────────────────
// La fuente "times" embebida en jsPDF es una de las 14 fuentes estándar de PDF
// (codificación WinAnsi/Latin-1) y no tiene glifos griegos: cualquier palabra en
// griego (incluido el griego politónico usado en textos koiné/bíblicos, con
// acentos y espíritus) se pierde o sale en blanco al exportar. "Cardo" es una
// fuente pensada para clasicistas con cobertura completa de griego politónico
// (bloques Unicode 0370–03FF y 1F00–1FFF), así que la usamos como reemplazo
// puntual en cualquier bloque de texto que contenga caracteres griegos.
const GREEK_RE = /[Ͱ-Ͽἀ-῿]/;
function containsGreek(text: string): boolean {
  return GREEK_RE.test(text);
}

const GREEK_FONT = 'Cardo';
// Cardo no tiene variante bold-italic en Google Fonts; la más cercana es bold.
const GREEK_STYLE_MAP: Record<string, 'normal' | 'bold' | 'italic'> = {
  normal: 'normal',
  bold: 'bold',
  italic: 'italic',
  bolditalic: 'bold',
};

let greekFontPromise: Promise<boolean> | null = null;

async function fetchFontAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar la fuente ${url}`);
  const buffer = await res.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** Registra la fuente Cardo en el documento (una sola vez por sesión). Devuelve false si falla, para poder seguir generando el PDF sin romper la exportación. */
async function ensureGreekFont(doc: jsPDF): Promise<boolean> {
  if (!greekFontPromise) {
    greekFontPromise = (async () => {
      try {
        const [regular, bold, italic] = await Promise.all([
          fetchFontAsBase64('/fonts/Cardo-Regular.ttf'),
          fetchFontAsBase64('/fonts/Cardo-Bold.ttf'),
          fetchFontAsBase64('/fonts/Cardo-Italic.ttf'),
        ]);
        doc.addFileToVFS('Cardo-Regular.ttf', regular);
        doc.addFont('Cardo-Regular.ttf', GREEK_FONT, 'normal');
        doc.addFileToVFS('Cardo-Bold.ttf', bold);
        doc.addFont('Cardo-Bold.ttf', GREEK_FONT, 'bold');
        doc.addFileToVFS('Cardo-Italic.ttf', italic);
        doc.addFont('Cardo-Italic.ttf', GREEK_FONT, 'italic');
        return true;
      } catch (err) {
        console.error('No se pudo cargar la fuente para griego (Cardo):', err);
        return false;
      }
    })();
  }
  return greekFontPromise;
}

// ─── Watermark ────────────────────────────────────────────────────
function addWatermark(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.saveGraphicsState();
    // @ts-expect-error jsPDF internal
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(72);
    doc.setTextColor(120, 120, 120);
    for (const y of [PAGE_H * 0.3, PAGE_H * 0.65]) {
      doc.text(WATERMARK, PAGE_W / 2, y, { align: 'center', angle: 45 });
    }
    doc.restoreGraphicsState();
  }
}

// ─── Page Numbers ─────────────────────────────────────────────────
function addPageNumbers(doc: jsPDF, shortTitle: string, greekFontReady: boolean) {
  const total = doc.getNumberOfPages();
  const runningHead = shortTitle.toUpperCase();
  const useGreekFont = greekFontReady && containsGreek(runningHead);
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont(useGreekFont ? GREEK_FONT : 'times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    // Running head (left) + page number (right)
    doc.text(runningHead, ML, 15);
    doc.text(String(i), PAGE_W - MR, 15, { align: 'right' });
  }
}

// ─── Main Generator ───────────────────────────────────────────────
export async function generateArticlePdf(data: PdfArticleData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MT;

  // Si el artículo tiene alguna palabra en griego, precargamos Cardo antes de
  // escribir nada: jsPDF necesita la fuente ya registrada en el momento de
  // llamar a setFont/splitTextToSize, no se puede agregar "sobre la marcha".
  const articleHasGreek = containsGreek(data.title)
    || containsGreek(data.content)
    || containsGreek(data.authorName ?? '');
  const greekFontReady = articleHasGreek ? await ensureGreekFont(doc) : false;

  // ── Core write helpers ──
  const checkBreak = (space: number) => {
    if (y + space > PAGE_H - MB) { doc.addPage(); y = MT; }
  };

  /** Elige "times" o, si el texto trae griego y la fuente cargó bien, "Cardo". */
  const resolveFont = (text: string, style: 'normal' | 'bold' | 'italic' | 'bolditalic') => {
    if (greekFontReady && containsGreek(text)) {
      return { family: GREEK_FONT, style: GREEK_STYLE_MAP[style] };
    }
    return { family: 'times', style };
  };

  /** Write left-aligned wrapped text, return final y */
  const write = (
    text: string,
    size: number,
    style: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal',
    color: [number, number, number] = [30, 30, 30],
    lh = LH,
    xOffset = 0,
    maxW = CW,
  ) => {
    const font = resolveFont(text, style);
    doc.setFont(font.family, font.style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    for (const line of lines) {
      checkBreak(lh);
      doc.text(line, ML + xOffset, y);
      y += lh;
    }
  };

  /** Write centered text */
  const writeCenter = (
    text: string,
    size: number,
    style: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [30, 30, 30],
    lh = LH_TIGHT,
  ) => {
    const font = resolveFont(text, style);
    doc.setFont(font.family, font.style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CW) as string[];
    for (const line of lines) {
      checkBreak(lh);
      doc.text(line, PAGE_W / 2, y, { align: 'center' });
      y += lh;
    }
  };

  /** APA body paragraph — first-line indent 0.5in, double-spaced */
  const writeParagraph = (text: string) => {
    const font = resolveFont(text, 'normal');
    doc.setFont(font.family, font.style);
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(text, CW) as string[];
    for (let i = 0; i < lines.length; i++) {
      checkBreak(LH);
      doc.text(lines[i], i === 0 ? ML + INDENT : ML, y);
      y += LH;
    }
    y += LH * 0.5; // half-line gap between paragraphs
  };

  // ══════════════════════════════════════════════════════════════
  // 1. RUNNING HEAD PLACEHOLDER + TITLE BLOCK (APA title page style)
  // ══════════════════════════════════════════════════════════════
  // Magazine header
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 140, 60);
  doc.text('REVISTA CONOZCA', ML, y);
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.4);
  doc.line(ML, y + 2, PAGE_W - MR, y + 2);
  y += 12;

  // APA Title — centered, bold, 14pt
  writeCenter(data.title, 14, 'bold', [20, 20, 20], 8);
  y += 4;

  // Author — centered, normal
  if (data.authorName) {
    writeCenter(data.authorName, FONT_BODY, 'normal', [60, 60, 60], LH_TIGHT);
  }

  // Affiliation line — Revista Conozca
  writeCenter('Revista Conozca', FONT_BODY, 'italic', [100, 100, 100], LH_TIGHT);

  // Date & category
  const meta: string[] = [];
  if (data.publishedAt) meta.push(formatDate(data.publishedAt));
  if (data.categoryName) meta.push(data.categoryName);
  if (meta.length) {
    writeCenter(meta.join('  ·  '), 10, 'normal', [120, 120, 120], LH_TIGHT);
  }
  y += 8;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 10;

  // ══════════════════════════════════════════════════════════════
  // 2. BODY CONTENT — APA formatted blocks
  // ══════════════════════════════════════════════════════════════
  const blocks = parseBlocks(data.content);

  for (const block of blocks) {
    switch (block.type) {
      case 'h1':
        // APA Level 1: centered, bold
        checkBreak(LH + 4);
        y += LH * 0.5;
        writeCenter(block.text, FONT_BODY, 'bold', [20, 20, 20], LH_TIGHT);
        y += LH * 0.5;
        break;

      case 'h2':
        // APA Level 2: flush left, bold
        checkBreak(LH + 4);
        y += LH * 0.5;
        write(block.text, FONT_BODY, 'bold', [20, 20, 20], LH_TIGHT);
        y += LH * 0.5;
        break;

      case 'h3':
        // APA Level 3: flush left, bold italic
        checkBreak(LH + 4);
        y += LH * 0.3;
        write(block.text, FONT_BODY, 'bolditalic', [40, 40, 40], LH_TIGHT);
        y += LH * 0.3;
        break;

      case 'h4':
        // APA Level 4: indented, bold, ends naturally
        checkBreak(LH);
        write(block.text, FONT_BODY, 'bold', [40, 40, 40], LH_TIGHT, INDENT, CW - INDENT);
        break;

      case 'blockquote':
        // APA block quote: indented 1 inch both sides, no indent
        checkBreak(LH);
        y += LH * 0.25;
        write(block.text, FONT_BODY, 'normal', [60, 60, 60], LH, INDENT, CW - INDENT * 2);
        y += LH * 0.25;
        break;

      case 'li':
        checkBreak(LH);
        write(`• ${block.text}`, FONT_BODY, 'normal', [30, 30, 30], LH, INDENT * 0.5, CW - INDENT * 0.5);
        break;

      case 'p':
      default:
        writeParagraph(block.text);
        break;
    }
  }

  y += LH;

  // ══════════════════════════════════════════════════════════════
  // 3. LEGAL NOTICE
  // ══════════════════════════════════════════════════════════════
  checkBreak(30);
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.4);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 6;
  write('AVISO LEGAL', 9, 'bold', [180, 140, 60], LH_TIGHT);
  y += 2;
  write(ATTRIBUTION, 9, 'italic', [100, 100, 100], 4.5);
  y += 8;

  // ══════════════════════════════════════════════════════════════
  // 4. CITATIONS
  // ══════════════════════════════════════════════════════════════
  checkBreak(50);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://conozca.org';
  const citationData: CitationData = {
    title: data.title, authorName: data.authorName,
    publishedAt: data.publishedAt, slug: data.slug, siteUrl,
  };
  const citations = generateAllCitations(citationData);

  write('CÓMO CITAR ESTE ARTÍCULO', 10, 'bold', [20, 20, 20], LH_TIGHT);
  y += 4;
  for (const { label, text } of [
    { label: 'APA (7ª ed.)', text: citations.apa },
    { label: 'Chicago (17ª ed.)', text: citations.chicago },
    { label: 'Turabian', text: citations.turabian },
  ]) {
    checkBreak(18);
    write(label, 9, 'bold', [80, 80, 80], LH_TIGHT);
    y += 1;
    write(text, 9, 'normal', [60, 60, 60], 4.5);
    y += 5;
  }

  // ══════════════════════════════════════════════════════════════
  // 5. WATERMARK + PAGE NUMBERS
  // ══════════════════════════════════════════════════════════════
  addWatermark(doc);
  const shortTitle = data.title.length > 50 ? data.title.slice(0, 50) : data.title;
  addPageNumbers(doc, shortTitle, greekFontReady);

  const safeSlug = data.slug.replace(/[^a-z0-9-]/gi, '_');
  doc.save(`conozca-${safeSlug}.pdf`);
}
