
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testGuestVote() {
  console.log('--- Testing Guest Vote & Triggers ---');

  // 1. Pick an article
  const { data: articles } = await supabase.from('articles').select('id, title, likes_count').limit(1);
  if (!articles || articles.length === 0) return console.error('No articles found');
  
  const article = articles[0];
  console.log(`Article: ${article.id} | Likes: ${article.likes_count}`);
  const initialLikes = article.likes_count || 0;

  // 2. Insert Guest Vote
  const sessionId = `test_guest_${Date.now()}`;
  console.log(`Inserting guest vote with session_id: ${sessionId}`);
  
  const { error: insertError } = await supabase
    .from('article_interactions')
    .insert({
      article_id: article.id,
      interaction_type: 'like',
      session_id: sessionId
    });

  if (insertError) {
    console.error('Insert Failed:', insertError);
    return;
  }

  // 3. Check Count
  const { data: updated } = await supabase.from('articles').select('likes_count').eq('id', article.id).single();
  console.log(`New Likes Count: ${updated.likes_count}`);

  if (updated.likes_count === initialLikes + 1) {
    console.log('✅ Trigger Success: Guest vote counted.');
  } else {
    console.log('❌ Trigger Failure: Count did not update.');
  }

  // Cleanup
  await supabase.from('article_interactions').delete().eq('session_id', sessionId);
}

testGuestVote();
