-- Activity Log Migration
-- Tracks all admin actions for audit trail

-- ============================================
-- 1. ACTIVITY LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'publish', 'unpublish', 'delete', 'upload', 'role_change')),
    target_type TEXT NOT NULL CHECK (target_type IN ('article', 'media', 'user')),
    target_id TEXT,
    target_title TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_target_type ON activity_log(target_type);

-- ============================================
-- 2. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Staff can read activity log
CREATE POLICY "Staff can read activity log" ON activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Staff can create activity log entries
CREATE POLICY "Staff can create activity log" ON activity_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Service role has full access
CREATE POLICY "Service role full access on activity_log" ON activity_log
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT ON activity_log TO authenticated;
GRANT ALL ON activity_log TO service_role;
