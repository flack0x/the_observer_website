-- Create secure RPC functions for guest voting
-- These bypass RLS and validate ownership via session_id parameter

-- Function to add or change a guest vote
CREATE OR REPLACE FUNCTION guest_vote(
  p_article_id BIGINT,
  p_session_id TEXT,
  p_interaction_type TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Validate interaction type
  IF p_interaction_type NOT IN ('like', 'dislike') THEN
    RAISE EXCEPTION 'Invalid interaction type';
  END IF;

  -- Delete existing vote for this session
  DELETE FROM article_interactions
  WHERE article_id = p_article_id
    AND session_id = p_session_id
    AND user_id IS NULL;

  -- Insert new vote
  INSERT INTO article_interactions (article_id, session_id, interaction_type)
  VALUES (p_article_id, p_session_id, p_interaction_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a guest vote
CREATE OR REPLACE FUNCTION guest_unvote(
  p_article_id BIGINT,
  p_session_id TEXT
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM article_interactions
  WHERE article_id = p_article_id
    AND session_id = p_session_id
    AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anonymous users
GRANT EXECUTE ON FUNCTION guest_vote TO anon, authenticated;
GRANT EXECUTE ON FUNCTION guest_unvote TO anon, authenticated;

-- Tighten the RLS policies for guest operations
-- Remove the overly permissive policies
DROP POLICY IF EXISTS "Guest modify access" ON article_interactions;
DROP POLICY IF EXISTS "Guest delete access" ON article_interactions;

-- Guests can only modify/delete via the RPC functions (SECURITY DEFINER)
-- Authenticated users can still modify their own votes directly
CREATE POLICY "Auth users can modify own interactions" ON article_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Auth users can delete own interactions" ON article_interactions
    FOR DELETE USING (auth.uid() = user_id);
