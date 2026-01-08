-- Add media fields to articles table for image and video support

ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add index for filtering articles with media
CREATE INDEX IF NOT EXISTS idx_articles_has_media ON articles((image_url IS NOT NULL OR video_url IS NOT NULL));

COMMENT ON COLUMN articles.image_url IS 'Public URL to article featured image in Supabase Storage';
COMMENT ON COLUMN articles.video_url IS 'Public URL to article video in Supabase Storage';
