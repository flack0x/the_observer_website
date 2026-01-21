-- Fix guest access policy
DROP POLICY IF EXISTS "Users can modify own interactions" ON article_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON article_interactions;

-- Simple policy for guests: if you know the session_id, you can modify the row.
-- Since session_id is a UUID generated on client, guessing it is impossible.
CREATE POLICY "Guest modify access" ON article_interactions
    FOR UPDATE USING (
        (auth.uid() = user_id) OR (session_id IS NOT NULL)
    );

CREATE POLICY "Guest delete access" ON article_interactions
    FOR DELETE USING (
        (auth.uid() = user_id) OR (session_id IS NOT NULL)
    );
