-- Add telegram_message_id and source columns to article_comments
-- for syncing Telegram discussion group comments to the website

-- Dedup key for Telegram comments: format is {discussion_group_id}/{message_id}
ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS telegram_message_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_comments_telegram_msg_id
  ON article_comments(telegram_message_id) WHERE telegram_message_id IS NOT NULL;

-- Source field to distinguish website vs telegram comments
ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website'
  CHECK (source IN ('website', 'telegram'));
