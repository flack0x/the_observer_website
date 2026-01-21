-- Create article_interactions table
CREATE TABLE IF NOT EXISTS article_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('like', 'dislike')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- Create article_shares table
CREATE TABLE IF NOT EXISTS article_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null if anonymous? For now let's say null allowed for tracking
    platform TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_shares ENABLE ROW LEVEL SECURITY;

-- Policies for interactions
CREATE POLICY "Public can view interactions" ON article_interactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create interactions" ON article_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON article_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON article_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for shares
CREATE POLICY "Public can insert shares" ON article_shares
    FOR INSERT WITH CHECK (true); -- Allow anonymous shares logging? If yes, need to handle user_id carefully.
    -- If we want only auth users to share, change to auth.uid() = user_id. 
    -- Requirement says "users", implying logged in, but sharing is usually public. 
    -- Let's allow public insert but user_id will be null for anon.

CREATE POLICY "Public can view shares" ON article_shares
    FOR SELECT USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_interactions_article ON article_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON article_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_article ON article_shares(article_id);
