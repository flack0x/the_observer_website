-- Migration: Add structured post fields
-- Run this in Supabase SQL Editor after the initial schema

-- Add countries column (array of country names)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS countries TEXT[] DEFAULT '{}';

-- Add organizations column (array of organization names)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS organizations TEXT[] DEFAULT '{}';

-- Add is_structured flag to track posts using the new format
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_structured BOOLEAN DEFAULT FALSE;

-- Create indexes for the new columns (for filtering/searching)
CREATE INDEX IF NOT EXISTS idx_articles_countries ON articles USING GIN(countries);
CREATE INDEX IF NOT EXISTS idx_articles_organizations ON articles USING GIN(organizations);
CREATE INDEX IF NOT EXISTS idx_articles_is_structured ON articles(is_structured);

-- Update comment
COMMENT ON COLUMN articles.countries IS 'Array of country names mentioned in the article';
COMMENT ON COLUMN articles.organizations IS 'Array of organization names mentioned in the article';
COMMENT ON COLUMN articles.is_structured IS 'Whether the post uses the structured header format';
