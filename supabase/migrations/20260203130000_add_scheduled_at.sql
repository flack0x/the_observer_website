-- Add scheduled_at column for scheduled publishing
-- Articles remain in draft until manually published

ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Partial index for efficient queries on scheduled articles
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at
    ON articles(scheduled_at)
    WHERE scheduled_at IS NOT NULL;
