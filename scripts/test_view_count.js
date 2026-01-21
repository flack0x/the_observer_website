
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testViewCount() {
  console.log('--- Testing View Counter ---');

  // 1. Get an article (any article)
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, views')
    .limit(1);

  if (fetchError || !articles || articles.length === 0) {
    console.error('Failed to fetch article:', fetchError);
    return;
  }

  const article = articles[0];
  const initialViews = article.views || 0;
  console.log(`Article: "${article.title.substring(0, 30)}..." (ID: ${article.id})`);
  console.log(`Initial Views: ${initialViews}`);

  // 2. Call the RPC function to increment
  console.log('Calling increment_view_count...');
  const { error: rpcError } = await supabase.rpc('increment_view_count', { 
    p_article_id: article.id 
  });

  if (rpcError) {
    console.error('RPC Failed:', rpcError);
    return;
  }

  // 3. Fetch again to verify
  const { data: updatedArticles } = await supabase
    .from('articles')
    .select('views')
    .eq('id', article.id)
    .single();

  const newViews = updatedArticles.views;
  console.log(`New Views: ${newViews}`);

  if (newViews === initialViews + 1) {
    console.log('✅ SUCCESS: View count incremented by 1.');
  } else {
    console.error(`❌ FAILURE: Expected ${initialViews + 1}, got ${newViews}`);
  }
}

testViewCount();
