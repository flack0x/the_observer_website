-- Fix Supabase Security Advisor Warnings
-- 1. Set search_path on all functions missing it
-- 2. Restrict overly permissive RLS policies (book_reviews, article_shares)

-- ============================================
-- 1. FIX: Function search_path mutable
-- All functions need SECURITY DEFINER + SET search_path = public
-- ============================================

-- 1a. update_book_reviews_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_book_reviews_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1b. update_comment_count (trigger function)
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 1c. update_comment_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_comment_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1d. articles_search_vector_update (trigger function)
CREATE OR REPLACE FUNCTION public.articles_search_vector_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg regconfig;
BEGIN
  cfg := CASE WHEN NEW.channel = 'ar' THEN 'simple'::regconfig ELSE 'english'::regconfig END;
  NEW.search_vector :=
    setweight(to_tsvector(cfg, coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector(cfg, coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector(cfg, coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1e. increment_view_count (RPC function)
CREATE OR REPLACE FUNCTION public.increment_view_count(p_article_id BIGINT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE articles
    SET views = views + 1
    WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql;

-- 1f. guest_vote (RPC function)
CREATE OR REPLACE FUNCTION public.guest_vote(
  p_article_id BIGINT,
  p_session_id TEXT,
  p_interaction_type TEXT
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
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
$$ LANGUAGE plpgsql;

-- 1g. guest_unvote (RPC function)
CREATE OR REPLACE FUNCTION public.guest_unvote(
  p_article_id BIGINT,
  p_session_id TEXT
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM article_interactions
  WHERE article_id = p_article_id
    AND session_id = p_session_id
    AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 1h. update_article_interaction_counts (trigger function)
CREATE OR REPLACE FUNCTION public.update_article_interaction_counts()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.interaction_type = 'like' THEN
            UPDATE articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
        ELSIF NEW.interaction_type = 'dislike' THEN
            UPDATE articles SET dislikes_count = dislikes_count + 1 WHERE id = NEW.article_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.interaction_type != NEW.interaction_type THEN
            IF OLD.interaction_type = 'like' THEN
                UPDATE articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.article_id;
            ELSIF OLD.interaction_type = 'dislike' THEN
                UPDATE articles SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.article_id;
            END IF;
            IF NEW.interaction_type = 'like' THEN
                UPDATE articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
            ELSIF NEW.interaction_type = 'dislike' THEN
                UPDATE articles SET dislikes_count = dislikes_count + 1 WHERE id = NEW.article_id;
            END IF;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.interaction_type = 'like' THEN
            UPDATE articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.article_id;
        ELSIF OLD.interaction_type = 'dislike' THEN
            UPDATE articles SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.article_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 1i. guest_comment (RPC function)
CREATE OR REPLACE FUNCTION public.guest_comment(
  p_article_id BIGINT,
  p_session_id TEXT,
  p_guest_name TEXT,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_id UUID;
BEGIN
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
$$ LANGUAGE plpgsql;

-- 1j. guest_delete_comment (RPC function)
CREATE OR REPLACE FUNCTION public.guest_delete_comment(
  p_comment_id UUID,
  p_session_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. FIX: RLS Policy Always True
-- Restrict overly permissive policies to admin/editor roles
-- ============================================

-- 2a. book_reviews: Restrict INSERT/UPDATE/DELETE to admin/editor only
DROP POLICY IF EXISTS "Authenticated can insert reviews" ON book_reviews;
DROP POLICY IF EXISTS "Authenticated can update reviews" ON book_reviews;
DROP POLICY IF EXISTS "Authenticated can delete reviews" ON book_reviews;

CREATE POLICY "Staff can insert reviews" ON book_reviews
  FOR INSERT WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Staff can update reviews" ON book_reviews
  FOR UPDATE USING (
    (select auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (select auth.uid()) AND up.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete reviews" ON book_reviews
  FOR DELETE USING (
    (select auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (select auth.uid()) AND up.role = 'admin'
    )
  );

-- 2b. article_shares: Require valid article_id and platform
DROP POLICY IF EXISTS "Public can insert shares" ON article_shares;

CREATE POLICY "Public can insert shares" ON article_shares
  FOR INSERT WITH CHECK (
    article_id IS NOT NULL AND
    platform IS NOT NULL AND char_length(platform) >= 1
  );

-- 2c. subscribers: Add email format validation
DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;

CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (
    -- Require a valid-looking email
    email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
