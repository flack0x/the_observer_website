-- Add slug column to articles table for SEO-friendly URLs
ALTER TABLE articles ADD COLUMN slug TEXT;

-- Unique index: slug must be unique per channel (EN/AR can share same slug)
-- Will be enforced after backfill populates all slugs
-- CREATE UNIQUE INDEX idx_articles_slug_channel ON articles(slug, channel);
-- NOTE: Run after backfill script: ALTER TABLE articles ALTER COLUMN slug SET NOT NULL;
