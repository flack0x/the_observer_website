/**
 * Backfill slugs for all existing articles.
 *
 * Usage: node scripts/backfill_slugs.js
 *
 * This script:
 * 1. Fetches all articles from Supabase
 * 2. Generates a slug from each article's title
 * 3. Handles collisions by appending -2, -3, etc.
 * 4. Updates all articles with their new slugs
 * 5. Applies NOT NULL constraint and unique index
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Same logic as src/lib/slugify.ts
function generateSlug(title, fallbackId) {
  let text = title.replace(/<[^>]*>/g, '');
  text = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  let slug = text
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
    .replace(/-+$/, '');

  if (slug.length < 5) {
    const source = fallbackId || title;
    let h = 0;
    for (let i = 0; i < source.length; i++) {
      h = ((h << 5) - h + source.charCodeAt(i)) | 0;
    }
    const hash = (h >>> 0).toString(16).padStart(8, '0');
    slug = `article-${hash}`;
  }

  return slug;
}

async function backfillSlugs() {
  console.log('Backfilling article slugs...\n');

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, channel, telegram_id')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching articles:', error.message);
    process.exit(1);
  }

  console.log(`Found ${articles.length} articles\n`);

  // Track used slugs per channel for collision detection
  const usedSlugs = {}; // { channel: Set }

  const updates = [];

  for (const article of articles) {
    const channel = article.channel || 'en';
    if (!usedSlugs[channel]) usedSlugs[channel] = new Set();

    let baseSlug = generateSlug(article.title || '', article.telegram_id || String(article.id));
    let slug = baseSlug;
    let counter = 2;

    while (usedSlugs[channel].has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    usedSlugs[channel].add(slug);
    updates.push({ id: article.id, slug });
  }

  // Batch update in chunks of 50
  const BATCH_SIZE = 50;
  let updated = 0;

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);

    const promises = batch.map(({ id, slug }) =>
      supabase.from('articles').update({ slug }).eq('id', id)
    );

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.error) {
        console.error('Update error:', result.error.message);
      } else {
        updated++;
      }
    }

    console.log(`Updated ${Math.min(i + BATCH_SIZE, updates.length)} / ${updates.length}`);
  }

  console.log(`\nSuccessfully updated ${updated} articles with slugs`);

  // Apply NOT NULL constraint and unique index
  console.log('\nApplying NOT NULL constraint...');
  const { error: notNullError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE articles ALTER COLUMN slug SET NOT NULL'
  });

  if (notNullError) {
    console.log('Note: Could not apply NOT NULL via RPC. Run manually:');
    console.log('  ALTER TABLE articles ALTER COLUMN slug SET NOT NULL;');
  } else {
    console.log('NOT NULL constraint applied');
  }

  console.log('\nCreating unique index...');
  const { error: indexError } = await supabase.rpc('exec_sql', {
    sql: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug_channel ON articles(slug, channel)'
  });

  if (indexError) {
    console.log('Note: Could not create index via RPC. Run manually:');
    console.log('  CREATE UNIQUE INDEX idx_articles_slug_channel ON articles(slug, channel);');
  } else {
    console.log('Unique index created');
  }

  // Print a sample
  console.log('\nSample slugs:');
  for (const u of updates.slice(0, 10)) {
    const art = articles.find(a => a.id === u.id);
    console.log(`  ${art.telegram_id || art.id} → ${u.slug}`);
  }

  console.log('\nDone!');
}

backfillSlugs();
