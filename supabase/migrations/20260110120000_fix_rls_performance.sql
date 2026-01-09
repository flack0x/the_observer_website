-- Fix RLS Performance Issues from Supabase Linter
-- 1. Wrap auth.uid() and auth.role() in (select ...) to avoid per-row re-evaluation
-- 2. Remove duplicate permissive policies
-- 3. Add missing indexes on foreign keys

-- ============================================
-- 1. FIX USER_PROFILES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON user_profiles;

-- Optimized: wrap auth.uid() in (select ...)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Allow profile creation" ON user_profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- ============================================
-- 2. FIX METRICS POLICIES
-- ============================================

-- Remove duplicate SELECT policies
DROP POLICY IF EXISTS "Allow public read access to metrics" ON metrics;
DROP POLICY IF EXISTS "Anyone can read metrics" ON metrics;
DROP POLICY IF EXISTS "Service role can insert metrics" ON metrics;
DROP POLICY IF EXISTS "Service role can update metrics" ON metrics;
DROP POLICY IF EXISTS "Service role can delete metrics" ON metrics;

-- Single public read policy (no auth check needed)
CREATE POLICY "Public can read metrics" ON metrics
    FOR SELECT USING (true);

-- Optimized service role policies with (select ...)
CREATE POLICY "Service role can insert metrics" ON metrics
    FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Service role can update metrics" ON metrics
    FOR UPDATE USING ((select auth.role()) = 'service_role');

CREATE POLICY "Service role can delete metrics" ON metrics
    FOR DELETE USING ((select auth.role()) = 'service_role');

-- ============================================
-- 3. FIX ARTICLES POLICIES
-- ============================================

-- The issue: "Public can read published articles" and "Staff can read all articles"
-- are both permissive SELECT policies that get OR'd together and both evaluated.
-- Solution: Combine into single policy using CASE logic

DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Staff can read all articles" ON articles;
DROP POLICY IF EXISTS "Staff can create articles" ON articles;
DROP POLICY IF EXISTS "Staff can update articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;

-- Single optimized SELECT policy that handles both cases
CREATE POLICY "Read articles" ON articles
    FOR SELECT USING (
        -- Published articles are public
        status = 'published'
        OR
        -- Staff can read all articles (draft, published, archived)
        (
            (select auth.uid()) IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM user_profiles up
                WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
            )
        )
    );

-- Optimized insert policy
CREATE POLICY "Staff can create articles" ON articles
    FOR INSERT WITH CHECK (
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
        )
    );

-- Optimized update policy
CREATE POLICY "Staff can update articles" ON articles
    FOR UPDATE USING (
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
        )
    );

-- Optimized delete policy
CREATE POLICY "Admins can delete articles" ON articles
    FOR DELETE USING (
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role = 'admin'
        )
    );

-- ============================================
-- 4. FIX ARTICLE_REVISIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Staff can read revisions" ON article_revisions;
DROP POLICY IF EXISTS "Staff can create revisions" ON article_revisions;

CREATE POLICY "Staff can read revisions" ON article_revisions
    FOR SELECT USING (
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Staff can create revisions" ON article_revisions
    FOR INSERT WITH CHECK (
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
        )
    );

-- ============================================
-- 5. FIX SUBSCRIBERS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Service role manages subscribers" ON subscribers;
DROP POLICY IF EXISTS "Service role can delete subscribers" ON subscribers;

CREATE POLICY "Service role manages subscribers" ON subscribers
    FOR SELECT USING ((select auth.role()) = 'service_role');

CREATE POLICY "Service role can delete subscribers" ON subscribers
    FOR DELETE USING ((select auth.role()) = 'service_role');

-- ============================================
-- 6. FIX STORAGE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Staff can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;

CREATE POLICY "Staff can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'article-media' AND
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Staff can update media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'article-media' AND
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'article-media' AND
        (select auth.uid()) IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = (select auth.uid()) AND up.role = 'admin'
        )
    );

-- ============================================
-- 7. ADD MISSING FOREIGN KEY INDEXES
-- ============================================

-- These were flagged as INFO level but good to add for JOINs
CREATE INDEX IF NOT EXISTS idx_article_revisions_edited_by ON article_revisions(edited_by);
CREATE INDEX IF NOT EXISTS idx_articles_last_edited_by ON articles(last_edited_by);
