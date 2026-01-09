-- Fix RLS infinite recursion issue
-- The problem: policies on articles reference user_profiles, which has its own policies

-- ============================================
-- 1. FIX USER_PROFILES POLICIES
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access on profiles" ON user_profiles;

-- Simple policy: users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Simple policy: users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow insert for new user signup (trigger runs as SECURITY DEFINER)
CREATE POLICY "Allow profile creation" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. FIX ARTICLES POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Staff can read all articles" ON articles;
DROP POLICY IF EXISTS "Staff can create articles" ON articles;
DROP POLICY IF EXISTS "Staff can update articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;
DROP POLICY IF EXISTS "Service role full access on articles" ON articles;

-- Public can read published articles (no user_profiles check needed)
CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT USING (status = 'published');

-- Authenticated users can read all articles if they have staff role
-- Use a subquery that doesn't cause recursion
CREATE POLICY "Staff can read all articles" ON articles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'editor')
        )
    );

-- Staff can create articles
CREATE POLICY "Staff can create articles" ON articles
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'editor')
        )
    );

-- Staff can update articles
CREATE POLICY "Staff can update articles" ON articles
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'editor')
        )
    );

-- Admins can delete articles
CREATE POLICY "Admins can delete articles" ON articles
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- ============================================
-- 3. FIX ARTICLE_REVISIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Staff can read revisions" ON article_revisions;
DROP POLICY IF EXISTS "Staff can create revisions" ON article_revisions;
DROP POLICY IF EXISTS "Service role full access on revisions" ON article_revisions;

CREATE POLICY "Staff can read revisions" ON article_revisions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Staff can create revisions" ON article_revisions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'editor')
        )
    );

-- ============================================
-- 4. FIX STORAGE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Staff can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;

CREATE POLICY "Staff can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'article-media' AND
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Staff can update media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'article-media' AND
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'article-media' AND
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );
