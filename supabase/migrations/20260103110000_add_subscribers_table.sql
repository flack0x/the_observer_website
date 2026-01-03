-- Create subscribers table for newsletter signups
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  locale TEXT DEFAULT 'en',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Add index for active subscribers by locale
CREATE INDEX IF NOT EXISTS idx_subscribers_active_locale ON subscribers(is_active, locale);
