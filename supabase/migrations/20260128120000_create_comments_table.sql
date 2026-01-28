-- Create article_comments table
CREATE TABLE IF NOT EXISTS article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 3 AND char_length(content) <= 2000),
    is_approved BOOLEAN DEFAULT true,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
-- Anyone can view approved comments
CREATE POLICY "Public can view approved comments" ON article_comments
    FOR SELECT USING (is_approved = true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON article_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON article_comments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON article_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all comments (using user_profiles role)
CREATE POLICY "Admins can view all comments" ON article_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update any comment" ON article_comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete any comment" ON article_comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_article ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON article_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON article_comments(created_at DESC);

-- Add comment_count to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment count
DROP TRIGGER IF EXISTS trigger_update_comment_count ON article_comments;
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON article_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_comment_updated_at ON article_comments;
CREATE TRIGGER trigger_comment_updated_at
    BEFORE UPDATE OF content ON article_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_updated_at();
