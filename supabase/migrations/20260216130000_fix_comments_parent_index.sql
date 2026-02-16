-- Fix: Re-add index for article_comments.parent_id FK
-- Was dropped as "unused" but is needed for FK constraint

CREATE INDEX IF NOT EXISTS idx_comments_parent ON article_comments (parent_id);
