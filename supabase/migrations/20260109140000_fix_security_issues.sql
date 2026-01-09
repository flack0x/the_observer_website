-- Fix Security Issues from Supabase Linter

-- ============================================
-- 1. FIX: RLS Disabled on subscribers table
-- ============================================

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert their email)
CREATE POLICY "Anyone can subscribe" ON subscribers
    FOR INSERT WITH CHECK (true);

-- Only service role can read/manage subscribers
CREATE POLICY "Service role manages subscribers" ON subscribers
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete subscribers" ON subscribers
    FOR DELETE USING (auth.role() = 'service_role');

-- ============================================
-- 2. FIX: Function search_path mutable
-- ============================================

-- Fix handle_new_user function with immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix update_updated_at_column function with immutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. FIX: RLS Policy Always True on metrics
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow service role to manage metrics" ON metrics;

-- Create more specific policies
CREATE POLICY "Anyone can read metrics" ON metrics
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert metrics" ON metrics
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update metrics" ON metrics
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete metrics" ON metrics
    FOR DELETE USING (auth.role() = 'service_role');
