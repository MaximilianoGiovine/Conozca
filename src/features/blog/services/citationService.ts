/**
 * Servicio de generación de citas bibliográficas para artículos de Revista Conozca.
 * Soporta formatos APA (7th ed.), Chicago (17th ed.) y Turabian.
 */

export interface CitationData {
  title: string;
  authorName: string | null;
  publishedAt: string | null;
  slug: string;
  siteUrl?: string;
}

const MAGAZINE_NAME = 'Revista Conozca';
const DEFAULT_SITE_URL = 'https://conozca.org';

/**
 * Splits "Nombre Apellido" into { firstName, lastName }.
 * If only one word, treats it as lastName.
 */
function parseAuthorName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] };
  }
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(' ');
  return { firstName, lastName };
}

function getFirstInitial(firstName: string): string {
  if (!firstName) return '';
  return firstName.charAt(0).toUpperCase() + '.';
}

function formatDateLong(dateString: string, locale = 'es'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getYear(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
}

function buildArticleUrl(slug: string, siteUrl: string): string {
  return `${siteUrl}/blog/${slug}`;
}

// ─── APA 7th Edition ─────────────────────────────────────────────
// Format: Apellido, N. (Año). Título del artículo. *Revista Conozca*. URL
export function generateAPA(data: CitationData): string {
  const url = buildArticleUrl(data.slug, data.siteUrl || DEFAULT_SITE_URL);
  const year = data.publishedAt ? getYear(data.publishedAt) : 's.f.';

  if (!data.authorName) {
    return `${data.title}. (${year}). ${MAGAZINE_NAME}. ${url}`;
  }

  const { firstName, lastName } = parseAuthorName(data.authorName);
  const initial = getFirstInitial(firstName);
  const authorPart = initial ? `${lastName}, ${initial}` : lastName;

  return `${authorPart} (${year}). ${data.title}. ${MAGAZINE_NAME}. ${url}`;
}

// ─── Chicago 17th Edition (Notes-Bibliography) ──────────────────
// Format: Apellido, Nombre. "Título del artículo." *Revista Conozca*, Fecha. URL
export function generateChicago(data: CitationData): string {
  const url = buildArticleUrl(data.slug, data.siteUrl || DEFAULT_SITE_URL);
  const datePart = data.publishedAt ? formatDateLong(data.publishedAt) : '';

  if (!data.authorName) {
    return `"${data.title}." ${MAGAZINE_NAME}${datePart ? `, ${datePart}` : ''}. ${url}`;
  }

  const { firstName, lastName } = parseAuthorName(data.authorName);
  const authorPart = firstName ? `${lastName}, ${firstName}` : lastName;

  return `${authorPart}. "${data.title}." ${MAGAZINE_NAME}${datePart ? `, ${datePart}` : ''}. ${url}`;
}

// ─── Turabian ────────────────────────────────────────────────────
// Format: Apellido, Nombre. "Título del artículo." *Revista Conozca*. Fecha. URL
export function generateTurabian(data: CitationData): string {
  const url = buildArticleUrl(data.slug, data.siteUrl || DEFAULT_SITE_URL);
  const datePart = data.publishedAt ? formatDateLong(data.publishedAt) : '';

  if (!data.authorName) {
    return `"${data.title}." ${MAGAZINE_NAME}. ${datePart ? `${datePart}. ` : ''}${url}`;
  }

  const { firstName, lastName } = parseAuthorName(data.authorName);
  const authorPart = firstName ? `${lastName}, ${firstName}` : lastName;

  return `${authorPart}. "${data.title}." ${MAGAZINE_NAME}. ${datePart ? `${datePart}. ` : ''}${url}`;
}

/**
 * Generates all three citation formats at once.
 */
export function generateAllCitations(data: CitationData) {
  return {
    apa: generateAPA(data),
    chicago: generateChicago(data),
    turabian: generateTurabian(data),
  };
}
