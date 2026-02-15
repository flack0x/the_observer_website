-- Fix Supabase Security Advisor WARN + INFO Warnings
-- 1. auth_rls_initplan: Wrap auth.uid()/auth.role() in (select ...) for per-statement eval
-- 2. multiple_permissive_policies: Merge overlapping policies, drop redundant service_role policies
-- 3. unindexed_foreign_keys: Add missing FK indexes
-- 4. unused_index: Drop clearly unnecessary indexes (keep search/GIN indexes)

-- ============================================
-- 1. news_headlines: Drop redundant service_role policy
--    (service_role bypasses RLS automatically)
--    Also fixes: multiple_permissive_policies for SELECT
-- ============================================

DROP POLICY IF EXISTS "Allow service role full access" ON news_headlines;

-- ============================================
-- 2. article_interactions: Fix auth_rls_initplan
--    Replace auth.uid() with (select auth.uid())
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create interactions" ON article_interactions;
DROP POLICY IF EXISTS "Auth users can modify own interactions" ON article_interactions;
DROP POLICY IF EXISTS "Auth users can delete own interactions" ON article_interactions;

-- Recreate with (select auth.uid())
CREATE POLICY "Anyone can create interactions" ON article_interactions
    FOR INSERT WITH CHECK (
        ((select auth.uid()) = user_id) OR (user_id IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Auth users can modify own interactions" ON article_interactions
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Auth users can delete own interactions" ON article_interactions
    FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- 3. bookmarks: Fix auth_rls_initplan
--    Replace auth.uid() with (select auth.uid())
-- ============================================

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
    FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- 4. article_comments: Fix auth_rls_initplan + multiple_permissive_policies
--    Merge admin + user policies into single policies per action
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Public can view approved comments" ON article_comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON article_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON article_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON article_comments;
DROP POLICY IF EXISTS "Admins can update any comment" ON article_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON article_comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON article_comments;

-- SELECT: Public sees approved, admins see all (single policy)
CREATE POLICY "View comments" ON article_comments
    FOR SELECT USING (
        is_approved = true
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = (select auth.uid())
            AND user_profiles.role = 'admin'
        )
    );

-- INSERT: Auth users or guests with name+session
CREATE POLICY "Create comments" ON article_comments
    FOR INSERT WITH CHECK (
        ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
        OR ((select auth.uid()) IS NULL AND user_id IS NULL AND guest_name IS NOT NULL AND session_id IS NOT NULL)
    );

-- UPDATE: Own comments (auth or guest) or admin any
CREATE POLICY "Update comments" ON article_comments
    FOR UPDATE
    USING (
        ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id)
        OR (session_id IS NOT NULL AND user_id IS NULL)
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = (select auth.uid())
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id)
        OR (session_id IS NOT NULL AND user_id IS NULL)
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = (select auth.uid())
            AND user_profiles.role = 'admin'
        )
    );

-- DELETE: Own comments (auth or guest) or admin any
CREATE POLICY "Delete comments" ON article_comments
    FOR DELETE USING (
        ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id)
        OR (session_id IS NOT NULL AND user_id IS NULL)
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = (select auth.uid())
            AND user_profiles.role = 'admin'
        )
    );

-- ============================================
-- 5. activity_log: Fix auth_rls_initplan + multiple_permissive_policies
--    Drop redundant service_role policy, fix (select auth.uid())
-- ============================================

DROP POLICY IF EXISTS "Service role full access on activity_log" ON activity_log;
DROP POLICY IF EXISTS "Staff can read activity log" ON activity_log;
DROP POLICY IF EXISTS "Staff can create activity log" ON activity_log;

CREATE POLICY "Staff can read activity log" ON activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = (select auth.uid()) AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Staff can create activity log" ON activity_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = (select auth.uid()) AND role IN ('admin', 'editor')
        )
    );

-- ============================================
-- 6. book_reviews: Fix multiple_permissive_policies for SELECT
--    Merge "Authenticated can read all" + "Public can read published"
--    into single policy: published for all, all for staff
-- ============================================

DROP POLICY IF EXISTS "Public can read published reviews" ON book_reviews;
DROP POLICY IF EXISTS "Authenticated can read all reviews" ON book_reviews;

CREATE POLICY "Read reviews" ON book_reviews
    FOR SELECT USING (
        status = 'published'
        OR EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
        )
    );

-- ============================================
-- 7. Add missing foreign key indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_article_shares_user_id ON article_shares (user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_author_id ON book_reviews (author_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_last_edited_by ON book_reviews (last_edited_by);

-- ============================================
-- 8. Drop unused indexes
--    Only dropping indexes on small/rarely-queried tables.
--    Keeping GIN indexes (countries, organizations, search) and
--    indexes that may be needed as data grows.
-- ============================================

-- articles: Keep idx_articles_search (full-text GIN), idx_articles_countries, idx_articles_organizations
-- These may appear unused but are critical for search and future analytics queries
DROP INDEX IF EXISTS idx_articles_has_media;
DROP INDEX IF EXISTS idx_articles_author;
DROP INDEX IF EXISTS idx_articles_scheduled_at;

-- metrics: small table, index unnecessary
DROP INDEX IF EXISTS idx_metrics_computed_at;

-- user_profiles: very small table (1 row), index provides no benefit
DROP INDEX IF EXISTS idx_user_profiles_role;

-- subscribers: email already has UNIQUE constraint which creates an implicit index
DROP INDEX IF EXISTS idx_subscribers_email;
DROP INDEX IF EXISTS idx_subscribers_active_locale;

-- book_reviews: small table (14 rows)
DROP INDEX IF EXISTS idx_book_reviews_channel;

-- article_revisions: rarely queried table
DROP INDEX IF EXISTS idx_revisions_created;
DROP INDEX IF EXISTS idx_article_revisions_edited_by;

-- news_headlines: keep source/published indexes as data grows from RSS feeds
-- (dropping anyway since table is rebuilt frequently)
DROP INDEX IF EXISTS idx_news_headlines_source;
DROP INDEX IF EXISTS idx_news_headlines_published;

-- article_comments: keep parent index (threading), drop others on small table
DROP INDEX IF EXISTS idx_comments_user;
DROP INDEX IF EXISTS idx_comments_created;
DROP INDEX IF EXISTS idx_comments_session;

-- activity_log: small table
DROP INDEX IF EXISTS idx_activity_log_user_id;
DROP INDEX IF EXISTS idx_activity_log_action;
DROP INDEX IF EXISTS idx_activity_log_target_type;
