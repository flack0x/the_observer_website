/**
 * Test Utilities for Write Operations
 *
 * This module provides utilities for testing write operations (voting, comments)
 * on the real database without affecting real user data.
 *
 * Strategy:
 * 1. Use unique test session IDs prefixed with "test-"
 * 2. Create test data during tests
 * 3. Clean up test data after tests complete
 */

import { createClient } from '@supabase/supabase-js';

// Test session prefix - all test data uses this
export const TEST_PREFIX = 'test-playwright-';

// Generate unique test session ID
export function generateTestSessionId(): string {
  return `${TEST_PREFIX}${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// Create a Supabase client for test cleanup (requires service role key)
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Test cleanup requires SUPABASE_SERVICE_ROLE_KEY in environment');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// Clean up all test data (run after tests)
export async function cleanupTestData() {
  const supabase = createTestClient();
  if (!supabase) return;

  try {
    // Delete test votes (session_id starts with test prefix)
    await supabase
      .from('article_interactions')
      .delete()
      .like('session_id', `${TEST_PREFIX}%`);

    // Delete test comments (session_id starts with test prefix)
    await supabase
      .from('article_comments')
      .delete()
      .like('session_id', `${TEST_PREFIX}%`);

    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

// Get a real article ID for testing (first published article)
export async function getTestArticleId(): Promise<number | null> {
  const supabase = createTestClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('articles')
    .select('id')
    .eq('status', 'published')
    .eq('channel', 'en')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  return data?.id || null;
}

// Test data interface
export interface TestContext {
  sessionId: string;
  articleId: number | null;
}

// Initialize test context
export async function initTestContext(): Promise<TestContext> {
  const sessionId = generateTestSessionId();
  const articleId = await getTestArticleId();

  return { sessionId, articleId };
}
