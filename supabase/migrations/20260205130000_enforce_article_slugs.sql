-- Enforce NOT NULL on slug column (all existing articles have been backfilled)
ALTER TABLE articles ALTER COLUMN slug SET NOT NULL;

-- Unique index: slug must be unique per channel
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug_channel ON articles(slug, channel);
