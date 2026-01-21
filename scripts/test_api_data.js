
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testApi() {
  const url = 'http://localhost:3000/api/articles?limit=1';
  console.log(`Fetching ${url}...`);
  try {
    // Note: This requires the server to be running. Since I can't guarantee localhost:3000 is accessible
    // from this environment (it's a CLI environment, not the browser), I might not be able to fetch the local API.
    // However, I can check the Supabase data directly to see if dislikes_count is > 0 for any article.
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data } = await supabase
      .from('articles')
      .select('title, dislikes_count')
      .gt('dislikes_count', 0)
      .limit(5);
      
    console.log('Articles with dislikes:', data);
  } catch (e) {
    console.error(e);
  }
}

testApi();
