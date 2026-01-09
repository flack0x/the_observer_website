/**
 * Test database connection and verify admin user
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  console.log('Testing database connection...\n');

  // Test 1: Check user_profiles table
  console.log('1. Checking user_profiles table:');
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (profilesError) {
    console.error('   Error:', profilesError.message);
  } else {
    console.log(`   Found ${profiles.length} user(s):`);
    profiles.forEach(p => {
      console.log(`   - ${p.email} (${p.role}) - ${p.full_name}`);
    });
  }

  // Test 2: Check articles table has new columns
  console.log('\n2. Checking articles table structure:');
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, status, author_id, published_at')
    .limit(3);

  if (articlesError) {
    console.error('   Error:', articlesError.message);
  } else {
    console.log(`   Found ${articles.length} article(s) with new columns`);
    if (articles.length > 0) {
      console.log('   Sample article:', articles[0].title?.substring(0, 50) + '...');
      console.log('   Status:', articles[0].status || 'null');
    }
  }

  // Test 3: Check auth users
  console.log('\n3. Checking Supabase Auth users:');
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('   Error:', authError.message);
  } else {
    console.log(`   Found ${users.length} auth user(s):`);
    users.forEach(u => {
      console.log(`   - ${u.email} (confirmed: ${u.email_confirmed_at ? 'yes' : 'no'})`);
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('Database connection test complete!');
}

testConnection();
