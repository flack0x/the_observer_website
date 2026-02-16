-- Fix: guest_delete_comment has type mismatch
-- ROW_COUNT returns integer, not boolean

CREATE OR REPLACE FUNCTION public.guest_delete_comment(
  p_comment_id UUID,
  p_session_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM article_comments
  WHERE id = p_comment_id
    AND session_id = p_session_id
    AND user_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;
