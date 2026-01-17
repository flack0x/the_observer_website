-- News Headlines table for external news aggregation
-- Stores headlines fetched from international news sources

CREATE TABLE IF NOT EXISTS news_headlines (
    id BIGSERIAL PRIMARY KEY,
    headline_id TEXT NOT NULL UNIQUE,
    source_name TEXT NOT NULL,
    source_country TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'World',
    language TEXT NOT NULL CHECK (language IN ('en', 'ar', 'other')),
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_news_headlines_language ON news_headlines(language);
CREATE INDEX IF NOT EXISTS idx_news_headlines_source ON news_headlines(source_name);
CREATE INDEX IF NOT EXISTS idx_news_headlines_active ON news_headlines(is_active);
CREATE INDEX IF NOT EXISTS idx_news_headlines_fetched ON news_headlines(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_headlines_published ON news_headlines(published_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE news_headlines ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON news_headlines
    FOR SELECT
    USING (true);

-- Create policy to allow service role full access (for Python script)
CREATE POLICY "Allow service role full access" ON news_headlines
    FOR ALL
    USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON news_headlines TO anon;
GRANT SELECT ON news_headlines TO authenticated;
GRANT ALL ON news_headlines TO service_role;
