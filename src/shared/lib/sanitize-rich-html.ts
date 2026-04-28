import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br',
    'strong', 'em', 'u', 's',
    'blockquote',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img',
    'hr', 'code', 'pre',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
  },
  // Convertir <div> a <p> para normalizar artículos migrados de WordPress
  transformTags: {
    div: 'p',
  },
  disallowedTagsMode: 'discard',
  parseStyleAttributes: false,
};

/** Normaliza HTML para garantizar párrafos visibles en todos los artículos */
function normalizeHtml(html: string): string {
  // 1. Convertir dobles <br> (separadores de párrafo de WordPress) en </p><p>
  let result = html.replace(/(<br\s*\/?>\s*){2,}/gi, '</p><p>');

  // 2. Si no hay elementos de bloque, el contenido es texto plano o solo <br> simples
  const hasBlock = /<(p|h[1-6]|blockquote|ul|ol|li)\b/i.test(result);

  if (!hasBlock) {
    // Dividir por saltos de línea dobles y envolver en <p>
    const paragraphs = result
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map(chunk => chunk.replace(/\n/g, ' ').trim())
      .filter(Boolean);

    if (paragraphs.length > 1) {
      result = paragraphs.map(p => `<p>${p}</p>`).join('');
    } else if (result.trim()) {
      // Todo el contenido en un solo bloque: envolver completo
      result = `<p>${result.replace(/\n/g, ' ').trim()}</p>`;
    }
  }

  return result;
}

export function sanitizeRichHtml(unsafeHtml: string): string {
  const sanitized = sanitizeHtml(unsafeHtml, SANITIZE_OPTIONS);
  return normalizeHtml(sanitized);
}