-- Búsqueda de artículos que ignora acentos y mayúsculas.
-- La usan las sugerencias del header y la página /buscar.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.normalize_search_text(value TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
STRICT
PARALLEL SAFE
SET search_path = ''
AS $$
    SELECT pg_catalog.lower(extensions.unaccent('extensions.unaccent'::regdictionary, value));
$$;

-- Devuelve los artículos publicados cuyo título (en p_locale o en español) o autor
-- contienen todas las palabras de p_query, en cualquier orden. Cada artículo aparece
-- una sola vez, con la versión en p_locale si existe y si no con la versión en español.
CREATE OR REPLACE FUNCTION public.search_articles(p_query TEXT, p_locale TEXT)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    author_name TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    title TEXT,
    excerpt TEXT
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    WITH keywords AS (
        SELECT array_agg(word) AS list
        FROM regexp_split_to_table(public.normalize_search_text(p_query), '\s+') AS word
        WHERE word <> ''
    )
    SELECT a.id, a.slug, a.author_name, a.published_at, preferred.title, preferred.excerpt
    FROM public.articles AS a
    CROSS JOIN keywords
    CROSS JOIN LATERAL (
        SELECT t.title, t.excerpt
        FROM public.article_translations AS t
        WHERE t.article_id = a.id
          AND t.language_code IN (p_locale, 'es')
        ORDER BY t.language_code = p_locale DESC
        LIMIT 1
    ) AS preferred
    WHERE keywords.list IS NOT NULL
      AND a.published_at <= now()
      AND (
          NOT EXISTS (
              SELECT 1 FROM unnest(keywords.list) AS word
              WHERE strpos(public.normalize_search_text(COALESCE(a.author_name, '')), word) = 0
          )
          OR EXISTS (
              SELECT 1
              FROM public.article_translations AS t
              WHERE t.article_id = a.id
                AND t.language_code IN (p_locale, 'es')
                AND NOT EXISTS (
                    SELECT 1 FROM unnest(keywords.list) AS word
                    WHERE strpos(public.normalize_search_text(t.title), word) = 0
                )
          )
      );
$$;

GRANT EXECUTE ON FUNCTION public.normalize_search_text(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_articles(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
