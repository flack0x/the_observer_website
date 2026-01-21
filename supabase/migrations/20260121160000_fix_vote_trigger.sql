-- Fix trigger to handle vote changes (UPDATE)
CREATE OR REPLACE FUNCTION update_article_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.interaction_type = 'like' THEN
            UPDATE articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
        ELSIF NEW.interaction_type = 'dislike' THEN
            UPDATE articles SET dislikes_count = dislikes_count + 1 WHERE id = NEW.article_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If interaction type changed
        IF OLD.interaction_type != NEW.interaction_type THEN
            -- Decrement old count
            IF OLD.interaction_type = 'like' THEN
                UPDATE articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.article_id;
            ELSIF OLD.interaction_type = 'dislike' THEN
                UPDATE articles SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.article_id;
            END IF;
            
            -- Increment new count
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger to include UPDATE
DROP TRIGGER IF EXISTS update_interaction_counts ON article_interactions;
CREATE TRIGGER update_interaction_counts
    AFTER INSERT OR UPDATE OR DELETE ON article_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_article_interaction_counts();
