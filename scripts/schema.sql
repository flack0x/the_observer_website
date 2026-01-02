-- Articles table for storing Telegram posts
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gbqvivmfivsuvvdkoiuc/sql

CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    telegram_id TEXT NOT NULL UNIQUE,
    channel TEXT NOT NULL CHECK (channel IN ('en', 'ar')),
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Analysis',
    telegram_link TEXT NOT NULL,
    telegram_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_channel ON articles(channel);
CREATE INDEX IF NOT EXISTS idx_articles_telegram_date ON articles(telegram_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT
    USING (true);

-- Create policy to allow service role full access (for Python script)
CREATE POLICY "Allow service role full access" ON articles
    FOR ALL
    USING (auth.role() = 'service_role');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON articles TO anon;
GRANT SELECT ON articles TO authenticated;
GRANT ALL ON articles TO service_role;
