import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const preferredRegion = 'bom1';

// GET /api/admin/books - List book reviews with filters
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

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const channel = searchParams.get('channel');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('book_reviews')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (channel && channel !== 'all') {
      query = query.eq('channel', channel);
    }
    if (search) {
      query = query.or(`book_title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: bookReviews, error, count } = await query;

    if (error) {
      console.error('Error fetching book reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch book reviews' }, { status: 500 });
    }

    return NextResponse.json({
      data: bookReviews,
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > to + 1,
    });
  } catch (error) {
    console.error('Error in book reviews API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/books - Create new book review
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

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Generate unique review_id for book reviews
    const timestamp = Date.now();
    const slug = body.book_title_en
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'untitled';

    // Create English book review
    const enReview = {
      review_id: `book/${timestamp}-${slug}-en`,
      channel: 'en',
      book_title: body.book_title_en || 'Untitled',
      author: body.author || 'Unknown',
      cover_image_url: body.cover_image_url || null,
      excerpt: body.excerpt_en || '',
      description: body.description_en || '',
      key_points: body.key_points_en || [],
      rating: body.rating || null,
      recommendation_level: body.recommendation_level || null,
      telegram_link: body.telegram_link_en || null,
      status: body.status || 'draft',
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      author_id: user.id,
      last_edited_by: user.id,
    };

    // Create Arabic book review
    const arReview = {
      review_id: `book/${timestamp}-${slug}-ar`,
      channel: 'ar',
      book_title: body.book_title_ar || body.book_title_en || 'Untitled',
      author: body.author || 'Unknown',
      cover_image_url: body.cover_image_url || null,
      excerpt: body.excerpt_ar || body.excerpt_en || '',
      description: body.description_ar || body.description_en || '',
      key_points: body.key_points_ar || body.key_points_en || [],
      rating: body.rating || null,
      recommendation_level: body.recommendation_level || null,
      telegram_link: body.telegram_link_ar || null,
      status: body.status || 'draft',
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      author_id: user.id,
      last_edited_by: user.id,
    };

    // Insert English review
    const { data: enData, error: enError } = await supabase
      .from('book_reviews')
      .insert(enReview)
      .select()
      .single();

    if (enError) {
      console.error('Error creating EN book review:', enError);
      return NextResponse.json({ error: 'Failed to create book review' }, { status: 500 });
    }

    // Insert Arabic review
    const { data: arData, error: arError } = await supabase
      .from('book_reviews')
      .insert(arReview)
      .select()
      .single();

    if (arError) {
      console.error('Error creating AR book review:', arError);
      // Rollback EN review
      await supabase.from('book_reviews').delete().eq('id', enData.id);
      return NextResponse.json({ error: 'Failed to create book review' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        en: enData,
        ar: arData,
      },
      message: 'Book review created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in create book review API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
