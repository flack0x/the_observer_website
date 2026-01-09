-- Admin System Migration
-- Creates user profiles, roles, and updates articles for CMS support

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON user_profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can insert profiles (for inviting users)
CREATE POLICY "Admins can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Service role has full access
CREATE POLICY "Service role full access on profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. FUNCTION TO CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. UPDATE ARTICLES TABLE FOR CMS
-- ============================================

-- Add new columns for CMS support
ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES user_profiles(id);

-- Index for author and status queries
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

-- Set published_at for existing articles
UPDATE articles SET published_at = telegram_date WHERE published_at IS NULL;

-- ============================================
-- 4. UPDATE ARTICLES RLS POLICIES
-- ============================================

-- Drop existing policies to recreate with new rules
DROP POLICY IF EXISTS "Allow public read access" ON articles;
DROP POLICY IF EXISTS "Allow service role full access" ON articles;

-- Public can only read published articles
CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT USING (status = 'published');

-- Authenticated staff can read all articles
CREATE POLICY "Staff can read all articles" ON articles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can create articles
CREATE POLICY "Staff can create articles" ON articles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can update articles
CREATE POLICY "Staff can update articles" ON articles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Only admins can delete articles
CREATE POLICY "Admins can delete articles" ON articles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service role has full access (for Python scripts)
CREATE POLICY "Service role full access on articles" ON articles
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 5. ARTICLE REVISIONS TABLE (AUDIT TRAIL)
-- ============================================

CREATE TABLE IF NOT EXISTS article_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    edited_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_article ON article_revisions(article_id);
CREATE INDEX IF NOT EXISTS idx_revisions_created ON article_revisions(created_at DESC);

-- Enable RLS
ALTER TABLE article_revisions ENABLE ROW LEVEL SECURITY;

-- Staff can read revisions
CREATE POLICY "Staff can read revisions" ON article_revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Staff can create revisions
CREATE POLICY "Staff can create revisions" ON article_revisions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Service role access
CREATE POLICY "Service role full access on revisions" ON article_revisions
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 6. STORAGE POLICIES FOR AUTHENTICATED USERS
-- ============================================

-- Allow authenticated staff to upload media
CREATE POLICY "Staff can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'article-media' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Allow authenticated staff to update media
CREATE POLICY "Staff can update media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'article-media' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Allow admins to delete media
CREATE POLICY "Admins can delete media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'article-media' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON user_profiles TO authenticated;
GRANT UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

GRANT SELECT, INSERT, UPDATE ON articles TO authenticated;
GRANT DELETE ON articles TO authenticated;
GRANT ALL ON articles TO service_role;

GRANT SELECT, INSERT ON article_revisions TO authenticated;
GRANT ALL ON article_revisions TO service_role;
