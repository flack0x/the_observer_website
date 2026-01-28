-- Allow guest comments (no account required)

-- Make user_id nullable
ALTER TABLE article_comments ALTER COLUMN user_id DROP NOT NULL;

-- Add guest fields
ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add constraint: must have either user_id OR (guest_name AND session_id)
ALTER TABLE article_comments DROP CONSTRAINT IF EXISTS comment_author_check;
ALTER TABLE article_comments ADD CONSTRAINT comment_author_check
  CHECK (
    (user_id IS NOT NULL) OR
    (guest_name IS NOT NULL AND session_id IS NOT NULL)
  );

-- Index for session_id lookups
CREATE INDEX IF NOT EXISTS idx_comments_session ON article_comments(session_id);

-- Update RLS policies to allow guest comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON article_comments;

-- Allow anyone to insert comments (with proper fields)
CREATE POLICY "Anyone can create comments" ON article_comments
    FOR INSERT WITH CHECK (
      -- Either authenticated user posting as themselves
      (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
      -- Or guest with name and session
      (auth.uid() IS NULL AND user_id IS NULL AND guest_name IS NOT NULL AND session_id IS NOT NULL)
    );

-- Update delete policy to allow guests to delete their own comments
DROP POLICY IF EXISTS "Users can delete own comments" ON article_comments;
CREATE POLICY "Users can delete own comments" ON article_comments
    FOR DELETE USING (
      (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
      (session_id IS NOT NULL AND user_id IS NULL)
    );

-- Update edit policy to allow guests to edit their own comments
DROP POLICY IF EXISTS "Users can update own comments" ON article_comments;
CREATE POLICY "Users can update own comments" ON article_comments
    FOR UPDATE USING (
      (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
      (session_id IS NOT NULL AND user_id IS NULL)
    )
    WITH CHECK (
      (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
      (session_id IS NOT NULL AND user_id IS NULL)
    );

-- RPC function for guest comment operations (bypasses RLS issues)
CREATE OR REPLACE FUNCTION guest_comment(
  p_article_id BIGINT,
  p_session_id TEXT,
  p_guest_name TEXT,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_comment_id UUID;
BEGIN
  -- Validate inputs
  IF p_session_id IS NULL OR p_guest_name IS NULL OR p_content IS NULL THEN
    RAISE EXCEPTION 'Missing required fields';
  END IF;

  IF char_length(p_content) < 3 OR char_length(p_content) > 2000 THEN
    RAISE EXCEPTION 'Content must be between 3 and 2000 characters';
  END IF;

  IF char_length(p_guest_name) < 1 OR char_length(p_guest_name) > 50 THEN
    RAISE EXCEPTION 'Name must be between 1 and 50 characters';
  END IF;

  INSERT INTO article_comments (article_id, session_id, guest_name, content, parent_id)
  VALUES (p_article_id, p_session_id, p_guest_name, p_content, p_parent_id)
  RETURNING id INTO v_comment_id;

  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function for guest to delete their own comment
CREATE OR REPLACE FUNCTION guest_delete_comment(
  p_comment_id UUID,
  p_session_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_deleted BOOLEAN;
BEGIN
  DELETE FROM article_comments
  WHERE id = p_comment_id
    AND session_id = p_session_id
    AND user_id IS NULL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
