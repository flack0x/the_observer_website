-- Add counters to articles table for performance
ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0;

-- Update article_interactions for guest support
ALTER TABLE article_interactions
    ADD COLUMN IF NOT EXISTS session_id TEXT,
    ALTER COLUMN user_id DROP NOT NULL;

-- Update unique constraint to handle both auth and guest users
-- We drop the old constraint and add a new check
ALTER TABLE article_interactions DROP CONSTRAINT IF EXISTS article_interactions_article_id_user_id_key;

-- Create a unique index that enforces uniqueness:
-- Either (article_id, user_id) is unique (for logged in)
-- OR (article_id, session_id) is unique (for guests)
CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_unique_user 
    ON article_interactions(article_id, user_id) 
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_unique_session 
    ON article_interactions(article_id, session_id) 
    WHERE session_id IS NOT NULL;

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_view_count(p_article_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE articles
    SET views = views + 1
    WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update aggregate counts
CREATE OR REPLACE FUNCTION update_article_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.interaction_type = 'like' THEN
            UPDATE articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
        ELSIF NEW.interaction_type = 'dislike' THEN
            UPDATE articles SET dislikes_count = dislikes_count + 1 WHERE id = NEW.article_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.interaction_type = 'like' THEN
            UPDATE articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.article_id;
        ELSIF OLD.interaction_type = 'dislike' THEN
            UPDATE articles SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.article_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for interaction counts
DROP TRIGGER IF EXISTS update_interaction_counts ON article_interactions;
CREATE TRIGGER update_interaction_counts
    AFTER INSERT OR DELETE ON article_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_article_interaction_counts();

-- Recalculate existing counts
UPDATE articles a
SET 
    likes_count = (SELECT count(*) FROM article_interactions WHERE article_id = a.id AND interaction_type = 'like'),
    dislikes_count = (SELECT count(*) FROM article_interactions WHERE article_id = a.id AND interaction_type = 'dislike');

-- Update policies for guest access
DROP POLICY IF EXISTS "Public can view interactions" ON article_interactions;
CREATE POLICY "Public can view interactions" ON article_interactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create interactions" ON article_interactions;
CREATE POLICY "Anyone can create interactions" ON article_interactions
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR (user_id IS NULL AND session_id IS NOT NULL)
    );

DROP POLICY IF EXISTS "Users can update own interactions" ON article_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON article_interactions;

-- Allow update/delete based on user_id OR session_id
CREATE POLICY "Users can modify own interactions" ON article_interactions
    FOR UPDATE USING (
        (auth.uid() = user_id) OR (session_id = current_setting('request.headers')::json->>'x-session-id')
    );

CREATE POLICY "Users can delete own interactions" ON article_interactions
    FOR DELETE USING (
        (auth.uid() = user_id) OR (session_id = current_setting('request.headers')::json->>'x-session-id')
    );

-- Allow public to call increment_view_count
GRANT EXECUTE ON FUNCTION increment_view_count TO anon, authenticated, service_role;
