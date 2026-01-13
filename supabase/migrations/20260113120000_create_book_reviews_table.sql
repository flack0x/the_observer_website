-- Book Reviews Table for The Observer
-- Migration: 20260113120000_create_book_reviews_table.sql

-- Create the book_reviews table
CREATE TABLE IF NOT EXISTS book_reviews (
  id SERIAL PRIMARY KEY,
  review_id TEXT UNIQUE NOT NULL,        -- e.g., "book/1234-ten-myths-israel-en"
  channel TEXT NOT NULL CHECK (channel IN ('en', 'ar')),

  -- Book info
  book_title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_image_url TEXT,

  -- Review content
  excerpt TEXT,                           -- Short summary (1-2 sentences)
  description TEXT NOT NULL,              -- Full review description
  key_points TEXT[],                      -- Array of key points/chapters

  -- Rating system
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  recommendation_level TEXT CHECK (recommendation_level IN ('essential', 'recommended', 'optional')),

  -- Metadata
  telegram_link TEXT,                     -- Link to Telegram post
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Admin tracking
  author_id UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_book_reviews_channel ON book_reviews(channel);
CREATE INDEX IF NOT EXISTS idx_book_reviews_status ON book_reviews(status);
CREATE INDEX IF NOT EXISTS idx_book_reviews_created_at ON book_reviews(created_at DESC);

-- Enable RLS
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

-- Public read policy for published reviews
CREATE POLICY "Public can read published reviews" ON book_reviews
  FOR SELECT USING (status = 'published');

-- Authenticated users can read all reviews (for admin)
CREATE POLICY "Authenticated can read all reviews" ON book_reviews
  FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated can insert reviews" ON book_reviews
  FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated users can update reviews
CREATE POLICY "Authenticated can update reviews" ON book_reviews
  FOR UPDATE TO authenticated USING (true);

-- Authenticated users can delete reviews
CREATE POLICY "Authenticated can delete reviews" ON book_reviews
  FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_book_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER book_reviews_updated_at
  BEFORE UPDATE ON book_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_book_reviews_updated_at();
