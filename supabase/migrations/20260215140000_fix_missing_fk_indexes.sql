-- Fix: Re-add FK indexes that were accidentally dropped in previous migration
-- Also drop remaining unused non-FK indexes

-- ============================================
-- 1. Re-add FK-covering indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON article_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_article_revisions_edited_by ON article_revisions (edited_by);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles (author_id);

-- ============================================
-- 2. Drop remaining unused non-FK indexes
--    These are GIN/btree indexes with zero usage
-- ============================================

DROP INDEX IF EXISTS idx_articles_countries;
DROP INDEX IF EXISTS idx_articles_organizations;
DROP INDEX IF EXISTS idx_articles_search;
DROP INDEX IF EXISTS idx_comments_parent;
