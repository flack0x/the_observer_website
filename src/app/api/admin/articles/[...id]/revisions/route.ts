import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string[] }>;
}

// GET /api/admin/articles/[...id]/revisions - Get article revisions
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Join array segments back into a single ID (handles slashes in telegram_id)
    const decodedId = id.join('/');

    // First get the article's internal ID
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('telegram_id', decodedId)
      .single();

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Fetch revisions with editor info
    const { data: revisions, error: revisionsError } = await supabase
      .from('article_revisions')
      .select(`
        id,
        title,
        content,
        created_at,
        edited_by,
        user_profiles!article_revisions_edited_by_fkey (
          full_name,
          email
        )
      `)
      .eq('article_id', article.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (revisionsError) {
      console.error('Error fetching revisions:', revisionsError);
      return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
    }

    return NextResponse.json({
      data: revisions || [],
    });
  } catch (error) {
    console.error('Error in revisions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
