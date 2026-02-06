/**
 * Cleanup Script for Test Data
 *
 * Run this after E2E tests to clean up any test data created during testing.
 *
 * Usage:
 *   npx ts-node tests/cleanup-test-data.ts
 *
 * Or add to package.json:
 *   "test:cleanup": "ts-node tests/cleanup-test-data.ts"
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const TEST_PREFIX = 'test-playwright-';

async function cleanup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL');
    console.error('  SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('Cleaning up test data...');
  console.log(`Looking for session IDs starting with: ${TEST_PREFIX}`);

  try {
    // Count test votes before deletion
    const { count: voteCount } = await supabase
      .from('article_interactions')
      .select('*', { count: 'exact', head: true })
      .like('session_id', `${TEST_PREFIX}%`);

    console.log(`Found ${voteCount || 0} test votes to delete`);

    // Delete test votes
    if (voteCount && voteCount > 0) {
      const { error: voteError } = await supabase
        .from('article_interactions')
        .delete()
        .like('session_id', `${TEST_PREFIX}%`);

      if (voteError) {
        console.error('Error deleting test votes:', voteError);
      } else {
        console.log(`Deleted ${voteCount} test votes`);
      }
    }

    // Count test comments before deletion
    const { count: commentCount } = await supabase
      .from('article_comments')
      .select('*', { count: 'exact', head: true })
      .like('session_id', `${TEST_PREFIX}%`);

    console.log(`Found ${commentCount || 0} test comments to delete`);

    // Delete test comments
    if (commentCount && commentCount > 0) {
      const { error: commentError } = await supabase
        .from('article_comments')
        .delete()
        .like('session_id', `${TEST_PREFIX}%`);

      if (commentError) {
        console.error('Error deleting test comments:', commentError);
      } else {
        console.log(`Deleted ${commentCount} test comments`);
      }
    }

    // Count test shares
    const { count: shareCount } = await supabase
      .from('article_shares')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null); // Anonymous shares (might be from tests)

    console.log(`Found ${shareCount || 0} anonymous shares (may include test shares)`);

    console.log('\nCleanup complete!');

  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
