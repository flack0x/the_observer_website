import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/admin/logActivity';
import { generateSlug } from '@/lib/slugify';

// GET /api/admin/articles - List articles with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const channel = searchParams.get('channel');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (channel && channel !== 'all') {
      query = query.eq('channel', channel);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('telegram_date', { ascending: false })
      .range(from, to);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    return NextResponse.json({
      data: articles,
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > to + 1,
    });
  } catch (error) {
    console.error('Error in articles API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Generate unique telegram_id for website articles
    const timestamp = Date.now();
    const idSlug = body.title_en
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'untitled';

    // Generate SEO-friendly slug and ensure uniqueness
    let articleSlug = generateSlug(body.title_en || 'Untitled', String(timestamp));
    // Check for existing slug in either channel
    const { data: existing } = await supabase
      .from('articles')
      .select('slug')
      .eq('slug', articleSlug)
      .limit(1);
    if (existing && existing.length > 0) {
      articleSlug = `${articleSlug}-${timestamp.toString(36).slice(-4)}`;
    }

    // Create English article
    const enArticle = {
      telegram_id: `website/${timestamp}-${idSlug}-en`,
      channel: 'en',
      slug: articleSlug,
      title: body.title_en || 'Untitled',
      excerpt: body.excerpt_en || '',
      content: body.content_en || '',
      category: body.category || 'Analysis',
      countries: body.countries || [],
      organizations: body.organizations || [],
      is_structured: true,
      telegram_link: `https://al-muraqeb.com/en/frontline/${articleSlug}`,
      telegram_date: new Date().toISOString(),
      image_url: body.image_url || null,
      video_url: body.video_url || null,
      author_id: user.id,
      status: body.status || 'draft',
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      last_edited_by: user.id,
    };

    // Create Arabic article
    const arArticle = {
      telegram_id: `website/${timestamp}-${idSlug}-ar`,
      channel: 'ar',
      slug: articleSlug,
      title: body.title_ar || body.title_en || 'Untitled',
      excerpt: body.excerpt_ar || body.excerpt_en || '',
      content: body.content_ar || body.content_en || '',
      category: body.category || 'Analysis',
      countries: body.countries || [],
      organizations: body.organizations || [],
      is_structured: true,
      telegram_link: `https://al-muraqeb.com/ar/frontline/${articleSlug}`,
      telegram_date: new Date().toISOString(),
      image_url: body.image_url || null,
      video_url: body.video_url || null,
      author_id: user.id,
      status: body.status || 'draft',
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      last_edited_by: user.id,
    };

    // Insert both articles
    const { data: enData, error: enError } = await supabase
      .from('articles')
      .insert(enArticle)
      .select()
      .single();

    if (enError) {
      console.error('Error creating EN article:', enError);
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }

    const { data: arData, error: arError } = await supabase
      .from('articles')
      .insert(arArticle)
      .select()
      .single();

    if (arError) {
      console.error('Error creating AR article:', arError);
      // Rollback EN article
      await supabase.from('articles').delete().eq('id', enData.id);
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }

    // Log activity
    await logActivity(
      supabase,
      user.id,
      'create',
      'article',
      enData.telegram_id,
      enData.title,
      { channel: 'website', status: body.status || 'draft' }
    );

    return NextResponse.json({
      data: {
        en: enData,
        ar: arData,
      },
      message: 'Article created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in create article API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
