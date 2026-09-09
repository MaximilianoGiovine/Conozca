-- On-demand machine translation of articles
-- Adds bookkeeping columns so the reader UI can flag auto-translated versions
-- and so editors can later spot / override them in the CMS.

ALTER TABLE public.article_translations
    ADD COLUMN IF NOT EXISTS is_machine_translated BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.article_translations
    ADD COLUMN IF NOT EXISTS source_language_code TEXT;

ALTER TABLE public.article_translations
    ADD COLUMN IF NOT EXISTS translated_at TIMESTAMP WITH TIME ZONE;

-- Existing rows were authored/translated by editors, keep them as canonical.
UPDATE public.article_translations
    SET is_machine_translated = false
    WHERE is_machine_translated IS NULL;
